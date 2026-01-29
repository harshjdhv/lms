import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@workspace/database";

// Get video duration from YouTube API
async function getYouTubeVideoLength(videoUrl: string): Promise<number> {
  try {
    // Extract video ID from URL
    const videoId = extractVideoId(videoUrl);
    if (!videoId) return 600; // Default to 10 minutes

    // Use YouTube oEmbed API to get video length
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
    );
    if (!response.ok) return 600;

    const data = await response.json();
    return data?.duration || 600; // Default to 10 minutes if not found
  } catch (error) {
    console.error("Error getting video length:", error);
    return 600; // Safe default
  }
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

// Generate reflection points based on video length with random timestamps
function generateReflectionPoints(
  videoLengthSeconds: number,
  chapterTitle: string,
) {
  const points = [];
  const numberOfPoints = Math.min(
    8,
    Math.max(3, Math.floor(videoLengthSeconds / 120)),
  ); // 3-8 points, one every 2 minutes

  // Generate random timestamps throughout the video
  const usedTimestamps = new Set<number>();

  for (let i = 0; i < numberOfPoints; i++) {
    let timePosition: number;

    // Generate random timestamp, avoiding duplicates
    do {
      // Spread timestamps across the video with some randomness
      const minTime = (videoLengthSeconds / numberOfPoints) * i + 30; // At least 30 seconds into each segment
      const maxTime = (videoLengthSeconds / numberOfPoints) * (i + 1) - 30; // Leave 30 seconds before next segment
      timePosition = Math.random() * (maxTime - minTime) + minTime;
    } while (usedTimestamps.has(Math.round(timePosition)));

    usedTimestamps.add(Math.round(timePosition));

    // Generate topic based on position and chapter title
    let topic: string;
    const normalizedPosition = timePosition / videoLengthSeconds;

    if (i === 0) {
      topic = `Introduction to ${chapterTitle}`;
    } else if (i === numberOfPoints - 1) {
      topic = `Summary of ${chapterTitle}`;
    } else if (normalizedPosition < 0.33) {
      topic = `Core Concepts in ${chapterTitle}`;
    } else if (normalizedPosition < 0.66) {
      topic = `Advanced ${chapterTitle} Techniques`;
    } else {
      topic = `Practical Applications of ${chapterTitle}`;
    }

    points.push({
      time: Math.round(timePosition),
      topic,
    });
  }

  // Sort by time to maintain chronological order
  return points.sort((a, b) => a.time - b.time);
}

// Generate reflection points for all chapters with videos
export async function POST(request: NextRequest) {
  try {
    // Get all chapters with videos but no reflection points
    const chapters = await prisma.chapter.findMany({
      where: {
        videoUrl: { not: null },
        reflectionPoints: { none: {} }, // Chapters with no reflection points
      },
      orderBy: { position: "asc" },
    });

    let updatedCount = 0;
    const results = [];

    for (const chapter of chapters) {
      // Get video length
      const videoLength = await getYouTubeVideoLength(chapter.videoUrl!);

      // Generate smart reflection points
      const reflectionPoints = generateReflectionPoints(
        videoLength,
        chapter.title,
      );

      // Create reflection points in database
      await prisma.reflectionPoint.createMany({
        data: reflectionPoints.map((point) => ({
          chapterId: chapter.id,
          time: point.time,
          topic: point.topic,
        })),
      });

      results.push({
        chapterId: chapter.id,
        title: chapter.title,
        videoLength: `${Math.floor(videoLength / 60)}:${(videoLength % 60).toString().padStart(2, "0")}`,
        pointsGenerated: reflectionPoints.length,
        points: reflectionPoints.map((p) => ({
          ...p,
          timeFormatted: `${Math.floor(p.time / 60)}:${(p.time % 60).toString().padStart(2, "0")}`,
        })),
      });

      updatedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Generated smart reflection points for ${updatedCount} chapters`,
      totalChaptersFound: chapters.length,
      chaptersUpdated: results,
    });
  } catch (error) {
    console.error("Error generating smart reflection points:", error);
    return NextResponse.json(
      { error: "Failed to generate smart reflection points" },
      { status: 500 },
    );
  }
}

// Get or generate reflection points for a specific chapter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get("chapterId");

    if (!chapterId) {
      return NextResponse.json(
        { error: "Chapter ID is required" },
        { status: 400 },
      );
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        reflectionPoints: {
          orderBy: { time: "asc" },
        },
      },
    });

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    // If no reflection points exist, generate them on-the-fly
    if (chapter.reflectionPoints.length === 0) {
      const videoLength = await getYouTubeVideoLength(chapter.videoUrl!);
      const reflectionPoints = generateReflectionPoints(
        videoLength,
        chapter.title,
      );

      // Save to database
      await prisma.reflectionPoint.createMany({
        data: reflectionPoints.map((point) => ({
          chapterId: chapter.id,
          time: point.time,
          topic: point.topic,
        })),
      });

      return NextResponse.json({
        chapterId,
        title: chapter.title,
        videoLength: `${Math.floor(videoLength / 60)}:${(videoLength % 60).toString().padStart(2, "0")}`,
        reflectionPoints: reflectionPoints.map((p) => ({
          ...p,
          timeFormatted: `${Math.floor(p.time / 60)}:${(p.time % 60).toString().padStart(2, "0")}`,
        })),
        newlyGenerated: true,
        count: reflectionPoints.length,
      });
    }

    // Return existing reflection points
    return NextResponse.json({
      chapterId,
      title: chapter.title,
      reflectionPoints: chapter.reflectionPoints.map((point) => ({
        ...point,
        timeFormatted: `${Math.floor(point.time / 60)}:${(point.time % 60).toString().padStart(2, "0")}`,
      })),
      newlyGenerated: false,
      count: chapter.reflectionPoints.length,
    });
  } catch (error) {
    console.error("Error getting reflection points:", error);
    return NextResponse.json(
      { error: "Failed to get reflection points" },
      { status: 500 },
    );
  }
}
