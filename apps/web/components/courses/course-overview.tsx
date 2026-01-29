"use client";

import { Chapter, Course } from "@workspace/database";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { PlayCircle, Lock, BookOpen, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";
import { useState, useTransition } from "react";

import { EnrollButton } from "./enroll-button";

interface CourseOverviewProps {
    course: Course & {
        chapters: Chapter[];
    };
    isEnrolled: boolean;
}

export function CourseOverview({ course, isEnrolled }: CourseOverviewProps) {
    const [isPending, startTransition] = useTransition();
    const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

    return (
        <div className="w-full max-w-5xl 2xl:max-w-6xl mx-auto p-6 space-y-8">
            {/* Header Section */}
            <div className="space-y-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
                        <p className="text-muted-foreground text-lg max-w-2xl">
                            {course.description || "Start learning today"}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        {isEnrolled ? (
                            <Badge
                                variant="outline"
                                className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5 px-3 py-1.5 text-sm"
                            >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                                Enrolled
                            </Badge>
                        ) : (
                            <EnrollButton courseId={course.id} />
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.chapters.length} chapters</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>Self-paced</span>
                    </div>
                </div>
            </div>

            {/* Chapters List */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <span>Course Content</span>
                    <span className="text-sm font-normal text-muted-foreground">
                        ({course.chapters.length} lessons)
                    </span>
                </h2>

                {course.chapters.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-8 text-center bg-muted/20">
                        <BookOpen className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-muted-foreground">No chapters released yet</p>
                        <p className="text-sm text-muted-foreground/70 mt-1">
                            Check back soon for new content
                        </p>
                    </div>
                ) : (
                    <div className="rounded-xl border bg-card overflow-hidden divide-y">
                        {course.chapters.map((chapter, index) => {
                            const isLocked = !chapter.isFree && !isEnrolled;
                            const isNavigating = selectedChapter === chapter.id;

                            return (
                                <Link
                                    key={chapter.id}
                                    href={isLocked ? "#" : `/dashboard/courses/${course.id}/chapters/${chapter.id}`}
                                    onClick={(e) => {
                                        if (isLocked) {
                                            e.preventDefault();
                                            return;
                                        }
                                        setSelectedChapter(chapter.id);
                                        startTransition(() => { });
                                    }}
                                    className={cn(
                                        "group flex items-center gap-4 p-4 transition-all duration-200",
                                        isLocked
                                            ? "bg-muted/30 cursor-not-allowed"
                                            : "hover:bg-muted/50 cursor-pointer",
                                        isNavigating && "bg-primary/5"
                                    )}
                                >
                                    {/* Chapter number / icon */}
                                    <div
                                        className={cn(
                                            "flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-colors",
                                            isLocked
                                                ? "bg-muted text-muted-foreground"
                                                : isNavigating
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                                        )}
                                    >
                                        {isNavigating ? (
                                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        ) : isLocked ? (
                                            <Lock className="w-4 h-4" />
                                        ) : (
                                            <PlayCircle className="w-4 h-4" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={cn(
                                                    "font-medium line-clamp-1",
                                                    isLocked && "text-muted-foreground"
                                                )}
                                            >
                                                {chapter.title}
                                            </span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            Chapter {index + 1}
                                        </span>
                                    </div>

                                    {/* Badges */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        {chapter.isFree && !isEnrolled && (
                                            <Badge
                                                variant="secondary"
                                                className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs"
                                            >
                                                Free Preview
                                            </Badge>
                                        )}
                                        {isLocked && (
                                            <Badge
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                Locked
                                            </Badge>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* CTA for non-enrolled users */}
            {!isEnrolled && course.chapters.length > 0 && (
                <div className="rounded-xl border bg-gradient-to-br from-primary/5 via-transparent to-primary/5 p-6 text-center space-y-4">
                    <h3 className="text-lg font-semibold">Ready to start learning?</h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                        Enroll now to unlock all {course.chapters.length} chapters and track your progress
                    </p>
                    <EnrollButton courseId={course.id} />
                </div>
            )}
        </div>
    );
}
