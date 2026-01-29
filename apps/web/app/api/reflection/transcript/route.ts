import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@workspace/database";

function extractVideoId(urlOrId: string): string | null {
  if (!urlOrId?.trim()) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = urlOrId.trim().match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export type TranscriptSegment = { start: number; text: string };

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
  // Package accepts videoId or full URL; try URL first if we have it (some videos need it)
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
    console.warn("[transcript] fetchTranscript returned empty array for videoId:", videoId, "- Video may have captions disabled.");
    return [];
  }

  const segments: TranscriptSegment[] = [];
  for (const item of list) {
    const raw = item as Record<string, unknown>;
    const seg = normalizeSegment(raw);
    if (seg) segments.push(seg);
  }

  if (segments.length === 0 && list.length > 0) {
    const sample = list[0] as Record<string, unknown>;
    console.warn("[transcript] Segment keys:", Object.keys(sample), "sample:", JSON.stringify(sample).slice(0, 300));
  }
  return segments;
}

/**
 * GET ?chapterId=... — Return transcript for chapter (from DB or fetch and save).
 * Response: { segments: { start, text }[], fromCache: boolean }
 */
export async function GET(request: NextRequest) {
  try {
    const chapterId = request.nextUrl.searchParams.get("chapterId");
    if (!chapterId) {
      return NextResponse.json({ error: "chapterId required" }, { status: 400 });
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { videoUrl: true, transcriptJson: true },
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

    const videoId = extractVideoId(chapter.videoUrl);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid video URL" },
        { status: 400 },
      );
    }

    const segments = await fetchYouTubeTranscript(videoId, chapter.videoUrl);
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
  } catch (error) {
    console.error("Transcript GET error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get transcript" },
      { status: 500 },
    );
  }
}

/**
 * POST { chapterId } — Fetch transcript from YouTube and save to chapter (e.g. after upload).
 * Response: { ok: true, segmentsCount: number }
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
      select: { videoUrl: true },
    });

    if (!chapter?.videoUrl) {
      return NextResponse.json(
        { error: "Chapter not found or has no video" },
        { status: 404 },
      );
    }

    const videoId = extractVideoId(chapter.videoUrl);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid video URL" },
        { status: 400 },
      );
    }

    const segments = await fetchYouTubeTranscript(videoId, chapter.videoUrl);
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
  } catch (error) {
    console.error("Transcript POST error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save transcript" },
      { status: 500 },
    );
  }
}
