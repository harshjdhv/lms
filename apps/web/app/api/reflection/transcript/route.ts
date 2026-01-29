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

async function fetchYouTubeTranscript(
  videoId: string,
  videoUrl?: string | null,
): Promise<TranscriptSegment[]> {
  const apiKey = process.env.TRANSCRIPT_API_KEY;
  if (!apiKey) {
    console.warn("TRANSCRIPT_API_KEY is not set");
    return [];
  }

  // Use the provided videoUrl if available, otherwise fallback to videoId
  // The API accepts a video_url or bare 11-char ID
  const queryParam =
    videoUrl?.trim() &&
    (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be"))
      ? videoUrl
      : videoId;

  const url = new URL("https://transcriptapi.com/api/v2/youtube/transcript");
  url.searchParams.set("video_url", queryParam);
  url.searchParams.set("format", "json");
  url.searchParams.set("include_timestamp", "true");

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      // cache: 'no-store' // dynamic fetch
    });

    if (!response.ok) {
      console.warn(
        `[transcript] API error: ${response.status} ${response.statusText}`,
      );
      if (response.status === 402) {
        console.error("[transcript] Payment Required - Check credits");
      }
      return [];
    }

    const data = await response.json();

    // Validate response structure
    // Schema: { transcript: [{ text, start, duration }, ...] }
    if (data && Array.isArray(data.transcript)) {
      return data.transcript.map((item: any) => ({
        start: typeof item.start === "number" ? item.start : 0,
        text: item.text || "",
      }));
    }

    return [];
  } catch (err) {
    console.warn("[transcript] fetchTranscript threw for", videoId, err);
    return [];
  }
}

/**
 * GET ?chapterId=... — Return transcript for chapter (from DB or fetch and save).
 * Response: { segments: { start, text }[], fromCache: boolean }
 */
export async function GET(request: NextRequest) {
  try {
    const chapterId = request.nextUrl.searchParams.get("chapterId");
    if (!chapterId) {
      return NextResponse.json(
        { error: "chapterId required" },
        { status: 400 },
      );
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
      return NextResponse.json({ error: "Invalid video URL" }, { status: 400 });
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
      {
        error:
          error instanceof Error ? error.message : "Failed to get transcript",
      },
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
      return NextResponse.json(
        { error: "chapterId required" },
        { status: 400 },
      );
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
      return NextResponse.json({ error: "Invalid video URL" }, { status: 400 });
    }

    const segments = await fetchYouTubeTranscript(videoId, chapter.videoUrl);
    if (segments.length === 0) {
      return NextResponse.json(
        {
          ok: true,
          segmentsCount: 0,
          message:
            "No transcript available. Ensure the video has captions/subtitles enabled on YouTube.",
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
      {
        error:
          error instanceof Error ? error.message : "Failed to save transcript",
      },
      { status: 500 },
    );
  }
}
