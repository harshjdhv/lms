import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@workspace/database";

export const maxDuration = 60;

/**
 * Transcript Segment types for API response parsing.
 * The external API returns start/duration/text.
 */
export type TranscriptSegment = {
  start: number;
  text: string;
  duration?: number;
};

/**
 * Calls the Transcript API (v2) to fetch YouTube transcript.
 * Docs: https://transcriptapi.com
 */
async function fetchTranscriptFromApi(
  videoUrl: string,
): Promise<TranscriptSegment[]> {
  const apiKey = process.env.TRANSCRIPT_API_KEY;
  if (!apiKey) {
    throw new Error("Missing TRANSCRIPT_API_KEY environment variable");
  }

  const apiUrl = new URL("https://transcriptapi.com/api/v2/youtube/transcript");
  apiUrl.searchParams.set("video_url", videoUrl);
  apiUrl.searchParams.set("include_timestamp", "true");
  apiUrl.searchParams.set("format", "json");

  console.log("[transcript-api] Fetching transcript for:", videoUrl);

  const res = await fetch(apiUrl.toString(), {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    let errorDetail = "";
    try {
      const errJson = await res.json();
      errorDetail =
        errJson.detail?.message || errJson.detail || "Unknown error";
    } catch {
      errorDetail = await res.text();
    }

    // Log rate limit headers if present
    if (res.status === 429) {
      console.warn(
        "[transcript-api] Rate limited. Retry-After:",
        res.headers.get("Retry-After"),
      );
    }

    throw new Error(`Transcript API error (${res.status}): ${errorDetail}`);
  }

  const data = await res.json();
  const segments = data.transcript;

  if (!Array.isArray(segments)) {
    throw new Error("Invalid transcript format received from API");
  }

  // Normalize to our schema { start, text }
  // API v2 returns: { text: "...", start: 0.0, duration: 4.12 }
  return segments
    .map((s: any) => ({
      start: typeof s.start === "number" ? s.start : 0,
      text: (s.text || "").trim(),
    }))
    .filter((s) => s.text.length > 0);
}

/**
 * GET ?chapterId=...
 * Fetches transcript using the new external Transcript API.
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

    // 1. Get Chapter & Check Cache
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: {
        videoUrl: true,
        transcriptJson: true,
      },
    });

    if (!chapter?.videoUrl) {
      return NextResponse.json(
        { error: "Chapter not found or has no video" },
        { status: 404 },
      );
    }

    // Return cached if valid
    if (
      Array.isArray(chapter.transcriptJson) &&
      chapter.transcriptJson.length > 0
    ) {
      return NextResponse.json({
        segments: chapter.transcriptJson,
        fromCache: true,
      });
    }

    // 2. Fetch from External API
    const segments = await fetchTranscriptFromApi(chapter.videoUrl);

    if (segments.length === 0) {
      return NextResponse.json(
        {
          error: "No transcript found for this video.",
          fromCache: false,
        },
        { status: 404 },
      );
    }

    // 3. Save to DB
    await prisma.chapter.update({
      where: { id: chapterId },
      data: { transcriptJson: segments },
    });

    return NextResponse.json({ segments, fromCache: false });
  } catch (error) {
    console.error("[transcript-api] GET Handler Error:", error);

    const message =
      error instanceof Error ? error.message : "Internal Server Error";

    // Pass through specific API status codes if we can detect them, generally map to 500 or 502
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST { chapterId } — Fetch transcript and save to chapter (YouTube captions or trigger STT for direct media).
 * Response: { ok: true, segmentsCount } | { status: "processing", jobId }
 */
/**
 * POST { chapterId } — Fetch transcript and save to chapter using the Transcript API.
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
      select: {
        videoUrl: true,
        transcriptJson: true,
      },
    });

    if (!chapter?.videoUrl) {
      return NextResponse.json(
        { error: "Chapter not found or has no video" },
        { status: 404 },
      );
    }

    // Check cache
    const cached = chapter.transcriptJson as TranscriptSegment[] | null;
    if (Array.isArray(cached) && cached.length > 0) {
      return NextResponse.json({
        ok: true,
        segmentsCount: cached.length,
        fromCache: true,
      });
    }

    // Fetch from External API
    const segments = await fetchTranscriptFromApi(chapter.videoUrl);

    if (segments.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "No transcript found for this video.",
          fromCache: false,
        },
        { status: 404 },
      );
    }

    // Save to DB
    await prisma.chapter.update({
      where: { id: chapterId },
      data: { transcriptJson: segments },
    });

    return NextResponse.json({
      ok: true,
      segmentsCount: segments.length,
      fromCache: false,
    });
  } catch (error) {
    console.error("[transcript-api] POST Handler Error:", error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
