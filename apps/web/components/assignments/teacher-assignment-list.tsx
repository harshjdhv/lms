"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
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
import { MoreHorizontal, FileText, PauseCircle, PlayCircle, Eye } from "lucide-react"
import { toast } from "sonner"

import { ReviewSubmissionsDialog } from "@/components/assignments/review-submissions-dialog"

interface Assignment {
    id: string
    title: string
    content: string
    status: 'ACTIVE' | 'REVIEW' | 'STOPPED'
    createdAt: string
    course: {
        title: string
    }
    _count?: {
        submissions: number
    }
}

export function TeacherAssignmentList({ refreshTrigger }: { refreshTrigger: number }) {
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [loading, setLoading] = useState(true)

    const fetchAssignments = async () => {
        try {
            const res = await fetch("/api/assignments")
            if (res.ok) {
                const data = await res.json()
                setAssignments(data)
            }
        } catch (error) {
            console.error("Failed to fetch assignments", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAssignments()
    }, [refreshTrigger])

    const updateStatus = async (id: string, status: string) => {
        try {
            const res = await fetch("/api/assignments/update", {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            })
            if (res.ok) {
                toast.success(`Assignment marked as ${status.toLowerCase()}`)
                fetchAssignments()
            }
        } catch {
            toast.error("Failed to update status")
        }
    }

    return (
        <Card className="shadow-none border-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <CardTitle>Active Assignments & Reviews</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableHead className="w-[300px]">Assignment</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Submissions</TableHead>
                                <TableHead>Posted</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        Loading assignments...
                                    </TableCell>
                                </TableRow>
                            ) : assignments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No assignments found. create one below.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                assignments.map((assignment) => (
                                    <TableRow key={assignment.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                    <FileText className="h-4 w-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span>{assignment.title}</span>
                                                    <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{assignment.content}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-normal">{assignment.course.title}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={assignment.status === 'ACTIVE' ? 'default' : assignment.status === 'STOPPED' ? 'destructive' : 'secondary'}>
                                                {assignment.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{assignment._count?.submissions || 0}</span>
                                                <span className="text-muted-foreground text-xs">submitted</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {new Date(assignment.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <ReviewSubmissionsDialog
                                                        assignmentId={assignment.id}
                                                        assignmentTitle={assignment.title}
                                                        trigger={
                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                                <Eye className="mr-2 h-4 w-4" /> Review Submissions
                                                            </DropdownMenuItem>
                                                        }
                                                    />
                                                    {assignment.status === 'ACTIVE' ? (
                                                        <DropdownMenuItem onClick={() => updateStatus(assignment.id, 'STOPPED')}>
                                                            <PauseCircle className="mr-2 h-4 w-4" /> Stop / Close
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem onClick={() => updateStatus(assignment.id, 'ACTIVE')}>
                                                            <PlayCircle className="mr-2 h-4 w-4" /> Activate
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
