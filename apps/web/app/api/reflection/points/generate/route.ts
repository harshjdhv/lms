import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@workspace/database";
import { generateAndSaveReflectionPoints } from "@/lib/reflection";
import { type TranscriptSegment } from "@/lib/transcript";

export async function POST(request: NextRequest) {
  try {
    const { chapterId } = await request.json();

    if (!chapterId) {
      return NextResponse.json(
        { error: "chapterId required" },
        { status: 400 },
      );
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { reflectionPoints: true },
    });

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    const segments = chapter.transcriptJson as TranscriptSegment[] | null;

    if (!Array.isArray(segments) || segments.length === 0) {
      return NextResponse.json(
        {
          error: "No transcript found",
          message: "Please generate a transcript first.",
        },
        { status: 400 },
      );
    }

    await generateAndSaveReflectionPoints(chapterId, segments);

    const updatedPoints = await prisma.reflectionPoint.findMany({
      where: { chapterId },
      orderBy: { time: "asc" },
    });

    return NextResponse.json({
      success: true,
      count: updatedPoints.length,
      points: updatedPoints,
    });
  } catch (error) {
    console.error("Generate points error:", error);
    return NextResponse.json(
      { error: "Failed to generate points" },
      { status: 500 },
    );
  }
}
