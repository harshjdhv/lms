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
        include: {
            chapters: {
                orderBy: { position: "asc" },
            },
        },
    });

    if (!chapter || !course) {
        redirect("/dashboard/courses/my");
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

    const allChapters = "chapters" in course ? course.chapters : [];
    const chapters = isTeacher ? allChapters : allChapters.filter((c) => c.isPublished);

    return (
        <EnhancedChapterPlayer
            chapter={chapter}
            chapters={chapters}
            courseId={courseId}
            courseTitle={course.title}
            studentId={dbUser.id}
            reflectionPoints={chapter.reflectionPoints}
            isLocked={isLocked}
            isEnrolled={isEnrolled}
        />
    );
}
