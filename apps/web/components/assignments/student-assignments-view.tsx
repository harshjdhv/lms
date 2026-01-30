"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    FileText,
    Clock,
    CheckCircle2,
    AlertCircle,
    FileIcon,
    Search,
    Filter,
    BookOpen,
    Download,
    UploadCloud,
    RotateCcw,
    RefreshCw
} from "lucide-react"

import { Skeleton } from "@workspace/ui/components/skeleton"
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter
} from "@workspace/ui/components/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@workspace/ui/components/dialog"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@workspace/ui/components/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import { Separator } from "@workspace/ui/components/separator"
import { toast } from "sonner"
import { FileUpload } from "./file-upload"
import { useAssignments, useSubmitAssignment, type Assignment } from "@/hooks/queries/use-assignments"

export function StudentAssignmentsView() {
    const { data: assignments = [], isLoading, refetch, isFetching } = useAssignments()
    const [searchQuery, setSearchQuery] = useState("")
    const [filterCourse, setFilterCourse] = useState("all")

    const courses = Array.from(new Set(assignments.map(a => a.course.title)))

    const filteredAssignments = assignments.filter(assignment => {
        const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assignment.course.title.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCourse = filterCourse === "all" || assignment.course.title === filterCourse
        return matchesSearch && matchesCourse
    })

    const todoAssignments = filteredAssignments.filter(a => {
        const sub = a.submissions?.[0]
        const isDone = sub?.status === 'APPROVED'
        return a.status !== 'STOPPED' && !isDone
    })

    const doneAssignments = filteredAssignments.filter(a => {
        const sub = a.submissions?.[0]
        const isDone = sub?.status === 'APPROVED'
        return a.status === 'STOPPED' || isDone
    })

    return (
        <div className="flex flex-col gap-8 p-6 animate-in fade-in-50 duration-500">
            {/* Enhanced Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-6 border-b"
            >
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text">
                        My Assignments
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Track your progress, submit work, and review feedback.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        title="Refresh Assignments"
                        className="transition-transform hover:scale-105"
                    >
                        <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                    </Button>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search..."
                            className="pl-9 bg-background"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Stats Overview - Clean Styling */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatsCard
                    label="To Do"
                    value={todoAssignments.length}
                    icon={Clock}
                    color="blue"
                />
                <StatsCard
                    label="Completed"
                    value={doneAssignments.filter(a => a.submissions?.[0]?.status === 'APPROVED').length}
                    icon={CheckCircle2}
                    color="emerald"
                />
                <StatsCard
                    label="Active Courses"
                    value={courses.length}
                    icon={BookOpen}
                    color="indigo"
                />
            </div>

            <Tabs defaultValue="todo" className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <TabsList className="grid w-full sm:w-[400px] grid-cols-2">
                        <TabsTrigger value="todo">To Do</TabsTrigger>
                        <TabsTrigger value="done">Past & Completed</TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">Filter:</span>
                        <Select value={filterCourse} onValueChange={setFilterCourse}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="All Courses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Courses</SelectItem>
                                {courses.map(course => (
                                    <SelectItem key={course} value={course}>{course}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <TabsContent value="todo" className="space-y-4">
                    {isLoading ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <AssignmentCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : todoAssignments.length === 0 ? (
                        <EmptyState title="All caught up!" description="No pending assignments." />
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <AnimatePresence>
                                {todoAssignments.map((assignment, index) => (
                                    <AssignmentCard key={assignment.id} assignment={assignment} index={index} />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="done" className="space-y-4">
                    {isLoading ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3].map((i) => (
                                <AssignmentCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : doneAssignments.length === 0 ? (
                        <EmptyState title="No history" description="Completed assignments will show here." />
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <AnimatePresence>
                                {doneAssignments.map((assignment, index) => (
                                    <AssignmentCard key={assignment.id} assignment={assignment} index={index} isHistory />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div >
    )
}

function StatsCard({ label, value, icon: Icon, color }: { label: string, value: number, icon: React.ElementType, color: string }) {
    const colors: Record<string, string> = {
        blue: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50",
        emerald: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50",
        indigo: "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/50",
    }
    const iconColors: Record<string, string> = {
        blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/40",
        emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40",
        indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40",
    }

    return (
        <Card className={`border shadow-sm ${colors[color]}`}>
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium opacity-80">{label}</p>
                    <h2 className="text-3xl font-bold">{value}</h2>
                </div>
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${iconColors[color]}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </CardContent>
        </Card>
    )
}

function AssignmentCard({ assignment, index, isHistory = false }: { assignment: Assignment, index: number, isHistory?: boolean }) {
    const submission = assignment.submissions?.[0]
    const status = submission?.status || 'PENDING_SUBMISSION'
    const isLate = assignment.dueDate ? new Date(assignment.dueDate) < new Date() && status === 'PENDING_SUBMISSION' : false

    // Explicitly check for Rejected state to style differently
    const isRejected = status === 'REJECTED'

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
        >
            <Card className={`h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-md border bg-card text-card-foreground ${isRejected ? 'border-red-500/50 shadow-red-100 dark:shadow-red-900/10' : 'border-muted'}`}>
                <CardHeader className="pb-3 space-y-3">
                    <div className="flex justify-between items-start">
                        <Badge variant="outline" className="font-normal text-muted-foreground">
                            {assignment.course.title}
                        </Badge>
                        <StatusBadge status={status} assignmentStatus={assignment.status} isLate={isLate} />
                    </div>
                    <div>
                        <CardTitle className="line-clamp-1 text-lg leading-tight">
                            {assignment.title}
                        </CardTitle>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            {assignment.dueDate && (
                                <div className={`flex items-center gap-1 ${isLate || (status === 'PENDING_SUBMISSION' && !isHistory) ? 'text-orange-600 font-medium' : ''}`}>
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>Due {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 pb-3 space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {assignment.content}
                    </p>

                    {submission?.feedback && (
                        <div className={`
                            p-3 rounded-lg text-sm border
                            ${isRejected
                                ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/50'
                                : 'bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/50'
                            }
                        `}>
                            <p className={`
                                font-medium flex items-center gap-2 mb-1
                                ${isRejected ? 'text-red-800 dark:text-red-300' : 'text-orange-800 dark:text-orange-300'}
                            `}>
                                <AlertCircle className="w-4 h-4" />
                                {isRejected ? 'Correction Required' : 'Teacher Feedback'}
                            </p>
                            <div className={`text-xs p-2 bg-white/50 dark:bg-black/10 rounded ${isRejected ? 'text-red-800 dark:text-red-200' : 'text-orange-900 dark:text-orange-200'}`}>
                                &quot;{submission.feedback}&quot;
                            </div>
                        </div>
                    )}

                    {assignment.attachmentUrl && (
                        <div className="p-3 bg-muted/30 rounded-lg border border-border/50 flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-background flex items-center justify-center shrink-0 shadow-sm text-primary">
                                <FileIcon className="h-4 w-4" />
                            </div>
                            <div className="overflow-hidden flex-1">
                                <p className="text-xs font-medium truncate">Reference Material</p>
                            </div>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" asChild>
                                <a href={assignment.attachmentUrl} target="_blank" rel="noopener noreferrer">
                                    <Download className="h-4 w-4" />
                                </a>
                            </Button>
                        </div>
                    )}
                </CardContent>
                <Separator />
                <CardFooter className="p-3 bg-muted/5 flex items-center justify-between gap-2">
                    {submission?.attachmentUrl ? (
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground" asChild>
                            <a href={submission.attachmentUrl} target="_blank" rel="noopener noreferrer">View your submission</a>
                        </Button>
                    ) : (
                        <span className="text-xs text-muted-foreground italic">Not submitted</span>
                    )}

                    {!isHistory && (
                        <SubmissionDialog assignment={assignment} submission={submission} />
                    )}
                    {isHistory && submission?.status === 'APPROVED' && (
                        <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium px-3 py-1.5 bg-emerald-50 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Done
                        </div>
                    )}
                </CardFooter>
            </Card>
        </motion.div>
    )
}

function StatusBadge({ status, assignmentStatus, isLate }: { status: string, assignmentStatus: string, isLate?: boolean }) {
    if (status === 'APPROVED') {
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Completed</Badge>
    }
    if (status === 'REJECTED') {
        return <Badge variant="destructive">Needs Revision</Badge>
    }
    if (status === 'PENDING') {
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">In Review</Badge>
    }
    if (assignmentStatus === 'STOPPED') {
        return <Badge variant="outline" className="text-muted-foreground">Closed</Badge>
    }
    if (isLate) {
        return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">Overdue</Badge>
    }
    return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">To Do</Badge>
}


function SubmissionDialog({ assignment, submission }: { assignment: Assignment, submission?: Assignment['submissions'] extends (infer U)[] | undefined ? U : never }) {
    const [fileUrl, setFileUrl] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const submitMutation = useSubmitAssignment()

    const handleSubmit = async () => {
        if (!fileUrl) return toast.error("Please upload a file")

        try {
            await submitMutation.mutateAsync({ assignmentId: assignment.id, attachmentUrl: fileUrl })
            toast.success("Assignment submitted successfully!")
            setIsOpen(false)
            setFileUrl("")
        } catch {
            toast.error("Failed to submit assignment")
        }
    }

    const isResubmit = !!submission

    // Disable if stopped and no submission (late and closed)
    // But allow resubmit if REJECTED even if stopped? Logic depends. Assuming allow for now if user can see it in todo.
    if (assignment.status === 'STOPPED' && (!submission || submission.status === 'APPROVED')) {
        return null // Don't show button
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant={isResubmit ? "outline" : "default"} className={isResubmit ? "" : "bg-blue-600 hover:bg-blue-700"}>
                    {isResubmit ? (
                        <>
                            <RotateCcw className="mr-2 h-3.5 w-3.5" />
                            Resubmit
                        </>
                    ) : (
                        <>
                            <UploadCloud className="mr-2 h-3.5 w-3.5" />
                            Submit
                        </>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isResubmit ? "Resubmit Assignment" : "Submit Assignment"}</DialogTitle>
                    <DialogDescription>
                        {assignment.title} • {assignment.course.title}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <span className="text-sm font-medium">Upload your work</span>
                        <FileUpload onUploadComplete={setFileUrl} />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!fileUrl || submitMutation.isPending}>
                        {submitMutation.isPending ? "Submitting..." : "Confirm Submission"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function AssignmentCardSkeleton() {
    return (
        <Card className="h-full flex flex-col overflow-hidden border bg-card">
            <CardHeader className="pb-3 space-y-3">
                <div className="flex justify-between items-start">
                    <Skeleton className="h-5 w-24 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </CardHeader>
            <CardContent className="flex-1 pb-3 space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
            </CardContent>
            <Separator />
            <CardFooter className="p-3 bg-muted/5 flex items-center justify-between gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20 rounded-md" />
            </CardFooter>
        </Card>
    )
}

function EmptyState({ title, description }: { title: string, description: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-muted/10 border-2 border-dashed rounded-xl border-muted-foreground/20">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-muted-foreground mt-1 max-w-sm">{description}</p>
        </div>
    )
}
