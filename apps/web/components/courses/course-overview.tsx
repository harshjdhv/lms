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
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">{course.title}</h1>
                    {isEnrolled ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">Enrolled</Badge>
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
                                    href={`/dashboard/courses/${course.id}/chapters/${chapter.id}`}
                                    className={cn(
                                        "flex items-center p-3 w-full rounded-md border text-sm transition-all hover:shadow-sm",
                                        isLocked ? "bg-slate-50 text-slate-500 cursor-not-allowed hover:bg-slate-50" : "bg-white hover:bg-slate-100/50 cursor-pointer border-slate-200"
                                    )}
                                >
                                    <div className="flex items-center gap-x-3 w-full">
                                        <div className={cn(
                                            "flex items-center justify-center w-8 h-8 rounded-full border",
                                            isLocked ? "bg-slate-200 border-slate-300" : "bg-sky-100 border-sky-300 text-sky-700"
                                        )}>
                                            {isLocked ? <Lock className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={cn(
                                                "font-medium line-clamp-1",
                                                isLocked && "text-slate-500"
                                            )}>
                                                {chapter.title}
                                            </span>
                                            <span className="text-xs text-muted-foreground hidden sm:block">
                                                Chapter {index + 1}
                                            </span>
                                        </div>
                                        <div className="ml-auto flex items-center">
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
