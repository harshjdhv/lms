import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@workspace/database";

// Extract YouTube video ID from URL or return as-is if already an ID
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

type TranscriptSegment = { offset?: number; start?: number; duration?: number; text?: string };

async function fetchYouTubeTranscript(videoId: string): Promise<TranscriptSegment[]> {
  const { YoutubeTranscript } = await import("youtube-transcript");
  const list = await YoutubeTranscript.fetchTranscript(videoId);
  return Array.isArray(list) ? list : [];
}

async function generateTopicsFromTranscript(
  segments: TranscriptSegment[],
  chapterTitle: string,
): Promise<{ time: number; topic: string }[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY not configured");
  }

  const text = segments
    .map((s) => {
      let start = (s as { start?: number }).start;
      if (typeof start !== "number" && typeof (s as { offset?: number }).offset === "number") {
        const offset = (s as { offset: number }).offset;
        start = offset >= 1000 ? offset / 1000 : offset;
      }
      start = typeof start === "number" ? start : 0;
      return `[${Math.round(start)}s] ${(s.text ?? "").trim()}`;
    })
    .filter(Boolean)
    .join("\n");

  if (!text.trim()) {
    return [];
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are an expert educational assistant. Given a video transcript with timestamps, identify 3-6 distinct topics or concepts covered, and for each topic provide an approximate timestamp (in seconds) where that topic is introduced or discussed. Return ONLY a valid JSON array of objects with keys "time" (number, seconds) and "topic" (string). Example: [{"time": 45, "topic": "Introduction to variables"}, {"time": 120, "topic": "Conditional logic"}]. Use timestamps from the transcript. Be concise.`,
        },
        {
          role: "user",
          content: `Chapter: ${chapterTitle}\n\nTranscript:\n${text.slice(0, 12000)}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) return [];

  try {
    const parsed = JSON.parse(content);
    const list = Array.isArray(parsed) ? parsed : parsed.points ?? parsed.topics ?? [];
    return list
      .filter((p: unknown) => p && typeof (p as { time?: number }).time === "number" && typeof (p as { topic?: string }).topic === "string")
      .map((p: { time: number; topic: string }) => ({
        time: Math.max(0, Math.round((p as { time: number }).time)),
        topic: String((p as { topic: string }).topic).slice(0, 200),
      }))
      .sort((a: { time: number }, b: { time: number }) => a.time - b.time);
  } catch {
    return [];
  }
}

/**
 * POST: Generate reflection topics from video transcript.
 * Body: { videoId?: string, chapterId?: string }
 * If chapterId is provided, fetches chapter and uses its videoUrl.
 * Returns { points: { time, topic }[] } and optionally saves to DB when chapterId is provided.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { videoId: inputVideoId, chapterId, save = false } = body as {
      videoId?: string;
      chapterId?: string;
      save?: boolean;
    };

    let videoId: string | null = inputVideoId ? extractVideoId(inputVideoId) : null;
    let chapterTitle = "Video";

    if (chapterId && !videoId) {
      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        select: { videoUrl: true, title: true },
      });
      if (!chapter?.videoUrl) {
        return NextResponse.json(
          { error: "Chapter not found or has no video" },
          { status: 404 },
        );
      }
      videoId = extractVideoId(chapter.videoUrl);
      chapterTitle = chapter.title ?? chapterTitle;
    }

    if (!videoId) {
      return NextResponse.json(
        { error: "videoId or chapterId with video is required" },
        { status: 400 },
      );
    }

    const segments = await fetchYouTubeTranscript(videoId);
    if (segments.length === 0) {
      return NextResponse.json(
        { error: "No transcript available for this video", points: [] },
        { status: 200 },
      );
    }

    const points = await generateTopicsFromTranscript(segments, chapterTitle);
    if (points.length === 0) {
      return NextResponse.json({
        message: "Could not generate topics from transcript",
        points: [],
      });
    }

    if (save && chapterId) {
      await prisma.reflectionPoint.deleteMany({ where: { chapterId } });
      await prisma.reflectionPoint.createMany({
        data: points.map((p) => ({
          chapterId,
          time: p.time,
          topic: p.topic,
        })),
      });
    }

    return NextResponse.json({
      videoId,
      chapterId: chapterId ?? null,
      points,
      saved: Boolean(save && chapterId),
    });
  } catch (error) {
    console.error("Transcript topics error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate topics from transcript" },
      { status: 500 },
    );
  }
}
