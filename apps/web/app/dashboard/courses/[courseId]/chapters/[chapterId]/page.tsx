import { createClient } from "@/lib/supabase/server";
import { prisma } from "@workspace/database";
import { redirect } from "next/navigation";
import { ChapterEditor } from "@/components/courses/chapter-editor";
import { EnhancedChapterPlayer } from "@/components/courses/enhanced-chapter-player";

export default async function ChapterPage({
    params,
}: {
    params: Promise<{ courseId: string; chapterId: string }>;
}) {
    const { courseId, chapterId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const chapter = await prisma.chapter.findUnique({
        where: {
            id: chapterId,
            courseId: courseId,
        },
        include: {
            reflectionPoints: true,
        },
    });

    const course = await prisma.course.findUnique({
        where: {
            id: courseId,
        },
    });

    if (!chapter || !course) {
        redirect("/dashboard/courses");
    }

    const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
        include: {
            enrollments: {
                where: {
                    courseId: courseId,
                }
            }
        }
    });

    if (!dbUser) {
        redirect("/auth/login");
    }

    const isTeacher = dbUser.role === "TEACHER" && course.teacherId === dbUser.id;

    if (!isTeacher && !chapter.isPublished) {
        redirect(`/dashboard/courses/${courseId}`);
    }

    const isEnrolled = dbUser.enrollments.length > 0;

    // Logic for Locked State
    // If Teacher: Never locked (they are editing)
    // If Student: 
    //    - If Chapter is Free: Unlocked
    //    - If Enrolled: Unlocked
    //    - Else: Locked

    const isLocked = !isTeacher && !chapter.isFree && !isEnrolled;

    if (isTeacher) {
        return <ChapterEditor initialData={chapter} courseId={courseId} chapterId={chapterId} />;
    }

    return (
        <EnhancedChapterPlayer
            chapter={chapter}
            isLocked={isLocked}
            courseId={courseId}
            studentId={dbUser.id}
            reflectionPoints={chapter.reflectionPoints}
        />
    );
}
