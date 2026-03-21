"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import Link from "next/link";
import {
    PlusCircle,
    BookOpen,
    GraduationCap,
    TrendingUp,
    Search,
    Sparkles,
    Edit,
    PlayCircle,
} from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { useMyCourses } from "@/hooks/queries/use-courses";
import { StatsCard, gradientPresets, StatsCardSkeleton } from "@/components/ui/stats-card";
import { EmptyState } from "@/components/ui/empty-state";
import { useState, useMemo } from "react";
import { cn } from "@workspace/ui/lib/utils";

interface MyCoursesViewProps {
    isTeacher: boolean;
}

const COURSE_GRADIENTS = [
    "from-sky-600 to-cyan-500",
    "from-emerald-600 to-teal-500",
    "from-orange-500 to-amber-500",
    "from-rose-600 to-pink-500",
    "from-indigo-600 to-violet-500",
    "from-blue-700 to-indigo-500",
] as const;

function getCourseGradient(id: string) {
    const index = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % COURSE_GRADIENTS.length;
    return COURSE_GRADIENTS[index] ?? COURSE_GRADIENTS[0];
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

    const hasCourses = filteredCourses && filteredCourses.length > 0;
    const showStats = isTeacher && courses && courses.length > 0;

    if (isLoading) {
        return (
            <div className="flex w-full min-w-0 flex-col overflow-x-hidden animate-in fade-in-50 duration-500">
                <div className="flex flex-col justify-between gap-4 border-b bg-background px-6 py-5 lg:flex-row lg:items-center">
                    <div className="space-y-2">
                        <div className="h-7 w-40 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-64 bg-muted/50 rounded animate-pulse" />
                    </div>
                    <div className="flex gap-3">
                        <div className="h-9 w-48 bg-muted rounded animate-pulse" />
                        {isTeacher && <div className="h-9 w-32 bg-muted rounded animate-pulse" />}
                    </div>
                </div>
                {isTeacher && (
                    <div className="grid grid-cols-3 border-b divide-x divide-border">
                        <StatsCardSkeleton />
                        <StatsCardSkeleton />
                        <StatsCardSkeleton />
                    </div>
                )}
                <div className="h-4 w-full border-b shrink-0" style={{ backgroundImage: "repeating-linear-gradient(45deg, var(--color-border) 0, var(--color-border) 1px, transparent 0, transparent 50%)", backgroundSize: "6px 6px" }} />
                <div className="px-6 py-6">
                    <div className="border border-border" style={{ backgroundImage: "repeating-linear-gradient(45deg, var(--color-border) 0, var(--color-border) 1px, transparent 0, transparent 50%)", backgroundSize: "6px 6px" }}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-1.5 p-1.5">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="h-52 bg-muted/60 animate-pulse" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex w-full min-w-0 flex-col overflow-x-hidden animate-in fade-in-50 duration-500">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col justify-between gap-4 border-b bg-background px-6 py-5 lg:flex-row lg:items-center"
            >
                <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2.5">
                        <h1 className="min-w-0 text-xl font-semibold tracking-tight sm:text-2xl">
                            {isTeacher ? "My Courses" : "My Classes"}
                        </h1>
                        {isTeacher && <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {isTeacher ? "Create, manage, and track your course content." : "Pick up where you left off."}
                    </p>
                </div>
                <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:flex-nowrap">
                    <div className="relative flex-1 sm:flex-none sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 rounded-none"
                        />
                    </div>
                    {isTeacher && (
                        <Button asChild className="gap-2 rounded-none">
                            <Link href="/dashboard/courses/new">
                                <PlusCircle className="h-4 w-4" />
                                Create Course
                            </Link>
                        </Button>
                    )}
                </div>
            </motion.div>

            {/* Stats Row — teacher only */}
            {showStats && (
                <div className="grid grid-cols-3 border-b divide-x divide-border">
                    <StatsCard title="Total Courses" value={stats.total} icon={BookOpen} description="Courses created" index={0} {...gradientPresets.blue} />
                    <StatsCard title="Total Chapters" value={stats.chapters} icon={GraduationCap} description="Across all courses" index={1} {...gradientPresets.purple} />
                    <StatsCard title="Published" value={stats.published} icon={TrendingUp} description="Live courses" trend={stats.published > 0 ? "success" : "neutral"} index={2} {...gradientPresets.emerald} />
                </div>
            )}

            {/* Hatched Divider */}
            <div
                className="h-4 w-full border-b shrink-0"
                style={{
                    backgroundImage: "repeating-linear-gradient(45deg, var(--color-border) 0, var(--color-border) 1px, transparent 0, transparent 50%)",
                    backgroundSize: "6px 6px",
                }}
            />

            {/* Courses Grid */}
            {!hasCourses ? (
                <div className="flex flex-1 items-center justify-center px-6 py-12">
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
                                ? { label: "Clear Search", variant: "outline", onClick: () => setSearchQuery("") }
                                : isTeacher
                                    ? { label: "Create Course", icon: PlusCircle, href: "/dashboard/courses/new" }
                                    : { label: "Refresh", href: "/dashboard/courses/my", variant: "outline" }
                        }
                    />
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="px-6 py-6"
                >
                    {/* Hatched-gap grid: cards float on shader background, gaps show the hatched pattern */}
                    <div
                        className="border border-border"
                        style={{
                            backgroundImage: "repeating-linear-gradient(45deg, var(--color-border) 0, var(--color-border) 1px, transparent 0, transparent 50%)",
                            backgroundSize: "6px 6px",
                        }}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-1.5 p-1.5">
                            <AnimatePresence>
                                {filteredCourses.map((course, index) => (
                                    <motion.div
                                        key={course.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25, delay: index * 0.04 }}
                                    >
                                        <CourseBorderedItem
                                            id={course.id}
                                            title={course.title}
                                            description={course.description}
                                            teacherName={isTeacher ? "You" : course.teacher?.name}
                                            chapterCount={course._count?.chapters || 0}
                                            isTeacher={isTeacher}
                                            imageUrl={course.imageUrl}
                                            isPublished={course.isPublished}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

interface CourseBorderedItemProps {
    id: string;
    title: string;
    description?: string | null;
    teacherName?: string | null;
    chapterCount: number;
    isTeacher: boolean;
    imageUrl?: string | null;
    isPublished?: boolean;
}

function CourseBorderedItem({ id, title, description, teacherName, chapterCount, isTeacher, imageUrl, isPublished }: CourseBorderedItemProps) {
    const gradient = getCourseGradient(id);
    const initial = (isTeacher ? "T" : (teacherName || title || "C")).trim().charAt(0).toUpperCase();

    return (
        <Link href={`/dashboard/courses/${id}`} className="group flex flex-col h-full bg-card hover:bg-muted/40 transition-colors">
            {/* Image / Gradient header */}
            <div className={cn("relative h-28 overflow-hidden bg-linear-to-r border-b border-border", gradient)}>
                {imageUrl ? (
                    <img src={imageUrl} alt={title} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="h-7 w-7 text-white/60" />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-2.5 right-3 flex h-7 w-7 items-center justify-center border-2 border-background bg-white font-semibold text-foreground text-xs shadow-sm rounded-full">
                    {initial}
                </div>
                {isTeacher && (
                    <div className="absolute top-2.5 left-3">
                        <span className={cn(
                            "text-[10px] font-medium px-1.5 py-0.5 border",
                            isPublished
                                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-100"
                                : "bg-black/30 border-white/20 text-white/80"
                        )}>
                            {isPublished ? "Published" : "Draft"}
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-3.5 gap-2">
                <div>
                    <h3 className="font-semibold text-sm truncate leading-snug">{title}</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {isTeacher ? "Your class" : (teacherName || "Course")}
                    </p>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2 flex-1 leading-relaxed">
                    {description || (isTeacher ? "Manage this class content and updates." : "Continue learning from the latest class material.")}
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-border">
                    <Badge variant="secondary" className="rounded-none text-[10px] px-1.5 py-0.5">
                        {chapterCount} {chapterCount === 1 ? "topic" : "topics"}
                    </Badge>
                    <span className="flex items-center gap-1 text-[11px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        {isTeacher ? (
                            <><Edit className="h-3 w-3" />Manage</>
                        ) : (
                            <><PlayCircle className="h-3 w-3" />Open</>
                        )}
                    </span>
                </div>
            </div>
        </Link>
    );
}
