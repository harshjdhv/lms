"use client";

import { useQuery } from "@tanstack/react-query";
import { Course } from "@workspace/database";
import { CourseCard } from "./course-card";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { CoursesLoading } from "./courses-loading";

type CourseWithMeta = Course & {
    teacher?: { name: string | null };
    _count?: { chapters: number };
};

interface MyCoursesViewProps {
    isTeacher: boolean;
}

export function MyCoursesView({ isTeacher }: MyCoursesViewProps) {
    const { data: courses, isLoading } = useQuery({
        queryKey: ["courses", "my"],
        queryFn: async () => {
            const res = await fetch("/api/courses/my");
            if (!res.ok) throw new Error("Failed to fetch courses");
            return res.json() as Promise<CourseWithMeta[]>;
        },
        // initialData: initialCourses, // Removed because we want to force client-side fetch when no data is passed
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) {
        return <CoursesLoading />;
    }

    const hasCourses = courses && courses.length > 0;

    return (
        <div className="w-full flex flex-col gap-6 p-6 max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between flex-wrap gap-4">
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

            {!hasCourses ? (
                <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed rounded-lg p-8 text-center animate-in fade-in-50 bg-muted/20 border-border">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {courses.map((course) => (
                        <CourseCard
                            key={course.id}
                            id={course.id}
                            title={course.title}
                            description={course.description}
                            teacherName={isTeacher ? "You" : course.teacher?.name}
                            chapterCount={course._count?.chapters || 0}
                            progress={undefined}
                            isTeacher={isTeacher}
                            imageUrl={course.imageUrl}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
