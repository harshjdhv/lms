"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import {
    BookOpen,
    FileText,
    Clock,
    CheckCircle2,
    Megaphone,
    ArrowRight,
    Sparkles,
    Calendar,
    Target,
    BookMarked,
    RefreshCw,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Progress } from "@workspace/ui/components/progress"
import { Skeleton } from "@workspace/ui/components/skeleton"
import Link from "next/link"

import { StatsCard, StatsCardSkeleton, gradientPresets } from "@/components/ui/stats-card"
import { ProgressRing } from "@/components/ui/progress-ring"
import { AssignmentFeed } from "@/components/assignments/assignment-feed"
import { StudentAnnouncementFeed } from "@/components/announcements/student-announcement-feed"
import { StudentCourseCatalog } from "@/components/courses/student-course-catalog"
import { useAssignments } from "@/hooks/queries/use-assignments"
import { useAnnouncements } from "@/hooks/queries/use-announcements"
import { useMyCourses } from "@/hooks/queries/use-courses"
import { cn } from "@/lib/utils"

interface StudentDashboardProps {
    studentName?: string
}

export function StudentDashboard({ studentName = "Student" }: StudentDashboardProps) {

    const { data: assignments = [], isLoading: assignmentsLoading, refetch: refetchAssignments, isFetching } = useAssignments()
    const { data: announcements = [], isLoading: announcementsLoading } = useAnnouncements()
    const { data: courses = [], isLoading: coursesLoading } = useMyCourses()

    const isLoading = assignmentsLoading || announcementsLoading || coursesLoading

    // Calculate stats
    const stats = useMemo(() => {
        const activeAssignments = assignments.filter(a => a.status === 'ACTIVE')
        const pendingSubmissions = assignments.filter(a => {
            const sub = a.submissions?.[0]
            return a.status === 'ACTIVE' && (!sub || sub.status === 'PENDING')
        })
        const completedAssignments = assignments.filter(a => {
            const sub = a.submissions?.[0]
            return sub?.status === 'APPROVED'
        })
        const dueSoon = assignments.filter(a => {
            if (!a.dueDate || a.status !== 'ACTIVE') return false
            const due = new Date(a.dueDate)
            const now = new Date()
            const diff = due.getTime() - now.getTime()
            const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
            return days >= 0 && days <= 3 && !a.submissions?.[0]
        })

        const completionRate = activeAssignments.length > 0
            ? Math.round((completedAssignments.length / assignments.length) * 100)
            : 0

        return {
            enrolledCourses: courses.length,
            activeAssignments: activeAssignments.length,
            pendingSubmissions: pendingSubmissions.length,
            completedAssignments: completedAssignments.length,
            dueSoon: dueSoon.length,
            recentAnnouncements: announcements.length,
            completionRate,
        }
    }, [assignments, courses, announcements])

    // Get upcoming deadlines
    const upcomingDeadlines = useMemo(() => {
        return assignments
            .filter(a => a.dueDate && a.status === 'ACTIVE' && !a.submissions?.[0])
            .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
            .slice(0, 5)
    }, [assignments])

    return (
        <div className="flex w-full min-w-0 flex-col overflow-x-hidden animate-in fade-in-50 duration-500">
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col justify-between gap-4 border-b bg-background px-6 py-5 lg:flex-row lg:items-center"
            >
                <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2.5">
                        <h1 className="min-w-0 text-xl font-semibold tracking-tight sm:text-2xl">
                            Welcome back, {studentName.split(' ')[0]}
                        </h1>
                        <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Track your progress, complete assignments, and stay updated.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                        {stats.dueSoon > 0 && (
                            <span className="text-xs text-amber-600 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {stats.dueSoon} due soon
                            </span>
                        )}
                        {stats.completedAssignments > 0 && (
                            <span className="text-xs text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                {stats.completedAssignments} completed
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => refetchAssignments()}
                        disabled={isFetching}
                        className="shrink-0"
                    >
                        <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
                    </Button>
                    <StudentCourseCatalog />
                    <Button asChild className="w-full gap-2 sm:w-auto rounded-none">
                        <Link href="/dashboard/assignments">
                            <FileText className="h-4 w-4" />
                            View All Assignments
                        </Link>
                    </Button>
                </div>
            </motion.div>

            {/* Stats Row — grid cells divided by lines */}
            <div className="grid grid-cols-2 border-b lg:grid-cols-4 divide-x divide-border">
                {isLoading ? (
                    [...Array(4)].map((_, i) => (
                        <StatsCardSkeleton key={i} />
                    ))
                ) : (
                    <>
                        <StatsCard
                            title="Enrolled Courses"
                            value={stats.enrolledCourses}
                            icon={BookOpen}
                            description="Active enrollments"
                            trend="neutral"
                            index={0}
                            {...gradientPresets.blue}
                        />
                        <StatsCard
                            title="Active Assignments"
                            value={stats.activeAssignments}
                            icon={FileText}
                            description={stats.dueSoon > 0 ? `${stats.dueSoon} due soon` : "Keep it up!"}
                            trend={stats.dueSoon > 0 ? "warning" : "neutral"}
                            index={1}
                            {...gradientPresets.purple}
                        />
                        <StatsCard
                            title="Completed"
                            value={stats.completedAssignments}
                            icon={CheckCircle2}
                            description={`${stats.completionRate}% completion rate`}
                            trend="success"
                            index={2}
                            {...gradientPresets.emerald}
                        />
                        <StatsCard
                            title="Announcements"
                            value={stats.recentAnnouncements}
                            icon={Megaphone}
                            description="Recent updates"
                            trend="neutral"
                            index={3}
                            {...gradientPresets.amber}
                        />
                    </>
                )}
            </div>

            {/* Hatched divider */}
            <div
                className="h-4 w-full border-b shrink-0"
                style={{
                    backgroundImage: "repeating-linear-gradient(45deg, var(--color-border) 0, var(--color-border) 1px, transparent 0, transparent 50%)",
                    backgroundSize: "6px 6px",
                }}
            />

            {/* Row 1: Recent Assignments + Your Progress */}
            <div className="grid grid-cols-1 xl:grid-cols-3 border-b border-border">
                {/* Left: Recent Assignments */}
                <div className="xl:col-span-2 xl:border-r border-b xl:border-b-0 border-border">
                    <AssignmentFeed className="h-[500px]" />
                </div>

                {/* Right: Your Progress */}
                <div>
                    <div className="flex items-center justify-between px-6 py-4 border-b">
                        <h2 className="text-sm font-medium flex items-center gap-2">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            Your Progress
                        </h2>
                        <ProgressRing
                            progress={stats.completionRate}
                            size="sm"
                            color="primary"
                        />
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col gap-8 w-full items-center">
                            <div className="w-full max-w-[200px]">
                                <ProgressItem
                                    label="Pending"
                                    value={stats.pendingSubmissions}
                                    total={stats.activeAssignments}
                                    color="amber"
                                    icon={Clock}
                                />
                            </div>
                            <div className="w-full max-w-[200px]">
                                <ProgressItem
                                    label="Completed"
                                    value={stats.completedAssignments}
                                    total={assignments.length}
                                    color="emerald"
                                    icon={CheckCircle2}
                                />
                            </div>
                            <div className="w-full max-w-[200px]">
                                <ProgressItem
                                    label="Courses"
                                    value={stats.enrolledCourses}
                                    total={stats.enrolledCourses}
                                    color="blue"
                                    icon={BookMarked}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hatched divider */}
            <div
                className="h-4 w-full border-b shrink-0"
                style={{
                    backgroundImage: "repeating-linear-gradient(45deg, var(--color-border) 0, var(--color-border) 1px, transparent 0, transparent 50%)",
                    backgroundSize: "6px 6px",
                }}
            />

            {/* Row 2: Recent Announcements + Upcoming Deadlines */}
            <div className="grid grid-cols-1 xl:grid-cols-3">
                {/* Left: Recent Announcements */}
                <div className="xl:col-span-2 xl:border-r border-border">
                    <div className="flex items-center justify-between px-6 py-4 border-b">
                        <h2 className="text-sm font-medium flex items-center gap-2">
                            <Megaphone className="h-4 w-4 text-muted-foreground" />
                            Recent Announcements
                        </h2>
                        <Badge variant="secondary" className="text-xs rounded-none">
                            {stats.recentAnnouncements}
                        </Badge>
                    </div>
                    <div className="p-6">
                        <StudentAnnouncementFeed />
                    </div>
                </div>

                {/* Right: Upcoming Deadlines */}
                <div>
                    <div className="flex items-center justify-between px-6 py-4 border-b">
                        <h2 className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            Upcoming Deadlines
                        </h2>
                    </div>
                    <div className="divide-y divide-border">
                        {upcomingDeadlines.length === 0 ? (
                            <div className="flex flex-1 flex-col items-center justify-center text-center p-6 gap-2">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                <p className="text-sm font-medium text-emerald-600">All caught up!</p>
                                <p className="text-xs text-muted-foreground">No pending deadlines</p>
                            </div>
                        ) : (
                            <>
                                {upcomingDeadlines.map((assignment, index) => (
                                    <DeadlineItem
                                        key={assignment.id}
                                        assignment={assignment}
                                        index={index}
                                    />
                                ))}
                                {assignments.filter(a => a.dueDate && a.status === 'ACTIVE').length > 5 && (
                                    <div className="p-4 border-t">
                                        <Button variant="ghost" size="sm" asChild className="w-full text-xs gap-2 rounded-none">
                                            <Link href="/dashboard/assignments">
                                                View all deadlines
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// Progress Item Component
function ProgressItem({
    label,
    value,
    total,
    color,
    icon: Icon,
}: {
    label: string
    value: number
    total: number
    color: "amber" | "emerald" | "blue"
    icon: typeof Clock
}) {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0
    const colorClasses = {
        amber: {
            text: "text-amber-600",
            progress: "[&>div]:bg-amber-500",
        },
        emerald: {
            text: "text-emerald-600",
            progress: "[&>div]:bg-emerald-500",
        },
        blue: {
            text: "text-blue-600",
            progress: "[&>div]:bg-blue-500",
        },
    }

    return (
        <div className="text-center space-y-2 px-4">
            <Icon className={cn("h-4 w-4 mx-auto", colorClasses[color].text)} />
            <div className="space-y-0.5">
                <p className="text-2xl font-bold tabular-nums">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
            </div>
            <Progress value={percentage} className={cn("h-1", colorClasses[color].progress)} />
        </div>
    )
}

// Deadline Item Component
function DeadlineItem({
    assignment,
    index,
}: {
    assignment: any
    index: number
}) {
    const getDueInfo = () => {
        const due = new Date(assignment.dueDate)
        const now = new Date()
        const diff = due.getTime() - now.getTime()
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

        if (days < 0) return { text: "Overdue", color: "text-red-500", urgent: true }
        if (days === 0) return { text: "Today", color: "text-red-500", urgent: true }
        if (days === 1) return { text: "Tomorrow", color: "text-amber-500", urgent: true }
        if (days <= 3) return { text: `${days} days`, color: "text-amber-500", urgent: false }
        return { text: `${days} days`, color: "text-muted-foreground", urgent: false }
    }

    const dueInfo = getDueInfo()

    return (
        <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: index * 0.04 }}
            className={cn(
                "flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors",
                dueInfo.urgent && "border-l-2 border-l-amber-500"
            )}
        >
            <Clock className={cn("h-3.5 w-3.5 shrink-0", dueInfo.color)} />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{assignment.title}</p>
                <p className="text-xs text-muted-foreground truncate">{assignment.course.title}</p>
            </div>
            <span className={cn("shrink-0 text-xs font-medium", dueInfo.color)}>
                {dueInfo.text}
            </span>
        </motion.div>
    )
}

// Loading skeleton for the dashboard
export function StudentDashboardSkeleton() {
    return (
        <div className="flex w-full min-w-0 flex-col overflow-x-hidden">
            {/* Header Skeleton */}
            <div className="flex flex-col justify-between gap-4 border-b px-6 py-5 md:flex-row md:items-center">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-[min(18rem,100%)]" />
                    <Skeleton className="h-4 w-[min(26rem,100%)]" />
                </div>
                <div className="flex w-full flex-wrap gap-2 md:w-auto md:flex-nowrap">
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-9 w-32 max-w-full" />
                    <Skeleton className="h-9 w-40 max-w-full" />
                </div>
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-2 border-b lg:grid-cols-4 divide-x divide-border">
                {[...Array(4)].map((_, i) => (
                    <StatsCardSkeleton key={i} />
                ))}
            </div>

            {/* Row 1 Skeleton */}
            <div className="grid grid-cols-1 xl:grid-cols-3 border-b border-border">
                <div className="xl:col-span-2 xl:border-r border-b xl:border-b-0 border-border p-6">
                    <Skeleton className="h-[450px] w-full" />
                </div>
                <div className="p-6">
                    <Skeleton className="h-[450px] w-full" />
                </div>
            </div>

            {/* Hatched divider */}
            <div
                className="h-4 w-full border-b shrink-0"
                style={{
                    backgroundImage: "repeating-linear-gradient(45deg, var(--color-border) 0, var(--color-border) 1px, transparent 0, transparent 50%)",
                    backgroundSize: "6px 6px",
                }}
            />

            {/* Row 2 Skeleton */}
            <div className="grid grid-cols-1 xl:grid-cols-3">
                <div className="xl:col-span-2 xl:border-r border-b xl:border-b-0 border-border p-6">
                    <Skeleton className="h-[300px] w-full" />
                </div>
                <div className="p-6">
                    <Skeleton className="h-[300px] w-full" />
                </div>
            </div>
        </div>
    )
}
