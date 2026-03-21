"use client"

import { useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    BookOpen,
    Users,
    FileText,
    Clock,
    Plus,
    Sparkles,
    Eye,
    PauseCircle,
    PlayCircle,
    MoreHorizontal,
    Megaphone,
    ArrowRight,
} from "lucide-react"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
    Card,
    CardContent,
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
    const router = useRouter()
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
        <div className="flex flex-col animate-in fade-in-50 duration-500">
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b px-6 py-5"
            >
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                            Welcome back, {teacherName.split(' ')[0]}
                        </h1>
                        <Sparkles className="h-4 w-4 text-amber-500" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Manage your courses, track submissions, and engage with your students.
                    </p>
                </div>
            </motion.div>

            {/* Stats Row — grid cells divided by lines */}
            <div className="grid grid-cols-2 border-b lg:grid-cols-4 divide-x divide-border">
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

            {/* Hatched divider */}
            <div
                className="h-4 w-full border-b shrink-0"
                style={{
                    backgroundImage: "repeating-linear-gradient(45deg, var(--color-border) 0, var(--color-border) 1px, transparent 0, transparent 50%)",
                    backgroundSize: "6px 6px",
                }}
            />

            {/* Row 1: Recent Assignments + Quick Actions */}
            <div className="grid grid-cols-1 xl:grid-cols-3 border-b border-border">
                {/* Left: Recent Assignments */}
                <div className="xl:col-span-2 xl:border-r border-b xl:border-b-0 border-border">
                    <div className="flex items-center justify-between px-6 py-4 border-b">
                        <h2 className="text-sm font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            Recent Assignments
                        </h2>
                        <Button variant="ghost" size="sm" asChild className="gap-1 text-xs h-7 rounded-none">
                            <Link href="/dashboard/assignments">
                                View All <ArrowRight className="h-3 w-3" />
                            </Link>
                        </Button>
                    </div>
                    <AssignmentTable
                        assignments={assignments.slice(0, 5)}
                        isLoading={isLoadingAssignments}
                        onUpdateStatus={onUpdateStatus}
                        onCreateAssignment={() => router.push("/dashboard/create-assignments")}
                    />
                </div>

                {/* Right: Quick Actions */}
                <div>
                    <div className="px-6 py-4 border-b">
                        <h2 className="text-sm font-medium">Quick Actions</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Common tasks</p>
                    </div>
                    <div className="p-4 space-y-2">
                        <Button className="w-full justify-start gap-3 rounded-none h-11" asChild>
                            <Link href="/dashboard/create-assignments">
                                <Plus className="h-4 w-4" />
                                <span className="text-sm font-medium">Create Assignment</span>
                            </Link>
                        </Button>
                        <Button className="w-full justify-start gap-3 rounded-none h-11" variant="outline" asChild>
                            <Link href="/dashboard/create-announcements">
                                <Megaphone className="h-4 w-4" />
                                <span className="text-sm font-medium">Post Announcement</span>
                            </Link>
                        </Button>
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

            {/* Row 2: Recent Announcements + Your Courses */}
            <div className="grid grid-cols-1 xl:grid-cols-3">
                {/* Left: Recent Announcements */}
                <div className="xl:col-span-2 xl:border-r border-border">
                    <div className="flex items-center justify-between px-6 py-4 border-b">
                        <h2 className="text-sm font-medium flex items-center gap-2">
                            <Megaphone className="h-4 w-4 text-muted-foreground" />
                            Recent Announcements
                        </h2>
                        <Button variant="ghost" size="sm" asChild className="gap-1 text-xs h-7 rounded-none">
                            <Link href="/dashboard/create-announcements">
                                Manage <ArrowRight className="h-3 w-3" />
                            </Link>
                        </Button>
                    </div>
                    <div className="p-6">
                        <TeacherAnnouncementList
                            announcements={announcements.slice(0, 3)}
                            isLoading={isLoadingAnnouncements}
                        />
                    </div>
                </div>

                {/* Right: Your Courses */}
                <div>
                    <div className="flex items-center justify-between px-6 py-4 border-b">
                        <h2 className="text-sm font-medium">Your Courses</h2>
                        <Badge variant="secondary" className="text-xs rounded-none">{courses.length}</Badge>
                    </div>
                    <div className="divide-y divide-border">
                        {courses.slice(0, 4).map((course) => (
                            <div key={course.id} className="flex items-center justify-between px-6 py-3 group hover:bg-muted/40 transition-colors">
                                <div className="flex items-center gap-3">
                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm truncate max-w-40">{course.title}</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity rounded-none" asChild>
                                    <Link href={`/dashboard/courses/${course.id}`}>
                                        <ArrowRight className="h-3 w-3" />
                                    </Link>
                                </Button>
                            </div>
                        ))}
                        {courses.length > 4 && (
                            <div className="px-6 py-3">
                                <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground rounded-none h-7" asChild>
                                    <Link href="/dashboard/courses/my">View all courses</Link>
                                </Button>
                            </div>
                        )}
                    </div>
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
    onCreateAssignment,
}: {
    assignments: any[]
    isLoading: boolean
    onUpdateStatus: (id: string, status: string) => void
    onCreateAssignment: () => void
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
                    onClick: onCreateAssignment,
                }}
            />
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="overflow-hidden border-0 rounded-none shadow-none">
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
        <div className="divide-y divide-border">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                    <Skeleton className="h-8 w-8 rounded-none" />
                    <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-48" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                </div>
            ))}
        </div>
    )
}
