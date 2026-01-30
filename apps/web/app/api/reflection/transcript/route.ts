import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@workspace/database";
import {
  extractVideoId,
  isYouTubeUrl,
  isDirectMediaUrl,
  submitSttJob,
  isSttConfigured,
  type TranscriptSegment,
} from "@/lib/transcript";

export const maxDuration = 60;

export type { TranscriptSegment };

/** youtube-transcript returns { text, offset (seconds), duration } */
function normalizeSegment(raw: Record<string, unknown>): { start: number; text: string } | null {
  const text = typeof raw.text === "string" ? raw.text.trim() : "";
  if (!text) return null;

  let start = 0;
  if (typeof raw.offset === "number") {
    start = raw.offset >= 1000 ? raw.offset / 1000 : raw.offset;
  } else if (typeof raw.start === "number") {
    start = raw.start >= 1000 ? raw.start / 1000 : raw.start;
  } else if (typeof raw.startMs === "number") {
    start = raw.startMs / 1000;
  }
  return { start, text };
}

async function fetchYouTubeTranscript(
  videoId: string,
  videoUrl?: string | null,
): Promise<TranscriptSegment[]> {
  const { YoutubeTranscript } = await import("youtube-transcript");
  const input = videoUrl?.trim() && videoUrl.includes(videoId) ? videoUrl : videoId;
  let list: unknown;
  try {
    list = await YoutubeTranscript.fetchTranscript(input);
  } catch (err) {
    console.warn("[transcript] fetchTranscript threw for", videoId, err);
    throw err;
  }
  if (!Array.isArray(list)) {
    console.warn("[transcript] fetchTranscript did not return an array:", typeof list);
    return [];
  }
  if (list.length === 0) {
    console.warn("[transcript] fetchTranscript returned empty array for videoId:", videoId);
    return [];
  }

  const segments: TranscriptSegment[] = [];
  for (const item of list) {
    const raw = item as Record<string, unknown>;
    const seg = normalizeSegment(raw);
    if (seg) segments.push(seg);
  }
  return segments;
}

/**
 * GET ?chapterId=... — Return transcript for chapter (from DB, YouTube captions, or trigger STT for direct media).
 * Response: { segments, fromCache } | { status: "processing", jobId }
 */
export async function GET(request: NextRequest) {
  try {
    const chapterId = request.nextUrl.searchParams.get("chapterId");
    if (!chapterId) {
      return NextResponse.json({ error: "chapterId required" }, { status: 400 });
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: {
        videoUrl: true,
        transcriptJson: true,
        transcriptJobId: true,
        transcriptJobProvider: true,
      },
    });

    if (!chapter?.videoUrl) {
      return NextResponse.json(
        { error: "Chapter not found or has no video" },
        { status: 404 },
      );
    }

    const cached = chapter.transcriptJson as TranscriptSegment[] | null;
    if (Array.isArray(cached) && cached.length > 0) {
      return NextResponse.json({ segments: cached, fromCache: true });
    }

    if (chapter.transcriptJobId && !cached?.length) {
      return NextResponse.json({
        status: "processing",
        jobId: chapter.transcriptJobId,
      });
    }

    const videoUrl = chapter.videoUrl.trim();

    if (isYouTubeUrl(videoUrl)) {
      const videoId = extractVideoId(videoUrl)!;
      const segments = await fetchYouTubeTranscript(videoId, videoUrl);
      if (segments.length === 0) {
        return NextResponse.json(
          {
            error: "No transcript available",
            segments: [],
            fromCache: false,
            hint: "Ensure the video has captions/subtitles enabled on YouTube.",
          },
          { status: 200 },
        );
      }
      await prisma.chapter.update({
        where: { id: chapterId },
        data: { transcriptJson: segments },
      });
      return NextResponse.json({ segments, fromCache: false });
    }

    if (isDirectMediaUrl(videoUrl)) {
      if (!isSttConfigured()) {
        return NextResponse.json(
          {
            error: "Captionless transcription not configured",
            hint: "Set DEEPGRAM_API_KEY or ASSEMBLYAI_API_KEY for direct media URLs.",
          },
          { status: 503 },
        );
      }
      try {
        const { provider, jobId } = await submitSttJob(videoUrl, chapterId);
        await prisma.chapter.update({
          where: { id: chapterId },
          data: {
            transcriptJobId: jobId,
            transcriptJobProvider: provider,
          },
        });
        return NextResponse.json({ status: "processing", jobId });
      } catch (err) {
        console.error("[transcript] STT submit error:", err);
        return NextResponse.json(
          { error: err instanceof Error ? err.message : "Failed to start transcription" },
          { status: 502 },
        );
      }
    }

    return NextResponse.json(
      {
        error: "Invalid video URL",
        hint: "Use a YouTube link or a direct media URL (e.g. .mp4, .mp3).",
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("Transcript GET error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get transcript" },
      { status: 500 },
    );
  }
}

