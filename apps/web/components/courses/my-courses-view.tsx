"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CourseCard } from "./course-card";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import {
    PlusCircle,
    BookOpen,
    GraduationCap,
    TrendingUp,
    Search,
    Sparkles,
} from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { CoursesLoading } from "./courses-loading";
import { useMyCourses } from "@/hooks/queries/use-courses";
import { StatsCard, gradientPresets, StatsCardSkeleton } from "@/components/ui/stats-card";
import { EmptyState } from "@/components/ui/empty-state";
import { useState, useMemo } from "react";
import { cn } from "@workspace/ui/lib/utils";

interface MyCoursesViewProps {
    isTeacher: boolean;
}

export function MyCoursesView({ isTeacher }: MyCoursesViewProps) {
    const { data: courses, isLoading } = useMyCourses();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCourses = useMemo(() => {
        if (!courses) return [];
        if (!searchQuery) return courses;
        return courses.filter(course =>
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [courses, searchQuery]);

    const stats = useMemo(() => {
        if (!courses) return { total: 0, chapters: 0, published: 0 };
        return {
            total: courses.length,
            chapters: courses.reduce((acc, c) => acc + (c._count?.chapters || 0), 0),
            published: courses.filter(c => c.isPublished).length,
        };
    }, [courses]);

    if (isLoading) {
        return (
            <div className="w-full flex flex-col gap-8 p-6 max-w-[1600px] mx-auto animate-in fade-in-50 duration-500">
                {/* Header Skeleton */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b">
                    <div className="space-y-2">
                        <div className="h-9 w-48 bg-muted rounded-lg animate-pulse" />
                        <div className="h-5 w-72 bg-muted/50 rounded animate-pulse" />
                    </div>
                </div>
                {/* Stats Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                </div>
                <CoursesLoading />
            </div>
        );
    }

    const hasCourses = filteredCourses && filteredCourses.length > 0;

    return (
        <div className={cn(
            "w-full flex flex-col p-6 mx-auto animate-in fade-in-50 duration-500",
            isTeacher ? "gap-8 max-w-[1600px]" : "gap-6 max-w-[1400px]"
        )}>
            {/* Enhanced Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={cn(
                    "flex flex-col md:flex-row md:items-center justify-between gap-4",
                    isTeacher ? "pb-6 border-b" : "pb-3"
                )}
            >
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text">
                            {isTeacher ? "My Courses" : "My Classes"}
                        </h1>
                        {isTeacher && <Sparkles className="h-5 w-5 text-amber-500" />}
                    </div>
                    <p className="text-muted-foreground text-lg">
                        {isTeacher
                            ? "Create, manage, and track your course content."
                            : "Pick up where you left off."}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    {isTeacher && (
                        <Button asChild className="gap-2 bg-gradient-to-r from-primary to-primary/80">
                            <Link href="/dashboard/courses/new">
                                <PlusCircle className="h-4 w-4" />
                                Create Course
                            </Link>
                        </Button>
                    )}
                </div>
            </motion.div>

            {/* Stats Overview */}
            {isTeacher && courses && courses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatsCard
                        title={isTeacher ? "Total Courses" : "Enrolled Courses"}
                        value={stats.total}
                        icon={BookOpen}
                        description={isTeacher ? "Courses created" : "Active enrollments"}
                        index={0}
                        {...gradientPresets.blue}
                    />
                    <StatsCard
                        title="Total Chapters"
                        value={stats.chapters}
                        icon={GraduationCap}
                        description={isTeacher ? "Across all courses" : "Available to learn"}
                        index={1}
                        {...gradientPresets.purple}
                    />
                    <StatsCard
                        title={isTeacher ? "Published" : "Completed"}
                        value={isTeacher ? stats.published : 0}
                        icon={TrendingUp}
                        description={isTeacher ? "Live courses" : "Keep learning!"}
                        trend={isTeacher && stats.published > 0 ? "success" : "neutral"}
                        index={2}
                        {...gradientPresets.emerald}
                    />
                </div>
            )}

            {/* Courses Grid */}
            {!hasCourses ? (
                <EmptyState
                    icon={BookOpen}
                    title={searchQuery ? "No courses found" : "No courses yet"}
                    description={
                        searchQuery
                            ? `No courses match "${searchQuery}". Try a different search.`
                            : isTeacher
                                ? "You haven't created any courses yet. Start by creating your first course."
                                : "You are not enrolled in any courses yet."
                    }
                    iconColor="text-blue-500"
                    iconBgColor="bg-blue-500/10"
                    action={
                        searchQuery
                            ? {
                                label: "Clear Search",
                                variant: "outline",
                                onClick: () => setSearchQuery(""),
                            }
                            : isTeacher
                                ? {
                                    label: "Create Course",
                                    icon: PlusCircle,
                                    href: "/dashboard/courses/new",
                                }
                                : {
                                    label: "Refresh",
                                    href: "/dashboard/courses/my",
                                    variant: "outline",
                                }
                    }
                />
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className={cn(
                        "grid gap-6",
                        isTeacher
                            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                            : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                    )}
                >
                    <AnimatePresence>
                        {filteredCourses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <CourseCard
                                    id={course.id}
                                    title={course.title}
                                    description={course.description}
                                    teacherName={isTeacher ? "You" : course.teacher?.name}
                                    chapterCount={course._count?.chapters || 0}
                                    progress={undefined}
                                    isTeacher={isTeacher}
                                    imageUrl={course.imageUrl}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
}
