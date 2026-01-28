import { Chapter } from "@workspace/database";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getEmbedUrl } from "@/lib/video";

interface ChapterPlayerProps {
    chapter: Chapter;
    isLocked: boolean;
    courseId: string;
}

export function ChapterPlayer({ chapter, isLocked, courseId }: ChapterPlayerProps) {

    if (isLocked) {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-slate-100 rounded-md space-y-4">
                <Link href={`/dashboard/courses/${courseId}`} className="self-start mb-4 text-sm hover:underline flex items-center">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Course
                </Link>
                <Lock className="h-10 w-10 text-slate-500" />
                <h2 className="text-xl font-bold">This chapter is locked</h2>
                <p className="text-muted-foreground">Please enroll in the course to access this content.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 w-full max-w-full p-6">
            <Link href={`/dashboard/courses/${courseId}`} className="flex items-center text-sm hover:opacity-75 transition">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Course
            </Link>
            <div className="space-y-2">
                <h1 className="text-2xl font-bold">{chapter.title}</h1>
                {chapter.description && <p className="text-muted-foreground">{chapter.description}</p>}
            </div>

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

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {chapter.isFree && <Badge>Free Preview</Badge>}
                </div>
                {/* Navigation buttons could go here */}
            </div>
        </div>
    )
}
