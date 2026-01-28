import { createClient } from "@/lib/supabase/server";
import { prisma, Course } from "@workspace/database";
import { redirect } from "next/navigation";
import { CourseCard } from "@/components/courses/course-card";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default async function MyCoursesPage() {
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

    type CourseWithMeta = Course & {
        teacher?: { name: string | null };
        _count?: { chapters: number };
    };

    let courses: CourseWithMeta[] = [];
    const isTeacher = dbUser.role === "TEACHER";

    if (isTeacher) {
        courses = await prisma.course.findMany({
            where: { teacherId: dbUser.id },
            include: {
                _count: {
                    select: { chapters: true },
                },
            },
            orderBy: { createdAt: "desc" },
        }) as CourseWithMeta[]; // Cast to CourseWithMeta[]
    } else {
        // Fetch enrolled courses for students
        const enrollments = await prisma.enrollment.findMany({
            where: { userId: dbUser.id },
            include: {
                course: {
                    include: {
                        teacher: { select: { name: true } },
                        _count: { select: { chapters: true } },
                    },
                },
            },
        });
        courses = enrollments.map((e) => e.course) as CourseWithMeta[];
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
                    <p className="text-muted-foreground">
                        {isTeacher
                            ? "Manage the courses you've created."
                            : "Continue learning where you left off."}
                    </p>
                </div>
                {isTeacher && (
                    <Button asChild>
                        <Link href="/dashboard/courses/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Course
                        </Link>
                    </Button>
                )}
            </div>

            {courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed rounded-lg p-8 text-center animate-in fade-in-50">
                    <div className="p-4 bg-muted rounded-full mb-4">
                        <PlusCircle className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No courses found</h3>
                    <p className="text-muted-foreground mb-4 max-w-sm">
                        {isTeacher
                            ? "You haven't created any courses yet. Start by creating your first course."
                            : "You are not enrolled in any courses yet."}
                    </p>
                    {isTeacher && (
                        <Button asChild>
                            <Link href="/dashboard/courses/new">Create Course</Link>
                        </Button>
                    )}
                    {!isTeacher && (
                        <Button asChild variant="outline">
                            <Link href="/dashboard/courses/catalog">Browse Catalog</Link>
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {courses.map((course) => (
                        <CourseCard
                            key={course.id}
                            id={course.id}
                            title={course.title}
                            description={course.description}
                            teacherName={isTeacher ? "You" : course.teacher?.name}
                            chapterCount={course._count?.chapters || 0}
                            // TODO: Add progress calculation for students
                            progress={undefined}
                            isTeacher={isTeacher}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
