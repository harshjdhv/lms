import { prisma } from "@workspace/database";
import { type TranscriptSegment } from "@/lib/transcript";

export async function generateAndSaveReflectionPoints(
  chapterId: string,
  segments: TranscriptSegment[],
) {
  if (segments.length === 0) return;

  // Estimate duration from the last segment's start time
  // This is an approximation as we don't have the explicit duration in the segments
  const lastSegment = segments[segments.length - 1];
  if (!lastSegment) return;
  const approxDuration = lastSegment.start;

  // Only generate points for videos longer than 1 minute
  if (approxDuration < 60) return;

  // Generate 4-5 random timestamps
  const count = Math.floor(Math.random() * 2) + 4; // 4 or 5
  const points: number[] = [];

  // Simple collision avoidance
  const minGap = approxDuration / 20; // Ensure points are somewhat spread out

  let attempts = 0;
  while (points.length < count && attempts < 20) {
    attempts++;
    // Random time between 10% and 90% of video
    const time = (Math.random() * 0.8 + 0.1) * approxDuration;

    // Check if too close to existing points
    const isTooClose = points.some((p) => Math.abs(p - time) < minGap);
    if (!isTooClose) {
      points.push(time);
    }
  }

  // Sort them chronologically
  points.sort((a, b) => a - b);

  // Delete existing reflection points for this chapter to avoid duplicates
  // This assumes all reflection points are auto-generated or should be reset on new video upload
  await prisma.reflectionPoint.deleteMany({
    where: { chapterId },
  });

  // Save to DB
  if (points.length > 0) {
    await prisma.reflectionPoint.createMany({
      data: points.map((time) => ({
        chapterId,
        time,
        topic: "Reflection Point", // Default topic, can be updated later by AI or user
      })),
    });
  }
}
