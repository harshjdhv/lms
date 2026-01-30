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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card"
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
        <div className="flex flex-col gap-8 animate-in fade-in-50 duration-500">
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b"
            >
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                            Welcome back, {studentName.split(' ')[0]} 👋
                        </h1>
                        <Sparkles className="h-6 w-6 text-amber-500 animate-pulse" />
                    </div>
                    <p className="text-muted-foreground text-lg">
                        Track your progress, complete assignments, and stay updated.
                    </p>
                    {/* Quick stats inline */}
                    <div className="flex items-center gap-4 pt-2">
                        {stats.dueSoon > 0 && (
                            <div className="flex items-center gap-1.5 text-sm text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full">
                                <Clock className="h-3.5 w-3.5" />
                                <span className="font-medium">{stats.dueSoon} due soon</span>
                            </div>
                        )}
                        {stats.completedAssignments > 0 && (
                            <div className="flex items-center gap-1.5 text-sm text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span className="font-medium">{stats.completedAssignments} completed</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => refetchAssignments()}
                        disabled={isFetching}
                        className="transition-transform hover:scale-105"
                    >
                        <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
                    </Button>
                    <StudentCourseCatalog />
                    <Button asChild className="gap-2 bg-gradient-to-r from-primary to-primary/80">
                        <Link href="/dashboard/assignments">
                            <FileText className="h-4 w-4" />
                            View All Assignments
                        </Link>
                    </Button>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoading ? (
                    [...Array(4)].map((_, i) => <StatsCardSkeleton key={i} />)
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

            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column - Assignments & Progress */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Progress Overview Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        <Card className="overflow-hidden border shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                            <Target className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">Your Progress</CardTitle>
                                            <CardDescription>Assignment completion overview</CardDescription>
                                        </div>
                                    </div>
                                    <ProgressRing
                                        progress={stats.completionRate}
                                        size="sm"
                                        color="primary"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-3 gap-6">
                                    <ProgressItem
                                        label="Pending"
                                        value={stats.pendingSubmissions}
                                        total={stats.activeAssignments}
                                        color="amber"
                                        icon={Clock}
                                    />
                                    <ProgressItem
                                        label="Completed"
                                        value={stats.completedAssignments}
                                        total={assignments.length}
                                        color="emerald"
                                        icon={CheckCircle2}
                                    />
                                    <ProgressItem
                                        label="Courses"
                                        value={stats.enrolledCourses}
                                        total={stats.enrolledCourses}
                                        color="blue"
                                        icon={BookMarked}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Assignments Feed */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                    >
                        <AssignmentFeed />
                    </motion.div>
                </div>

                {/* Right Column - Deadlines & Announcements */}
                <div className="space-y-6">
                    {/* Upcoming Deadlines Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                    >
                        <Card className="overflow-hidden border shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border-b pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
                                        <CardDescription>Don't miss these!</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                {upcomingDeadlines.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <div className="rounded-full bg-emerald-500/10 p-3 mb-3">
                                            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                        </div>
                                        <p className="font-medium text-emerald-600">All caught up!</p>
                                        <p className="text-sm text-muted-foreground">No pending deadlines</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {upcomingDeadlines.map((assignment, index) => (
                                            <DeadlineItem
                                                key={assignment.id}
                                                assignment={assignment}
                                                index={index}
                                            />
                                        ))}
                                        {assignments.filter(a => a.dueDate && a.status === 'ACTIVE').length > 5 && (
                                            <Button variant="ghost" size="sm" asChild className="w-full gap-2 mt-2">
                                                <Link href="/dashboard/assignments">
                                                    View all deadlines
                                                    <ArrowRight className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Announcements */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.5 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/10 flex items-center justify-center">
                                <Megaphone className="h-4 w-4 text-purple-600" />
                            </div>
                            <h2 className="text-xl font-semibold tracking-tight">Announcements</h2>
                            <Badge variant="secondary" className="ml-auto">
                                {stats.recentAnnouncements}
                            </Badge>
                        </div>
                        <StudentAnnouncementFeed />
                    </motion.div>
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
            bg: "bg-amber-500/10",
            text: "text-amber-600",
            progress: "[&>div]:bg-amber-500",
        },
        emerald: {
            bg: "bg-emerald-500/10",
            text: "text-emerald-600",
            progress: "[&>div]:bg-emerald-500",
        },
        blue: {
            bg: "bg-blue-500/10",
            text: "text-blue-600",
            progress: "[&>div]:bg-blue-500",
        },
    }

    return (
        <div className="text-center space-y-2">
            <div className={cn("mx-auto h-12 w-12 rounded-full flex items-center justify-center", colorClasses[color].bg)}>
                <Icon className={cn("h-5 w-5", colorClasses[color].text)} />
            </div>
            <div className="space-y-1">
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
            </div>
            <Progress value={percentage} className={cn("h-1.5", colorClasses[color].progress)} />
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

        if (days < 0) return { text: "Overdue", color: "text-red-500", bg: "bg-red-500/10", urgent: true }
        if (days === 0) return { text: "Today", color: "text-red-500", bg: "bg-red-500/10", urgent: true }
        if (days === 1) return { text: "Tomorrow", color: "text-amber-500", bg: "bg-amber-500/10", urgent: true }
        if (days <= 3) return { text: `${days} days`, color: "text-amber-500", bg: "bg-amber-500/10", urgent: false }
        return { text: `${days} days`, color: "text-muted-foreground", bg: "bg-muted", urgent: false }
    }

    const dueInfo = getDueInfo()

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-sm",
                dueInfo.urgent && "border-l-4 border-l-amber-500"
            )}
        >
            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", dueInfo.bg)}>
                <Clock className={cn("h-4 w-4", dueInfo.color)} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{assignment.title}</p>
                <p className="text-xs text-muted-foreground truncate">{assignment.course.title}</p>
            </div>
            <Badge variant="outline" className={cn("shrink-0 text-xs", dueInfo.color)}>
                {dueInfo.text}
            </Badge>
        </motion.div>
    )
}

// Loading skeleton for the dashboard
export function StudentDashboardSkeleton() {
    return (
        <div className="flex flex-col gap-8">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-72" />
                    <Skeleton className="h-5 w-96" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-40" />
                </div>
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <StatsCardSkeleton key={i} />
                ))}
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-6">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-96 w-full rounded-xl" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-64 w-full rounded-xl" />
                    <Skeleton className="h-80 w-full rounded-xl" />
                </div>
            </div>
        </div>
    )
}