/**
 * POST { chapterId } — Fetch transcript and save to chapter (YouTube captions or trigger STT for direct media).
 * Response: { ok: true, segmentsCount } | { status: "processing", jobId }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { chapterId } = body as { chapterId?: string };
    if (!chapterId) {
      return NextResponse.json({ error: "chapterId required" }, { status: 400 });
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: {
        videoUrl: true,
        transcriptJson: true,
        transcriptJobId: true,
        transcriptJobProvider: true,
      },
    });

    if (!chapter?.videoUrl) {
      return NextResponse.json(
        { error: "Chapter not found or has no video" },
        { status: 404 },
      );
    }

    const cached = chapter.transcriptJson as TranscriptSegment[] | null;
    if (Array.isArray(cached) && cached.length > 0) {
      return NextResponse.json({ ok: true, segmentsCount: cached.length });
    }

    if (chapter.transcriptJobId && !cached?.length) {
      return NextResponse.json({
        status: "processing",
        jobId: chapter.transcriptJobId,
      });
    }

    const videoUrl = chapter.videoUrl.trim();

    if (isYouTubeUrl(videoUrl)) {
      const videoId = extractVideoId(videoUrl)!;
      const segments = await fetchYouTubeTranscript(videoId, videoUrl);
      if (segments.length === 0) {
        return NextResponse.json(
          {
            ok: true,
            segmentsCount: 0,
            message: "No transcript available. Ensure the video has captions/subtitles enabled on YouTube.",
          },
          { status: 200 },
        );
      }
      await prisma.chapter.update({
        where: { id: chapterId },
        data: { transcriptJson: segments },
      });
      return NextResponse.json({ ok: true, segmentsCount: segments.length });
    }

    if (isDirectMediaUrl(videoUrl)) {
      if (!isSttConfigured()) {
        return NextResponse.json(
          {
            ok: false,
            error: "Captionless transcription not configured",
            message: "Set DEEPGRAM_API_KEY or ASSEMBLYAI_API_KEY for direct media URLs.",
          },
          { status: 503 },
        );
      }
      try {
        const { provider, jobId } = await submitSttJob(videoUrl, chapterId);
        await prisma.chapter.update({
          where: { id: chapterId },
          data: {
            transcriptJobId: jobId,
            transcriptJobProvider: provider,
          },
        });
        return NextResponse.json({ status: "processing", jobId });
      } catch (err) {
        console.error("[transcript] STT submit error:", err);
        return NextResponse.json(
          { error: err instanceof Error ? err.message : "Failed to start transcription" },
          { status: 502 },
        );
      }
    }

    return NextResponse.json(
      {
        ok: false,
        error: "Invalid video URL",
        message: "Use a YouTube link or a direct media URL (e.g. .mp4, .mp3).",
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("Transcript POST error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save transcript" },
      { status: 500 },
    );
  }
}
