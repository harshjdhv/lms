import { Chapter, Course } from "@workspace/database";
import { Badge } from "@workspace/ui/components/badge";
import { PlayCircle, Lock } from "lucide-react";
import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";

import { EnrollButton } from "./enroll-button";

interface CourseOverviewProps {
    course: Course & {
        chapters: Chapter[];
    };
    isEnrolled: boolean;
}

export function CourseOverview({ course, isEnrolled }: CourseOverviewProps) {
    return (
        <div className="w-full max-w-5xl 2xl:max-w-6xl mx-auto p-6 space-y-6">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <h1 className="text-3xl font-bold">{course.title}</h1>
                    {isEnrolled ? (
                        <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-600 dark:border-green-400">Enrolled</Badge>
                    ) : (
                        <EnrollButton courseId={course.id} />
                    )}
                </div>
                <p className="text-muted-foreground text-lg">{course.description}</p>
            </div>

            <div className="flex flex-col gap-y-2 mt-4">
                <h2 className="text-xl font-semibold mb-2">Course Content</h2>
                {course.chapters.length === 0 ? (
                    <div className="text-muted-foreground italic text-sm">No chapters released yet.</div>
                ) : (
                    <div className="flex flex-col gap-y-2">
                        {course.chapters.map((chapter, index) => {
                            const isLocked = !chapter.isFree && !isEnrolled;

                            return (
                                <Link
                                    key={chapter.id}
                                    href={isLocked ? "#" : `/dashboard/courses/${course.id}/chapters/${chapter.id}`}
                                    className={cn(
                                        "flex items-center p-3 w-full rounded-lg border text-sm transition-all",
                                        isLocked
                                            ? "bg-muted/50 text-muted-foreground cursor-not-allowed border-border"
                                            : "bg-card hover:bg-muted/50 cursor-pointer border-border hover:border-primary/30"
                                    )}
                                    onClick={isLocked ? (e) => e.preventDefault() : undefined}
                                >
                                    <div className="flex items-center gap-x-3 w-full">
                                        <div className={cn(
                                            "flex items-center justify-center w-8 h-8 rounded-full border shrink-0",
                                            isLocked ? "bg-muted border-border" : "bg-primary/10 border-primary/20 text-primary"
                                        )}>
                                            {isLocked ? <Lock className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                                        </div>
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className={cn(
                                                "font-medium line-clamp-1",
                                                isLocked && "text-muted-foreground"
                                            )}>
                                                {chapter.title}
                                            </span>
                                            <span className="text-xs text-muted-foreground hidden sm:block">
                                                Chapter {index + 1}
                                            </span>
                                        </div>
                                        <div className="ml-auto flex items-center shrink-0">
                                            {chapter.isFree && !isEnrolled && (
                                                <Badge variant="secondary" className="mr-2">
                                                    Free Preview
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
