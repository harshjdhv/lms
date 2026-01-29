import { Chapter, ReflectionPoint } from "@workspace/database";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getEmbedUrl } from "@/lib/video";
import { ReflectionVideoPlayer } from "@/components/reflection/ReflectionVideoPlayer";

interface ChapterPlayerProps {
  chapter: Chapter;
  isLocked: boolean;
  courseId: string;
  studentId: string;
  reflectionPoints?: ReflectionPoint[];
}

export function EnhancedChapterPlayer({
  chapter,
  isLocked,
  courseId,
  studentId,
  reflectionPoints = [],
}: ChapterPlayerProps) {
  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-slate-100 rounded-md space-y-4">
        <Link
          href={`/dashboard/courses/${courseId}`}
          className="self-start mb-4 text-sm hover:underline flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Link>
        <Lock className="h-10 w-10 text-slate-500" />
        <h2 className="text-xl font-bold">This chapter is locked</h2>
        <p className="text-muted-foreground">
          Please enroll in the course to access this content.
        </p>
      </div>
    );
  }

  // Extract YouTube video ID from the video URL
  const getYouTubeId = (url: string): string | null => {
    if (!url) return null;

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([^&\n?#]+)$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  };

  const videoId = getYouTubeId(chapter.videoUrl || "");
  const hasReflectionPoints = reflectionPoints.length > 0;

  return (
    <div className="space-y-6 w-full max-w-full p-6">
      <Link
        href={`/dashboard/courses/${courseId}`}
        className="flex items-center text-sm hover:opacity-75 transition"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Course
      </Link>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{chapter.title}</h1>
        {chapter.description && (
          <p className="text-muted-foreground">{chapter.description}</p>
        )}
        <div className="flex items-center gap-2">
          {chapter.isFree && <Badge>Free Preview</Badge>}
          {hasReflectionPoints && (
            <Badge variant="secondary">
              {reflectionPoints.length} Reflection Point
              {reflectionPoints.length > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </div>

      {/* Use ReflectionVideoPlayer if we have reflection points and a valid YouTube video */}
      {videoId && hasReflectionPoints ? (
        <ReflectionVideoPlayer
          videoId={videoId}
          reflectionPoints={reflectionPoints}
          studentId={studentId}
        />
      ) : (
        // Fall back to regular video player
        <Card>
          <CardContent className="p-0 aspect-video relative flex items-center justify-center bg-black rounded-lg overflow-hidden">
            {chapter.videoUrl ? (
              <iframe
                src={getEmbedUrl(chapter.videoUrl) || ""}
                className="w-full h-full absolute top-0 left-0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <div className="text-white">No Video Available</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Show reflection points info if available */}
      {hasReflectionPoints && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-2">
            Interactive Learning
          </h3>
          <p className="text-sm text-blue-800 mb-3">
            This video includes interactive reflection points that will pause to
            test your understanding.
          </p>
          <div className="space-y-1">
            {reflectionPoints.map((point, index) => (
              <div
                key={point.id || index}
                className="flex items-center gap-2 text-sm text-blue-700"
              >
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>
                  {Math.floor(point.time / 60)}:
                  {(point.time % 60).toString().padStart(2, "0")} -{" "}
                  {point.topic}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
