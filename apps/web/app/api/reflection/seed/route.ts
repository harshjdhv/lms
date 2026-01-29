import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@workspace/database";

// Seed reflection points for testing
export async function POST(request: NextRequest) {
  try {
    // Get all chapters to add reflection points
    const chapters = await prisma.chapter.findMany({
      where: { videoUrl: { not: null } },
    });

    let createdCount = 0;

    for (const chapter of chapters) {
      // Check if reflection points already exist
      const existingPoints = await prisma.reflectionPoint.findMany({
        where: { chapterId: chapter.id },
      });

      if (existingPoints.length === 0) {
        // Create sample reflection points for this chapter
        await prisma.reflectionPoint.createMany({
          data: [
            {
              chapterId: chapter.id,
              time: 30, // 30 seconds
              topic: "Introduction to Variables",
            },
            {
              chapterId: chapter.id,
              time: 90, // 1.5 minutes
              topic: "Data Types and Operations",
            },
            {
              chapterId: chapter.id,
              time: 180, // 3 minutes
              topic: "Functions and Methods",
            },
            {
              chapterId: chapter.id,
              time: 300, // 5 minutes
              topic: "Advanced Concepts",
            },
          ],
        });
        createdCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created reflection points for ${createdCount} chapters`,
      totalChapters: chapters.length,
      chaptersWithReflections: createdCount,
    });
  } catch (error) {
    console.error("Error seeding reflection points:", error);
    return NextResponse.json(
      { error: "Failed to seed reflection points" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get("chapterId");

    if (chapterId) {
      // Get reflection points for specific chapter
      const points = await prisma.reflectionPoint.findMany({
        where: { chapterId },
        orderBy: { time: "asc" },
      });

      return NextResponse.json({
        chapterId,
        reflectionPoints: points,
        count: points.length,
      });
    } else {
      // Get all reflection points with chapter info
      const allPoints = await prisma.reflectionPoint.findMany({
        include: {
          chapter: {
            select: {
              id: true,
              title: true,
              videoUrl: true,
            },
          },
        },
        orderBy: { chapter: { position: "asc" } },
      });

      return NextResponse.json({
        reflectionPoints: allPoints,
        total: allPoints.length,
      });
    }
  } catch (error) {
    console.error("Error fetching reflection points:", error);
    return NextResponse.json(
      { error: "Failed to fetch reflection points" },
      { status: 500 },
    );
  }
}
