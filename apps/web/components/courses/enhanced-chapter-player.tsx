"use client";

import { useState, useTransition } from "react";
import { Chapter, ReflectionPoint } from "@workspace/database";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent } from "@workspace/ui/components/card";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Lock, ArrowLeft, PlayCircle, CheckCircle2, Video, Loader2, Bug } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const handleChapterClick = (chapterId: string, isLockedChapter: boolean) => {
    if (isLockedChapter || chapterId === chapter.id) return;

    setNavigatingTo(chapterId);
    startTransition(() => {
      router.push(`/dashboard/courses/${courseId}/chapters/${chapterId}`);
    });
  };

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-10 space-y-6 text-center">
        <Link
          href={`/dashboard/courses/${courseId}`}
          className="self-start mb-4 text-sm text-muted-foreground hover:text-foreground flex items-center transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Link>

        <div className="p-6 rounded-full bg-muted">
          <Lock className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">This chapter is locked</h2>
          <p className="text-muted-foreground max-w-sm">
            Please enroll in the course to access this content.
          </p>
        </div>
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
    <div className="flex flex-col lg:flex-row w-full min-h-0 gap-0">
      {/* Main content: video + title */}
      <div className="flex-1 min-w-0 flex flex-col p-4 lg:p-6">
        <Link
          href={`/dashboard/courses/${courseId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 w-fit"
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
            {chapter.isFree && (
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                Free Preview
              </Badge>
            )}
            {hasReflectionPoints && (
              <Badge variant="outline">
                {reflectionPoints.length} Reflection Point
                {reflectionPoints.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>

        {/* Video area */}
        <div className="w-full max-w-4xl">
          {videoId ? (
            <ReflectionVideoPlayer
              videoId={videoId}
              reflectionPoints={reflectionPoints}
              studentId={studentId}
              chapterId={chapter.id}
              showDebugPanel={showDebug}
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
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Video className="h-10 w-10 opacity-50" />
                    <span>No Video Available</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end mt-2">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors px-2 py-1 rounded-md hover:bg-muted"
            >
              <Bug className="w-3.5 h-3.5" />
              {showDebug ? "Hide Debug & Interactive" : "Show Debug & Interactive"}
            </button>
          </div>
        </div>

        {showDebug && hasReflectionPoints && (
          <div className="mt-6 p-4 rounded-xl border bg-muted/30 max-w-4xl">
            <h3 className="font-medium mb-2">Interactive Learning</h3>
            <p className="text-sm text-muted-foreground mb-3">
              This video includes reflection points that will pause to test your understanding.
            </p>
            <div className="space-y-1.5">
              {reflectionPoints.map((point, index) => (
                <div
                  key={point.id || index}
                  className="flex items-center gap-2 text-sm"
                >
                  <div className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
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

      {/* Right sidebar: lessons list */}
      <aside className="w-full lg:w-80 xl:w-96 shrink-0 border-t lg:border-t-0 lg:border-l border-border bg-muted/10">
        <div className="p-3 border-b border-border">
          <h2 className="font-semibold text-sm">Course content</h2>
          <p className="text-xs text-muted-foreground">{chapters.length} lessons</p>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)]">
          <nav className="p-2 space-y-0.5">
            {chapters.map((ch, index) => {
              const isCurrent = ch.id === chapter.id;
              const isLockedChapter = !ch.isFree && !isEnrolled;
              const isNavigatingToThis = navigatingTo === ch.id;

              return (
                <button
                  key={ch.id}
                  onClick={() => handleChapterClick(ch.id, isLockedChapter)}
                  disabled={isLockedChapter || isCurrent || isPending}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-all duration-200",
                    isCurrent
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    isLockedChapter && "opacity-50 cursor-not-allowed",
                    isNavigatingToThis && "bg-primary/5 scale-[0.98]"
                  )}
                >
                  <span className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-full shrink-0 text-xs font-medium transition-colors",
                    isCurrent ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    {isNavigatingToThis ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isCurrent ? (
                      <PlayCircle className="w-3.5 h-3.5" />
                    ) : isLockedChapter ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="line-clamp-2 flex-1 min-w-0">{ch.title}</span>
                  {isCurrent && <CheckCircle2 className="w-4 h-4 shrink-0 text-primary" />}
                </button>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>
    </div>
  );
}
