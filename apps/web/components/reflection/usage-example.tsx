// Example of how to use the ReflectionVideoPlayer component
// This can be integrated into your existing chapter-player.tsx or used as a standalone

import {
  ReflectionVideoPlayer,
  ReflectionPoint,
} from "@/components/reflection/ReflectionVideoPlayer";

// Example page component
export default function VideoLessonPage() {
  // These would typically come from your database
  const videoId = "dQw4w9WgXcQ"; // YouTube video ID
  const studentId = "user_123"; // Current user ID

  // Reflection points from your database - these represent timestamps
  // where the AI should pause the video and ask questions
  const reflectionPoints: ReflectionPoint[] = [
    { time: 30, topic: "Introduction to Variables" },
    { time: 120, topic: "Data Types" },
    { time: 240, topic: "Functions and Methods" },
    { time: 360, topic: "Error Handling" },
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Learn Programming Basics</h1>

      <ReflectionVideoPlayer
        videoId={videoId}
        reflectionPoints={reflectionPoints}
        studentId={studentId}
      />

      <div className="mt-8 p-6 bg-slate-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Learning Points</h2>
        <p className="text-muted-foreground mb-4">
          This video will automatically pause at key reflection points to test
          your understanding.
        </p>
        <ul className="space-y-2">
          {reflectionPoints.map((point, index) => (
            <li key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">
                {Math.floor(point.time / 60)}:
                {(point.time % 60).toString().padStart(2, "0")} - {point.topic}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
