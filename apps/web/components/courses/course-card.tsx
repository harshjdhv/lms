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
    const [isPending, startTransition] = useTransition();
    const [isNavigating, setIsNavigating] = useState(false);

    const handleClick = () => {
        setIsNavigating(true);
        startTransition(() => { });
    };

    return (
        <Card className={cn(
            "group flex flex-col h-full overflow-hidden transition-all duration-300",
            "hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20",
            isNavigating && "scale-[0.98] opacity-70"
        )}>
            {/* Course thumbnail area */}
            <div className="relative aspect-video w-full bg-gradient-to-br from-primary/10 via-muted to-primary/5 flex items-center justify-center overflow-hidden">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <BookOpen className="w-10 h-10 text-primary/30 group-hover:scale-110 transition-transform duration-300" />
                    </>
                )}

                {/* Chapter count badge */}
                <div className="absolute bottom-2 right-2">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-xs">
                        {chapterCount} {chapterCount === 1 ? "chapter" : "chapters"}
                    </Badge>
                </div>

                {/* Loading overlay */}
                {isNavigating && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
                        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>

            <CardContent className="flex-1 p-4 space-y-2">
                <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                    {title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                    {description || "No description provided."}
                </p>

                {/* Teacher info */}
                {teacherName && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                        <User className="w-3 h-3" />
                        <span>{teacherName}</span>
                    </div>
                )}

                {/* Progress bar for students */}
                {typeof progress === "number" && (
                    <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium text-primary">{Math.round(progress)}%</span>
                        </div>
                        <Progress
                            value={progress}
                            className="h-1.5"
                        />
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Button
                    asChild
                    className="w-full group/btn"
                    variant={isTeacher ? "outline" : "default"}
                    onClick={handleClick}
                >
                    <Link href={`/dashboard/courses/${id}`}>
                        {isTeacher ? (
                            <>
                                <Edit className="mr-2 w-4 h-4" />
                                Manage
                                <ChevronRight className="ml-auto w-4 h-4 opacity-50 group-hover/btn:translate-x-0.5 transition-transform" />
                            </>
                        ) : (
                            <>
                                <PlayCircle className="mr-2 w-4 h-4" />
                                {progress && progress > 0 ? "Continue" : "Start Learning"}
                                <ChevronRight className="ml-auto w-4 h-4 opacity-50 group-hover/btn:translate-x-0.5 transition-transform" />
                            </>
                        )}
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
