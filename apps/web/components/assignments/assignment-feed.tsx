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

export function AssignmentFeed() {
    const { data: assignments = [], isLoading } = useAssignments()
    const [filter, setFilter] = useState<'ALL' | string>('ALL')

    const filtered = filter === 'ALL'
        ? assignments.filter(a => a.status === 'ACTIVE')
        : assignments.filter(a => a.course.title === filter && a.status === 'ACTIVE')
    const courses = Array.from(new Set(assignments.map(a => a.course.title)))

    if (isLoading) {
        return (
            <div className="flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-background/80 to-transparent backdrop-blur-sm">
                    <Skeleton className="h-6 w-32" />
                    <div className="flex gap-2">
                        <Skeleton className="h-7 w-16 rounded-full" />
                        <Skeleton className="h-7 w-20 rounded-full" />
                    </div>
                </div>
                <div className="flex-1 p-4 space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
                            <Skeleton className="h-5 w-24 rounded-full" />
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-16 w-full rounded-lg" />
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
            className="flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
        >
            {/* Header with course filters */}
            <div className="flex flex-col gap-3 p-4 border-b bg-gradient-to-r from-background/80 to-transparent backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/10 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg">Assignments</h3>
                    <Badge variant="secondary" className="ml-1">
                        {filtered.length}
                    </Badge>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar sm:max-w-[55%]">
                    <Badge
                        variant={filter === 'ALL' ? "default" : "outline"}
                        className={cn(
                            "cursor-pointer whitespace-nowrap transition-all hover:scale-105",
                            filter === 'ALL' && "bg-gradient-to-r from-primary to-primary/80"
                        )}
                        onClick={() => setFilter('ALL')}
                    >
                        All
                    </Badge>
                    {courses.map(c => (
                        <Badge
                            key={c}
                            variant={filter === c ? "default" : "outline"}
                            className={cn(
                                "cursor-pointer whitespace-nowrap transition-all hover:scale-105",
                                filter === c && "bg-gradient-to-r from-primary to-primary/80"
                            )}
                            onClick={() => setFilter(c)}
                        >
                            {c}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Assignment list */}
            <ScrollArea className="h-[430px] flex-1 p-4">
                <div className="flex flex-col gap-4">
                    <AnimatePresence mode="popLayout">
                        {filtered.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl bg-gradient-to-br from-background to-muted/30"
                            >
                                <div className="rounded-full bg-blue-500/10 p-4 mb-4">
                                    <CheckCircle2 className="h-8 w-8 text-blue-500" />
                                </div>
                                <h3 className="font-semibold text-lg mb-1">All Caught Up!</h3>
                                <p className="text-sm text-muted-foreground max-w-xs">
                                    No active assignments right now. Check back later for new work.
                                </p>
                                <Button variant="outline" size="sm" asChild className="mt-4 gap-2">
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
            whileHover={{ y: -2 }}
            className={cn(
                "group relative flex flex-col gap-3 rounded-xl border p-5 text-card-foreground shadow-sm",
                "transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-card to-background",
                isApproved && "border-l-4 border-l-emerald-500",
                isRejected && "border-l-4 border-l-red-500",
                isPending && "border-l-4 border-l-amber-500",
                !isSubmitted && "hover:border-primary/30"
            )}
        >
            {/* Due date badge */}
            {dueStatus && (
                <div className={cn(
                    "absolute top-4 right-4 text-xs flex items-center gap-1 px-2 py-1 rounded-full",
                    dueStatus.bgColor, dueStatus.color
                )}>
                    <Clock className="w-3 h-3" />
                    <span>{dueStatus.label}</span>
                </div>
            )}

            {/* Course + Title */}
            <div className="flex flex-col gap-1 pr-24">
                <Badge variant="outline" className="w-fit mb-1 border-primary/20 text-primary bg-primary/5">
                    {assignment.course.title}
                </Badge>
                <h3 className="font-semibold text-lg leading-tight tracking-tight group-hover:text-primary transition-colors">
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
                    "flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full w-fit",
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
                    className="flex items-center gap-3 p-3 mt-1 bg-muted/40 rounded-lg border border-border/50 hover:bg-muted/60 transition-colors group-hover:border-primary/20"
                >
                    <div className="h-8 w-8 rounded bg-background flex items-center justify-center shadow-sm">
                        <FileIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">Attached Resource</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 mt-auto text-xs text-muted-foreground border-t">
                <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Posted {new Date(assignment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
                {!isSubmitted && !isApproved && (
                    <Button variant="ghost" size="sm" asChild className="h-7 text-xs gap-1 hover:text-primary">
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
