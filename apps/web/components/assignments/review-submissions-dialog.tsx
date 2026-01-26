"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@workspace/ui/components/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import {
    CheckCircle2,
    XCircle,
    ExternalLink,
    Loader2,
    Eye,
    MessageSquare
} from "lucide-react"
import { toast } from "sonner"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@workspace/ui/components/popover"

interface Submission {
    id: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    attachmentUrl: string
    feedback?: string
    createdAt: string
    student: {
        id: string
        name: string | null
        email: string
        avatar: string | null
    }
}

export function ReviewSubmissionsDialog({
    assignmentId,
    assignmentTitle,
    trigger
}: {
    assignmentId: string
    assignmentTitle: string
    trigger?: React.ReactNode
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [submissions, setSubmissions] = useState<Submission[]>([])
    const [loading, setLoading] = useState(true)

    const fetchSubmissions = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/assignments/${assignmentId}/submissions`)
            if (res.ok) {
                const data = await res.json()
                setSubmissions(data)
            }
        } catch (error) {
            console.error("Failed to fetch submissions", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchSubmissions()
        }
    }, [isOpen, assignmentId])

    const handleJudge = async (submissionId: string, status: 'APPROVED' | 'REJECTED' | 'PENDING', feedback?: string) => {
        try {
            const res = await fetch(`/api/assignments/submissions/${submissionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, feedback })
            })

            if (res.ok) {
                toast.success(`Submission status updated`)
                // Optimistic update or refresh
                setSubmissions(prev => prev.map(s =>
                    s.id === submissionId ? { ...s, status: status as any, feedback } : s
                ))
            } else {
                toast.error("Failed to update status")
            }
        } catch {
            toast.error("Error updating submission")
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline" size="sm">Review Submissions</Button>}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Review Submissions</DialogTitle>
                    <DialogDescription>
                        Submissions for <strong>{assignmentTitle}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-auto py-4">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                            No submissions yet.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Attachment</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {submissions.map((submission) => (
                                    <TableRow key={submission.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{submission.student.name || 'Unknown'}</span>
                                                <span className="text-xs text-muted-foreground">{submission.student.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(submission.createdAt).toLocaleDateString()} {new Date(submission.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                submission.status === 'APPROVED' ? 'default' :
                                                    submission.status === 'REJECTED' ? 'destructive' :
                                                        'secondary'
                                            } className={submission.status === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}>
                                                {submission.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm" asChild className="h-8 gap-2">
                                                <a href={submission.attachmentUrl} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                    View
                                                </a>
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {submission.status === 'PENDING' ? (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                                                        onClick={() => handleJudge(submission.id, 'APPROVED')}
                                                    >
                                                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Approve
                                                    </Button>

                                                    <RejectPopover onReject={(feedback) => handleJudge(submission.id, 'REJECTED', feedback)} />
                                                </div>
                                            ) : (
                                                <div className="flex justify-end items-center gap-2 text-sm text-muted-foreground">
                                                    <span className="text-xs italic">Graded</span>
                                                    {submission.feedback && (
                                                        <Popover>
                                                            <PopoverTrigger>
                                                                <MessageSquare className="h-4 w-4 text-orange-500 cursor-pointer" />
                                                            </PopoverTrigger>
                                                            <PopoverContent>
                                                                <p className="text-sm font-medium mb-1">Feedback given:</p>
                                                                <p className="text-sm text-muted-foreground">&quot;{submission.feedback}&quot;</p>
                                                            </PopoverContent>
                                                        </Popover>
                                                    )}
                                                    {/* Allow changing decision? */}
                                                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleJudge(submission.id, 'PENDING')}>
                                                        Reset
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

function RejectPopover({ onReject }: { onReject: (feedback: string) => void }) {
    const [feedback, setFeedback] = useState("")
    const [open, setOpen] = useState(false)

    const handleSubmit = () => {
        onReject(feedback)
        setOpen(false)
        setFeedback("")
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button size="sm" variant="destructive" className="h-8">
                    <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Rejection Feedback</h4>
                        <p className="text-sm text-muted-foreground">
                            Tell the student what needs to be improved.
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="feedback">Feedback</Label>
                        <Textarea
                            id="feedback"
                            placeholder="e.g. Missing citation, incomplete analysis..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="h-20"
                        />
                    </div>
                    <Button onClick={handleSubmit} disabled={!feedback}>Send Feedback</Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
