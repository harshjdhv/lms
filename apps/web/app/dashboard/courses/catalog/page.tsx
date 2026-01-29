import { createClient } from "@/lib/supabase/server";
import { prisma, Course } from "@workspace/database";
import { redirect } from "next/navigation";
import { CourseCard } from "@/components/courses/course-card";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

export default async function CourseCatalogPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/auth/login");

    const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
        include: { enrollments: { select: { courseId: true } } },
    });

    if (!dbUser) redirect("/auth/login");

    const enrolledIds = dbUser.enrollments.map((e) => e.courseId);

    type CourseWithMeta = Course & {
        teacher?: { name: string | null };
        _count?: { chapters: number };
    };

    const courses = await prisma.course.findMany({
        where: {
            isPublished: true,
            id: { notIn: enrolledIds },
        },
        include: {
            teacher: { select: { name: true } },
            _count: { select: { chapters: true } },
        },
        orderBy: { createdAt: "desc" },
    }) as CourseWithMeta[];

    return (
        <div className="w-full flex flex-col gap-6 p-6 max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Course Catalog</h1>
                    <p className="text-muted-foreground">Browse all available courses and enroll to get started.</p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/dashboard/courses/my">My Courses</Link>
                </Button>
            </div>

            {courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed rounded-lg p-8 text-center bg-muted/20 border-border">
                    <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No courses available</h3>
                    <p className="text-muted-foreground mb-4 max-w-sm">
                        You’re enrolled in everything we have, or no courses are published yet.
                    </p>
                    <Button asChild variant="outline">
                        <Link href="/dashboard/courses/my">Back to My Courses</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {courses.map((course) => (
                        <CourseCard
                            key={course.id}
                            id={course.id}
                            title={course.title}
                            description={course.description}
                            teacherName={course.teacher?.name}
                            chapterCount={course._count?.chapters ?? 0}
                            progress={undefined}
                            isTeacher={false}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
