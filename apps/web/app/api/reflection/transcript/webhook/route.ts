import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@workspace/database";
import {
  normalizeDeepgramSegments,
  normalizeAssemblyAISegments,
  type TranscriptSegment,
} from "@/lib/transcript";

/**
 * POST: Receives callbacks from Deepgram or AssemblyAI when transcription is done.
 * Query: provider=deepgram|assemblyai, chapterId=...
 * Deepgram sends the full result in the body. AssemblyAI sends { transcript_id } and we GET the transcript.
 */
export async function POST(request: NextRequest) {
  try {
    const provider = request.nextUrl.searchParams.get("provider");
    const chapterId = request.nextUrl.searchParams.get("chapterId");

    if (!chapterId) {
      return NextResponse.json(
        { error: "chapterId required" },
        { status: 400 },
      );
    }
    if (provider !== "deepgram" && provider !== "assemblyai") {
      return NextResponse.json(
        { error: "provider must be deepgram or assemblyai" },
        { status: 400 },
      );
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { id: true, transcriptJobId: true, transcriptJobProvider: true },
    });

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    let segments: TranscriptSegment[] = [];

    if (provider === "deepgram") {
      const body = (await request.json()) as Record<string, unknown>;
      segments = normalizeDeepgramSegments(
        body as Parameters<typeof normalizeDeepgramSegments>[0],
      );
    } else {
      const body = (await request.json()) as {
        transcript_id?: string;
        id?: string;
      };
      const transcriptId = body.transcript_id ?? body.id;
      if (!transcriptId) {
        return NextResponse.json(
          { error: "Missing transcript_id in webhook body" },
          { status: 400 },
        );
      }
      const apiKey = process.env.ASSEMBLYAI_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "ASSEMBLYAI_API_KEY not configured" },
          { status: 500 },
        );
      }
      const res = await fetch(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        {
          headers: { Authorization: apiKey },
        },
      );
      if (!res.ok) {
        console.error(
          "[transcript/webhook] AssemblyAI GET transcript failed:",
          res.status,
          await res.text(),
        );
        return NextResponse.json(
          { error: "Failed to fetch transcript" },
          { status: 502 },
        );
      }
      const transcript = (await res.json()) as Record<string, unknown>;
      if (transcript.status === "error") {
        console.error(
          "[transcript/webhook] AssemblyAI transcript error:",
          transcript.error,
        );
        await prisma.chapter.update({
          where: { id: chapterId },
          data: { transcriptJobId: null, transcriptJobProvider: null },
        });
        return NextResponse.json(
          { error: "Transcript failed" },
          { status: 200 },
        );
      }
      segments = normalizeAssemblyAISegments(
        transcript as Parameters<typeof normalizeAssemblyAISegments>[0],
      );
    }

    if (segments.length > 0) {
      await prisma.chapter.update({
        where: { id: chapterId },
        data: {
          transcriptJson: segments,
          transcriptJobId: null,
          transcriptJobProvider: null,
        },
      });
    } else {
      await prisma.chapter.update({
        where: { id: chapterId },
        data: { transcriptJobId: null, transcriptJobProvider: null },
      });
    }

    return NextResponse.json({ ok: true, segmentsCount: segments.length });
  } catch (error) {
    console.error("Transcript webhook error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook failed" },
      { status: 500 },
    );
  }
}
