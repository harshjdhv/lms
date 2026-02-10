"use client";

import {
    Card,
    CardContent,
    CardFooter,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { BookOpen, PlayCircle, Edit, User, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { cn } from "@workspace/ui/lib/utils";

interface CourseCardProps {
    id: string;
    title: string;
    description: string | null;
    teacherName?: string | null;
    chapterCount?: number;
    progress?: number;
    isTeacher?: boolean;
    imageUrl?: string | null;
}

export function CourseCard({
    id,
    title,
    description,
    teacherName,
    chapterCount = 0,
    progress,
    isTeacher = false,
    imageUrl,
}: CourseCardProps) {
    const [, startTransition] = useTransition();
    const [isNavigating, setIsNavigating] = useState(false);

    const handleClick = () => {
        setIsNavigating(true);
        startTransition(() => { });
    };

    const classroomThemes = [
        "from-sky-600 to-cyan-500",
        "from-emerald-600 to-teal-500",
        "from-orange-500 to-amber-500",
        "from-rose-600 to-pink-500",
        "from-indigo-600 to-violet-500",
        "from-blue-700 to-indigo-500",
    ] as const;

    const themeIndex = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % classroomThemes.length;
    const headerGradient = classroomThemes[themeIndex] || classroomThemes[0];
    const teacherInitial = (isTeacher ? "T" : (teacherName || title || "C")).trim().charAt(0).toUpperCase();

    return (
        <Card
            className={cn(
                "group flex h-full flex-col overflow-hidden rounded-2xl border bg-card py-0 gap-0",
                "shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-all duration-300",
                "hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.16)]",
                isNavigating && "scale-[0.99] opacity-80"
            )}
        >
            <div className={cn("relative h-36 overflow-hidden bg-gradient-to-r", headerGradient)}>
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="absolute inset-0 block h-full w-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="h-10 w-10 text-white/70" />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/25" />
                <div className="absolute -bottom-5 right-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-white font-semibold text-foreground shadow-sm">
                    {teacherInitial}
                </div>

                {isNavigating && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    </div>
                )}
            </div>

            <CardContent className="flex-1 p-4 pt-7">
                <h3 className="line-clamp-1 text-lg font-semibold">
                    {title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                    {isTeacher ? "Your class" : (teacherName || "Course")}
                </p>
                <p className="line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">
                    {description || (isTeacher ? "Manage this class content and updates." : "Continue learning from the latest class material.")}
                </p>
                <div className="mt-4 flex items-center justify-between">
                    <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                        {chapterCount} {chapterCount === 1 ? "topic" : "topics"}
                    </Badge>
                    {isTeacher ? (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            Teacher
                        </span>
                    ) : typeof progress === "number" ? (
                        <span className="text-xs font-medium text-primary">
                            {Math.round(progress)}% complete
                        </span>
                    ) : null}
                </div>
                {typeof progress === "number" && !isTeacher && (
                    <div className="mt-3 space-y-1.5">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium text-primary">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                    </div>
                )}
            </CardContent>

            <CardFooter className="px-4 pb-4 pt-0">
                <Button
                    asChild
                    className="w-full rounded-xl"
                    variant={isTeacher ? "outline" : "default"}
                    onClick={handleClick}
                >
                    <Link href={`/dashboard/courses/${id}`}>
                        {isTeacher ? (
                            <>
                                <Edit className="mr-2 h-4 w-4" />
                                Manage Class
                                <ChevronRight className="ml-auto h-4 w-4 opacity-70 transition-transform group-hover:translate-x-0.5" />
                            </>
                        ) : (
                            <>
                                <PlayCircle className="mr-2 h-4 w-4" />
                                Open Class
                                <ChevronRight className="ml-auto h-4 w-4 opacity-70 transition-transform group-hover:translate-x-0.5" />
                            </>
                        )}
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
