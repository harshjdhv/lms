import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@workspace/database";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> },
) {
  try {
    const { chapterId } = await params;
    const { time, topic } = await request.json();

    if (typeof time !== "number" || !topic) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const point = await prisma.reflectionPoint.create({
      data: {
        chapterId,
        time,
        topic,
      },
    });

    return NextResponse.json(point);
  } catch (error) {
    console.error("Create point error:", error);
    return NextResponse.json(
      { error: "Failed to create point" },
      { status: 500 },
    );
  }
}
