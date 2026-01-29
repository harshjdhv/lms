import { Chapter, ReflectionPoint } from "@workspace/database";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent } from "@workspace/ui/components/card";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Lock, ArrowLeft, PlayCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";
import { getEmbedUrl } from "@/lib/video";
import { ReflectionVideoPlayer } from "@/components/reflection/ReflectionVideoPlayer";

interface ChapterPlayerProps {
  chapter: Chapter;
  chapters: Chapter[];
  courseId: string;
  courseTitle: string;
  studentId: string;
  reflectionPoints?: ReflectionPoint[];
  isLocked: boolean;
  isEnrolled?: boolean;
}

export function EnhancedChapterPlayer({
  chapter,
  chapters,
  courseId,
  courseTitle,
  studentId,
  reflectionPoints = [],
  isLocked,
  isEnrolled = false,
}: ChapterPlayerProps) {
  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-muted/50 rounded-md space-y-4">
        <Link
          href={`/dashboard/courses/${courseId}`}
          className="self-start mb-4 text-sm hover:underline flex items-center text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Link>
        <Lock className="h-10 w-10 text-muted-foreground" />
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
  const currentIndex = chapters.findIndex((c) => c.id === chapter.id);

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-0 gap-0">
      {/* Main content: video + title (Udemy-style left side) */}
      <div className="flex-1 min-w-0 flex flex-col p-4 lg:p-6">
        <Link
          href={`/dashboard/courses/${courseId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {courseTitle}
        </Link>

        <div className="space-y-3 mb-4">
          <h1 className="text-xl lg:text-2xl font-bold">{chapter.title}</h1>
          {chapter.description && (
            <p className="text-sm text-muted-foreground">{chapter.description}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {chapter.isFree && <Badge variant="secondary">Free Preview</Badge>}
            {hasReflectionPoints && (
              <Badge variant="outline">
                {reflectionPoints.length} Reflection Point
                {reflectionPoints.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>

        {/* Video area - constrained width so it doesn't stretch too much */}
        <div className="w-full max-w-3xl">
          {videoId ? (
            <ReflectionVideoPlayer
              videoId={videoId}
              reflectionPoints={reflectionPoints}
              studentId={studentId}
            />
          ) : (
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
        </div>

        {hasReflectionPoints && (
          <div className="mt-6 p-4 rounded-lg border bg-muted/30 border-border max-w-3xl">
            <h3 className="font-medium mb-2">Interactive Learning</h3>
            <p className="text-sm text-muted-foreground mb-3">
              This video includes reflection points that will pause to test your understanding.
            </p>
            <div className="space-y-1">
              {reflectionPoints.map((point, index) => (
                <div
                  key={point.id || index}
                  className="flex items-center gap-2 text-sm"
                >
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>
                    {Math.floor(point.time / 60)}:
                    {(point.time % 60).toString().padStart(2, "0")} - {point.topic}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right sidebar: lessons list (Udemy-style) */}
      <aside className="w-full lg:w-80 xl:w-96 shrink-0 border-t lg:border-t-0 lg:border-l border-border bg-muted/20">
        <div className="p-3 border-b border-border">
          <h2 className="font-semibold text-sm">Course content</h2>
          <p className="text-xs text-muted-foreground">{chapters.length} lessons</p>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)]">
          <nav className="p-2 space-y-0.5">
            {chapters.map((ch, index) => {
              const isCurrent = ch.id === chapter.id;
              const isLockedChapter = !ch.isFree && !isEnrolled;
              return (
                <Link
                  key={ch.id}
                  href={isLockedChapter && !isCurrent ? "#" : `/dashboard/courses/${courseId}/chapters/${ch.id}`}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                    isCurrent
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    isLockedChapter && !isCurrent && "opacity-60 pointer-events-none"
                  )}
                  onClick={isLockedChapter && !isCurrent ? (e) => e.preventDefault() : undefined}
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-full shrink-0 text-xs font-medium bg-muted">
                    {isCurrent ? (
                      <PlayCircle className="w-3.5 h-3.5 text-primary" />
                    ) : isLockedChapter ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="line-clamp-2 flex-1 min-w-0">{ch.title}</span>
                  {isCurrent && <CheckCircle2 className="w-4 h-4 shrink-0 text-primary" />}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>
    </div>
  );
}
