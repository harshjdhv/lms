import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@workspace/database";

// Get all reflection points with chapter info for debugging
export async function GET(request: NextRequest) {
  try {
    // Get all chapters with videos and their reflection points
    const chapters = await prisma.chapter.findMany({
      where: {
        videoUrl: { not: null },
        isPublished: true,
      },
      include: {
        reflectionPoints: {
          orderBy: { time: "asc" },
        },
      },
      orderBy: { position: "asc" },
    });

    // Get student memory for additional context
    const studentMemory = await prisma.studentReflectionMemory.findMany({
      select: {
        userId: true,
        weakTopics: true,
        accuracyRate: true,
        totalAttempts: true,
        correctAttempts: true,
      },
    });

    const stats = {
      totalChapters: chapters.length,
      chaptersWithVideos: chapters.filter((c) => c.videoUrl).length,
      chaptersWithReflectionPoints: chapters.filter(
        (c) => c.reflectionPoints.length > 0,
      ).length,
      totalReflectionPoints: chapters.reduce(
        (sum, c) => sum + c.reflectionPoints.length,
        0,
      ),
      studentMemoryStats: {
        totalStudents: studentMemory.length,
        averageAccuracy:
          studentMemory.length > 0
            ? studentMemory.reduce((sum, m) => sum + m.accuracyRate, 0) /
              studentMemory.length
            : 0,
      },
    };

    // Format detailed chapter info
    const chapterDetails = chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      hasVideo: !!chapter.videoUrl,
      reflectionPointCount: chapter.reflectionPoints.length,
      reflectionPoints: chapter.reflectionPoints.map((point) => ({
        id: point.id,
        time: point.time,
        topic: point.topic,
        timeFormatted: `${Math.floor(point.time / 60)}:${(point.time % 60).toString().padStart(2, "0")}`,
      })),
    }));

    return NextResponse.json({
      success: true,
      stats,
      chapters: chapterDetails,
    });
  } catch (error) {
    console.error("Debug reflection points error:", error);
    return NextResponse.json(
      { error: "Failed to debug reflection points", details: error },
      { status: 500 },
    );
  }
}

// Quick setup for a specific chapter
export async function POST(request: NextRequest) {
  try {
    const { chapterId } = await request.json();

    if (!chapterId) {
      return NextResponse.json(
        { error: "Chapter ID is required" },
        { status: 400 },
      );
    }

    // Create sample reflection points for this chapter
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    // Check if reflection points already exist
    const existingPoints = await prisma.reflectionPoint.findMany({
      where: { chapterId },
    });

    if (existingPoints.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Reflection points already exist",
        existingPoints: existingPoints.length,
      });
    }

    // Create reflection points at strategic times
    const points = [
      { time: 30, topic: "Introduction" },
      { time: 90, topic: "Core Concepts" },
      { time: 180, topic: "Practical Application" },
      { time: 300, topic: "Advanced Topics" },
      { time: 420, topic: "Summary & Review" },
    ];

    await prisma.reflectionPoint.createMany({
      data: points.map((p) => ({
        chapterId,
        time: p.time,
        topic: `${p.topic}: ${chapter.title}`,
      })),
    });

    return NextResponse.json({
      success: true,
      message: `Created ${points.length} reflection points for "${chapter.title}"`,
      chapterTitle: chapter.title,
      hasVideo: !!chapter.videoUrl,
      reflectionPoints: points.map((p) => ({
        ...p,
        timeFormatted: `${Math.floor(p.time / 60)}:${(p.time % 60).toString().padStart(2, "0")}`,
      })),
    });
  } catch (error) {
    console.error("Setup reflection points error:", error);
    return NextResponse.json(
      { error: "Failed to setup reflection points", details: error },
      { status: 500 },
    );
  }
}
