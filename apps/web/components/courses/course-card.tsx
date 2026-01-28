import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { Layers, PlayCircle, Edit } from "lucide-react";
import Link from "next/link";

interface CourseCardProps {
    id: string;
    title: string;
    description: string | null;
    teacherName?: string | null;
    chapterCount?: number; // Total chapters
    progress?: number; // 0-100
    isTeacher?: boolean;
}

export function CourseCard({
    id,
    title,
    description,
    teacherName,
    chapterCount = 0,
    progress,
    isTeacher = false,
}: CourseCardProps) {
    return (
        <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-md">
            <div className="aspect-video w-full bg-muted/50 flex items-center justify-center">
                {/* Placeholder for course image */}
                <Layers className="w-12 h-12 text-muted-foreground/50" />
            </div>
            <CardHeader>
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="line-clamp-1 text-lg">{title}</CardTitle>
                    {teacherName && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                            {teacherName}
                        </Badge>
                    )}
                </div>
                <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                    {description || "No description provided."}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Layers className="w-4 h-4" />
                        <span>{chapterCount} Chapters</span>
                    </div>
                    {typeof progress === "number" && (
                        <div className="space-y-1 mt-2">
                            <div className="flex justify-between text-xs">
                                <span>Progress</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="pt-0">
                <Button asChild className="w-full" variant={isTeacher ? "outline" : "default"}>
                    <Link href={`/dashboard/courses/${id}`}>
                        {isTeacher ? (
                            <>
                                <Edit className="mr-2 w-4 h-4" />
                                Manage Course
                            </>
                        ) : (
                            <>
                                <PlayCircle className="mr-2 w-4 h-4" />
                                {progress && progress > 0 ? "Continue" : "Start Learning"}
                            </>
                        )}
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
