"use client"

import { useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    BookOpen,
    Users,
    FileText,
    Clock,
    Plus,
    BarChart3,
    Sparkles,
    Eye,
    PauseCircle,
    PlayCircle,
    MoreHorizontal,
    Megaphone,
    ArrowRight,
} from "lucide-react"

import Link from "next/link"

import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@workspace/ui/components/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@workspace/ui/components/dropdown-menu"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { toast } from "sonner"

import { StatsCard, StatsCardSkeleton, gradientPresets } from "@/components/ui/stats-card"
import { EmptyState } from "@/components/ui/empty-state"
import { ReviewSubmissionsDialog } from "@/components/assignments/review-submissions-dialog"
import { useAssignments, useUpdateAssignmentStatus } from "@/hooks/queries/use-assignments"
import { useAnnouncements } from "@/hooks/queries/use-announcements"
import { TeacherAnnouncementList } from "@/components/announcements/teacher-announcement-list"
import { cn } from "@/lib/utils"

interface Course {
    id: string
    title: string
}

interface TeacherDashboardProps {
    courses: Course[]
    teacherName?: string
}

export function TeacherDashboard({ courses, teacherName = "Teacher" }: TeacherDashboardProps) {
    const { data: assignments = [], isLoading: isLoadingAssignments } = useAssignments()
    const { data: announcements = [], isLoading: isLoadingAnnouncements } = useAnnouncements()
    const updateStatusMutation = useUpdateAssignmentStatus()

    // Calculate stats
    const stats = useMemo(() => {
        const activeAssignments = assignments.filter(a => a.status === "ACTIVE")
        const totalSubmissions = assignments.reduce((acc, a) => acc + (a._count?.submissions || 0), 0)
        const pendingReview = assignments.filter(a =>
            a.status === "ACTIVE" && (a._count?.submissions || 0) > 0
        ).length

        return {
            activeCourses: courses.length,
            activeAssignments: activeAssignments.length,
            totalSubmissions,
            pendingReview,
        }
    }, [assignments, courses])



    const onUpdateStatus = async (id: string, status: string) => {
        try {
            await updateStatusMutation.mutateAsync({ id, status })
            toast.success(`Assignment marked as ${status.toLowerCase()}`)
        } catch {
            toast.error("Failed to update status")
        }
    }

    return (
        <div className="flex flex-col gap-8 animate-in fade-in-50 duration-500">
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b"
            >
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/60 bg-clip-text">
                            Welcome back, {teacherName.split(' ')[0]}
                        </h1>
                        <Sparkles className="h-6 w-6 text-amber-500 animate-pulse" />
                    </div>
                    <p className="text-muted-foreground text-lg">
                        Manage your courses, track submissions, and engage with your students.
                    </p>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoadingAssignments ? (
                    [...Array(4)].map((_, i) => <StatsCardSkeleton key={i} />)
                ) : (
                    <>
                        <StatsCard
                            title="Active Courses"
                            value={stats.activeCourses}
                            icon={BookOpen}
                            description={`${courses.length} total courses`}
                            trend="neutral"
                            index={0}
                            {...gradientPresets.blue}
                        />
                        <StatsCard
                            title="Active Assignments"
                            value={stats.activeAssignments}
                            icon={FileText}
                            description="Currently active"
                            trend="success"
                            index={1}
                            {...gradientPresets.purple}
                        />
                        <StatsCard
                            title="Total Submissions"
                            value={stats.totalSubmissions}
                            icon={Users}
                            description="From all assignments"
                            trend="neutral"
                            index={2}
                            {...gradientPresets.emerald}
                        />
                        <StatsCard
                            title="Pending Reviews"
                            value={stats.pendingReview}
                            icon={Clock}
                            description="Need your attention"
                            trend={stats.pendingReview > 0 ? "warning" : "success"}
                            index={3}
                            {...gradientPresets.amber}
                        />
                    </>
                )}
            </div>

            {/* Dashboard Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column: Recent Activity */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Recent Assignments */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Recent Assignments
                            </h2>
                            <Button variant="ghost" size="sm" asChild className="gap-1">
                                <Link href="/dashboard/assignments">
                                    View All <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                        <AssignmentTable
                            assignments={assignments.slice(0, 5)}
                            isLoading={isLoadingAssignments}
                            onUpdateStatus={onUpdateStatus}
                        />
                    </div>

                    {/* Recent Announcements */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                                <Megaphone className="h-5 w-5 text-orange-500" />
                                Recent Announcements
                            </h2>
                            <Button variant="ghost" size="sm" asChild className="gap-1">
                                <Link href="/dashboard/announcements">
                                    View All <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                        <TeacherAnnouncementList
                            announcements={announcements.slice(0, 3)}
                            isLoading={isLoadingAnnouncements}
                        />
                    </div>
                </div>

                {/* Right Column: Quick Actions & Courses */}
                <div className="space-y-8">
                    {/* Quick Actions */}
                    <Card className="border-none shadow-md bg-linear-to-b from-primary/5 to-transparent">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Common tasks you might need to do</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button className="w-full justify-start h-auto py-3 px-4" asChild>
                                <Link href="/dashboard/create-assignments">
                                    <div className="bg-primary/20 p-2 rounded-full mr-3">
                                        <Plus className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">Create Assignment</span>
                                        <span className="text-xs text-muted-foreground font-normal">Task for students</span>
                                    </div>
                                </Link>
                            </Button>
                            <Button className="w-full justify-start h-auto py-3 px-4" variant="outline" asChild>
                                <Link href="/dashboard/create-announcements">
                                    <div className="bg-orange-500/10 p-2 rounded-full mr-3">
                                        <Megaphone className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">Post Announcement</span>
                                        <span className="text-xs text-muted-foreground font-normal">Update for class</span>
                                    </div>
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Your Courses Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Your Courses</span>
                                <Badge variant="secondary">{courses.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {courses.slice(0, 4).map((course) => (
                                <div key={course.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <BookOpen className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium truncate max-w-[150px]">{course.title}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                                        <Link href={`/dashboard/courses/${course.id}`}>
                                            <ArrowRight className="h-3 w-3" />
                                        </Link>
                                    </Button>
                                </div>
                            ))}
                            {courses.length > 4 && (
                                <Button variant="link" className="w-full h-auto p-0 pt-2 text-muted-foreground text-xs" asChild>
                                    <Link href="/dashboard/courses/my">View all courses</Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

        </div>
    )
}

// Enhanced Assignment Table Component
export function AssignmentTable({
    assignments,
    isLoading,
    onUpdateStatus,
}: {
    assignments: any[]
    isLoading: boolean
    onUpdateStatus: (id: string, status: string) => void
}) {
    if (isLoading) {
        return <AssignmentTableSkeleton />
    }

    if (assignments.length === 0) {
        return (
            <EmptyState
                icon={FileText}
                title="No Assignments Yet"
                description="Create your first assignment to engage students with coursework and track their progress."
                iconColor="text-purple-500"
                iconBgColor="bg-purple-500/10"
                action={{
                    label: "Create Assignment",
                    icon: Plus,
                    onClick: () => document.getElementById('create-assignment-section')?.scrollIntoView({ behavior: 'smooth' })
                }}
            />
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Card className="overflow-hidden border shadow-lg">
                <CardHeader className="bg-linear-to-r from-muted/50 to-transparent border-b py-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Assignment Overview
                    </CardTitle>
                    <CardDescription>
                        Manage and review all your course assignments
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead className="w-[300px]">Assignment</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Submissions</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence>
                                {assignments.map((assignment, index) => (
                                    <motion.tr
                                        key={assignment.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group hover:bg-muted/50 transition-colors"
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "h-10 w-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
                                                    assignment.status === "ACTIVE"
                                                        ? "bg-linear-to-br from-primary/20 to-primary/10 text-primary"
                                                        : "bg-muted text-muted-foreground"
                                                )}>
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{assignment.title}</span>
                                                    <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                                                        {assignment.content}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-normal">
                                                {assignment.course.title}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={assignment.status} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "h-2 w-2 rounded-full",
                                                    (assignment._count?.submissions || 0) > 0
                                                        ? "bg-emerald-500"
                                                        : "bg-muted"
                                                )} />
                                                <span className="font-medium">
                                                    {assignment._count?.submissions || 0}
                                                </span>
                                                <span className="text-muted-foreground text-xs">
                                                    submitted
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {assignment.dueDate
                                                ? new Date(assignment.dueDate).toLocaleDateString()
                                                : "—"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <ReviewSubmissionsDialog
                                                        assignmentId={assignment.id}
                                                        assignmentTitle={assignment.title}
                                                        trigger={
                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Review Submissions
                                                            </DropdownMenuItem>
                                                        }
                                                    />
                                                    {assignment.status === 'ACTIVE' ? (
                                                        <DropdownMenuItem onClick={() => onUpdateStatus(assignment.id, 'STOPPED')}>
                                                            <PauseCircle className="mr-2 h-4 w-4" />
                                                            Stop / Close
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem onClick={() => onUpdateStatus(assignment.id, 'ACTIVE')}>
                                                            <PlayCircle className="mr-2 h-4 w-4" />
                                                            Activate
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </motion.div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const config = {
        ACTIVE: {
            label: "Active",
            className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/50",
        },
        STOPPED: {
            label: "Stopped",
            className: "bg-red-100 text-red-700 hover:bg-red-100 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900/50",
        },
        DRAFT: {
            label: "Draft",
            className: "bg-muted text-muted-foreground",
        },
    }

    const { label, className } = config[status as keyof typeof config] || config.DRAFT

    return <Badge variant="outline" className={className}>{label}</Badge>
}

function AssignmentTableSkeleton() {
    return (
        <Card className="overflow-hidden border shadow-lg">
            <CardHeader className="bg-linear-to-r from-muted/50 to-transparent border-b py-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent className="p-0">
                <div className="p-4 space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                            <Skeleton className="h-6 w-16 rounded-full" />
                            <Skeleton className="h-6 w-20" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
