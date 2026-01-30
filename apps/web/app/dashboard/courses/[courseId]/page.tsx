import { createClient } from "@/lib/supabase/server";
import { prisma } from "@workspace/database";
import { redirect } from "next/navigation";
import { CourseEditor } from "@/components/courses/course-editor";
import { CourseOverview } from "@/components/courses/course-overview";

export default async function CoursePage({
    params,
}: {
    params: Promise<{ courseId: string }>;
}) {
    const { courseId } = await params;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
    });

    if (!dbUser) {
        return <div>User not found</div>;
    }

    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            chapters: {
                orderBy: { position: "asc" },
                include: {
                    reflectionPoints: {
                        orderBy: { time: "asc" },
                    }
                }
            },
        },
    });

    if (!course) {
        return <div>Course not found</div>;
    }

    const isTeacher = dbUser.role === "TEACHER" && course.teacherId === dbUser.id;

    // If teacher, show editor. If student, show overview.
    // Note: Even teachers might want to see "Preview", but for now Editor is default.


    const enrollment = await prisma.enrollment.findFirst({
        where: {
            userId: dbUser.id,
            courseId: course.id,
        },
    });

    if (isTeacher) {
        return <CourseEditor course={course} />;
    }

    const publicCourse = {
        ...course,
        chapters: course.chapters.filter(chapter => chapter.isPublished),
    };

    return <CourseOverview course={publicCourse} isEnrolled={!!enrollment} />;
}
