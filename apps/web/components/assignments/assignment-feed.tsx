"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
    FileIcon,
    ExternalLink,
    Clock,
    Calendar,
    FileText,
    AlertCircle,
    CheckCircle2,
    ArrowRight,
} from "lucide-react"
import { useState } from "react"
import { useAssignments, type Assignment } from "@/hooks/queries/use-assignments"
import { cn } from "@/lib/utils"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"

interface AssignmentFeedProps {
    className?: string
}

export function AssignmentFeed({ className }: AssignmentFeedProps) {
    const { data: assignments = [], isLoading } = useAssignments()
    const [filter, setFilter] = useState<'ALL' | string>('ALL')

    const filtered = filter === 'ALL'
        ? assignments.filter(a => a.status === 'ACTIVE')
        : assignments.filter(a => a.course.title === filter && a.status === 'ACTIVE')
    const courses = Array.from(new Set(assignments.map(a => a.course.title)))

    if (isLoading) {
        return (
            <div className={cn("flex flex-col overflow-hidden bg-background", className)}>
                <div className="flex items-center justify-between p-4 border-b">
                    <Skeleton className="h-5 w-32" />
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-16 rounded-none" />
                        <Skeleton className="h-6 w-20 rounded-none" />
                    </div>
                </div>
                <div className="flex-1 p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="border border-border bg-background p-4 space-y-3">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-14 w-full" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={cn("flex flex-col overflow-hidden bg-background", className)}
        >
            {/* Header with course filters */}
            <div className="flex flex-col gap-3 px-5 py-4 border-b sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <h3 className="font-medium text-sm">Assignments</h3>
                    <Badge variant="secondary" className="ml-1 rounded-none">
                        {filtered.length}
                    </Badge>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar sm:max-w-[55%]">
                    <Badge
                        variant={filter === 'ALL' ? "default" : "outline"}
                        className="cursor-pointer whitespace-nowrap rounded-none"
                        onClick={() => setFilter('ALL')}
                    >
                        All
                    </Badge>
                    {courses.map(c => (
                        <Badge
                            key={c}
                            variant={filter === c ? "default" : "outline"}
                            className="cursor-pointer whitespace-nowrap rounded-none"
                            onClick={() => setFilter(c)}
                        >
                            {c}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Assignment list */}
            <ScrollArea className="flex-1 p-4">
                <div className="flex flex-col gap-3">
                    <AnimatePresence mode="popLayout">
                        {filtered.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex h-full min-h-[320px] flex-col items-center justify-center border border-dashed py-16 text-center"
                            >
                                <div className="bg-blue-500/10 p-4 mb-4">
                                    <CheckCircle2 className="h-8 w-8 text-blue-500" />
                                </div>
                                <h3 className="font-semibold text-lg mb-1">All Caught Up!</h3>
                                <p className="text-sm text-muted-foreground max-w-xs">
                                    No active assignments right now. Check back later for new work.
                                </p>
                                <Button variant="outline" size="sm" asChild className="mt-4 gap-2 rounded-none">
                                    <Link href="/dashboard/assignments">
                                        View All Assignments
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </motion.div>
                        ) : (
                            filtered.map((assignment, index) => (
                                <AssignmentCard
                                    key={assignment.id}
                                    assignment={assignment}
                                    index={index}
                                />
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </ScrollArea>
        </motion.div>
    )
}

function AssignmentCard({ assignment, index }: { assignment: Assignment; index: number }) {
    const submission = assignment.submissions?.[0]
    const isSubmitted = !!submission
    const isPending = submission?.status === 'PENDING'
    const isApproved = submission?.status === 'APPROVED'
    const isRejected = submission?.status === 'REJECTED'

    const getDueStatus = () => {
        if (!assignment.dueDate) return null
        const due = new Date(assignment.dueDate)
        const now = new Date()
        const diff = due.getTime() - now.getTime()
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

        if (days < 0) return { label: "Overdue", color: "text-red-500", bgColor: "bg-red-500/10" }
        if (days === 0) return { label: "Due today", color: "text-amber-500", bgColor: "bg-amber-500/10" }
        if (days === 1) return { label: "Due tomorrow", color: "text-amber-500", bgColor: "bg-amber-500/10" }
        if (days <= 3) return { label: `Due in ${days} days`, color: "text-amber-500", bgColor: "bg-amber-500/10" }
        return { label: `Due in ${days} days`, color: "text-muted-foreground", bgColor: "bg-muted/50" }
    }

    const dueStatus = getDueStatus()

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={cn(
                "group relative flex min-h-[220px] flex-col gap-3 border p-5 bg-background transition-colors",
                "hover:bg-muted/30",
                isApproved && "border-l-4 border-l-emerald-500",
                isRejected && "border-l-4 border-l-red-500",
                isPending && "border-l-4 border-l-amber-500",
            )}
        >
            {/* Due date badge */}
            {dueStatus && (
                <div className={cn(
                    "absolute top-4 right-4 text-xs flex items-center gap-1 px-2 py-1",
                    dueStatus.bgColor, dueStatus.color
                )}>
                    <Clock className="w-3 h-3" />
                    <span>{dueStatus.label}</span>
                </div>
            )}

            {/* Course + Title */}
            <div className="flex flex-col gap-1 pr-24">
                <Badge variant="outline" className="w-fit mb-1 rounded-none">
                    {assignment.course.title}
                </Badge>
                <h3 className="font-semibold text-lg leading-tight tracking-tight">
                    {assignment.title}
                </h3>
            </div>

            {/* Content preview */}
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap line-clamp-2">
                {assignment.content}
            </p>

            {/* Submission status */}
            {isSubmitted && (
                <div className={cn(
                    "flex items-center gap-2 text-xs font-medium px-3 py-1.5 w-fit",
                    isApproved && "bg-emerald-500/10 text-emerald-600",
                    isRejected && "bg-red-500/10 text-red-600",
                    isPending && "bg-amber-500/10 text-amber-600"
                )}>
                    {isApproved && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {isRejected && <AlertCircle className="h-3.5 w-3.5" />}
                    {isPending && <Clock className="h-3.5 w-3.5" />}
                    {isApproved && "Approved"}
                    {isRejected && "Needs Revision"}
                    {isPending && "Pending Review"}
                </div>
            )}

            {/* Attachment */}
            {assignment.attachmentUrl && (
                <a
                    href={assignment.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 mt-1 bg-muted/40 border hover:bg-muted/60 transition-colors"
                >
                    <div className="h-8 w-8 bg-background border flex items-center justify-center">
                        <FileIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">Attached Resource</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
            )}

            {/* Footer */}
            <div className="mt-auto flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Posted {new Date(assignment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
                {!isSubmitted && !isApproved && (
                    <Button variant="ghost" size="sm" asChild className="h-7 text-xs gap-1 rounded-none">
                        <Link href="/dashboard/assignments">
                            Submit
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                    </Button>
                )}
            </div>
        </motion.div>
    )
}
