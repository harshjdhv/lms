"use client";

import { useState } from "react";
import {
    CheckCircle2,
    XCircle,
    Clock,
    RefreshCw,
    ExternalLink,
    FileText,
    MessageSquare,
    Loader2,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { Badge } from "@workspace/ui/components/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import { useReviewSubmission, DocumentStatus } from "@/hooks/queries/use-mentorship";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SubmissionReviewPanelProps {
    submissions: any[];
}

type FilterStatus = "all" | "PENDING" | "APPROVED" | "REJECTED" | "REVISION_REQUESTED";

const FILTERS: { id: FilterStatus; label: string }[] = [
    { id: "all", label: "All" },
    { id: "PENDING", label: "Pending" },
    { id: "APPROVED", label: "Approved" },
    { id: "REJECTED", label: "Rejected" },
    { id: "REVISION_REQUESTED", label: "Revision" },
];

export function SubmissionReviewPanel({ submissions }: SubmissionReviewPanelProps) {
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

    const filteredSubmissions =
        filterStatus === "all"
            ? submissions
            : submissions.filter((s) => s.status === filterStatus);

    const openReviewDialog = (submission: any) => {
        setSelectedSubmission(submission);
        setReviewDialogOpen(true);
    };

    const statusCounts: Record<FilterStatus, number> = {
        all: submissions.length,
        PENDING: submissions.filter((s) => s.status === "PENDING").length,
        APPROVED: submissions.filter((s) => s.status === "APPROVED").length,
        REJECTED: submissions.filter((s) => s.status === "REJECTED").length,
        REVISION_REQUESTED: submissions.filter((s) => s.status === "REVISION_REQUESTED").length,
    };

    if (submissions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <FileText className="h-8 w-8 text-muted-foreground/40" />
                <div>
                    <p className="text-sm font-medium">No submissions yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Your mentees haven't submitted any documents yet.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            {/* Hatch divider */}
            <div className="h-4 w-full border-b shrink-0" style={{ backgroundImage: "repeating-linear-gradient(45deg, var(--color-border) 0, var(--color-border) 1px, transparent 0, transparent 50%)", backgroundSize: "6px 6px" }} />
            {/* Filter bar */}
            <div className="flex items-center gap-0 border-b divide-x divide-border">
                {FILTERS.map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setFilterStatus(f.id)}
                        className={cn(
                            "flex items-center gap-2 px-5 py-3 text-sm transition-colors",
                            filterStatus === f.id
                                ? "bg-background font-medium border-b-2 border-b-foreground -mb-px"
                                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                        )}
                    >
                        {f.label}
                        <Badge variant="secondary" className="rounded-none text-[10px] px-1.5 py-0 h-4 min-w-4">
                            {statusCounts[f.id]}
                        </Badge>
                    </button>
                ))}
            </div>

            {/* Rows */}
            {filteredSubmissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                    <FileText className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No {filterStatus.toLowerCase()} submissions</p>
                </div>
            ) : (
                <div className="divide-y divide-border">
                    {filteredSubmissions.map((submission) => (
                        <SubmissionRow
                            key={submission.id}
                            submission={submission}
                            onReview={() => openReviewDialog(submission)}
                        />
                    ))}
                </div>
            )}

            <ReviewDialog
                open={reviewDialogOpen}
                onOpenChange={setReviewDialogOpen}
                submission={selectedSubmission}
            />
        </div>
    );
}

function SubmissionRow({ submission, onReview }: { submission: any; onReview: () => void }) {
    const student = submission.student;
    const requirement = submission.requirement;
    const initials = student?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

    const getStatusConfig = () => {
        switch (submission.status) {
            case "APPROVED":
                return { label: "Approved", icon: CheckCircle2, color: "text-emerald-600", border: "border-l-emerald-500" };
            case "REJECTED":
                return { label: "Rejected", icon: XCircle, color: "text-destructive", border: "border-l-destructive" };
            case "REVISION_REQUESTED":
                return { label: "Revision Needed", icon: RefreshCw, color: "text-amber-600", border: "border-l-amber-500" };
            default:
                return { label: "Pending Review", icon: Clock, color: "text-amber-600", border: "border-l-amber-500" };
        }
    };

    const status = getStatusConfig();
    const StatusIcon = status.icon;

    return (
        <div className={cn("group flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors border-l-2", status.border)}>
            <Avatar className="h-9 w-9 shrink-0 border border-border">
                <AvatarImage src={student?.avatar || undefined} alt={student?.name || "Student"} />
                <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{student?.name || "Unknown"}</p>
                    {requirement?.title && (
                        <Badge variant="outline" className="rounded-none text-[10px] px-1.5 py-0">{requirement.title}</Badge>
                    )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{submission.fileName}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span>{new Date(submission.submittedAt).toLocaleDateString()}</span>
                    {submission.feedback && (
                        <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            Has feedback
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <span className={cn("text-xs items-center gap-1.5 font-medium hidden sm:inline-flex", status.color)}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    {status.label}
                </span>
                <Button variant="outline" size="sm" className="rounded-none h-7 text-xs gap-1.5" asChild>
                    <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                        View
                    </a>
                </Button>
                <Button size="sm" onClick={onReview} className="rounded-none h-7 text-xs">
                    Review
                </Button>
            </div>
        </div>
    );
}

function ReviewDialog({
    open,
    onOpenChange,
    submission,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    submission: any;
}) {
    const [status, setStatus] = useState<DocumentStatus | "">("");
    const [feedback, setFeedback] = useState("");
    const reviewSubmission = useReviewSubmission();

    const handleSubmit = async () => {
        if (!status || !submission) return;
        try {
            await reviewSubmission.mutateAsync({
                id: submission.id,
                status,
                feedback: feedback.trim() || undefined,
            });
            toast.success("Submission reviewed successfully!");
            setStatus("");
            setFeedback("");
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to review submission");
        }
    };

    if (!submission) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg rounded-none">
                <DialogHeader>
                    <DialogTitle>Review Submission</DialogTitle>
                    <DialogDescription>
                        Review <strong>{submission.fileName}</strong> from{" "}
                        <strong>{submission.student?.name}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* File preview */}
                    <div className="flex items-center justify-between px-3 py-3 bg-muted/50 border border-border">
                        <div className="flex items-center gap-3 min-w-0">
                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{submission.fileName}</p>
                                <p className="text-xs text-muted-foreground">
                                    {submission.fileSize
                                        ? `${(submission.fileSize / 1024 / 1024).toFixed(2)} MB`
                                        : "Size unknown"}
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-none shrink-0" asChild>
                            <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                                View
                            </a>
                        </Button>
                    </div>

                    {/* Decision */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Decision</label>
                        <Select value={status} onValueChange={(v) => setStatus(v as DocumentStatus)}>
                            <SelectTrigger className="rounded-none">
                                <SelectValue placeholder="Select your decision" />
                            </SelectTrigger>
                            <SelectContent className="rounded-none">
                                <SelectItem value="APPROVED">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        Approve
                                    </div>
                                </SelectItem>
                                <SelectItem value="REJECTED">
                                    <div className="flex items-center gap-2">
                                        <XCircle className="h-4 w-4 text-destructive" />
                                        Reject
                                    </div>
                                </SelectItem>
                                <SelectItem value="REVISION_REQUESTED">
                                    <div className="flex items-center gap-2">
                                        <RefreshCw className="h-4 w-4 text-amber-500" />
                                        Request Revision
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Feedback */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Feedback <span className="text-muted-foreground font-normal">(optional)</span>
                        </label>
                        <Textarea
                            placeholder="Provide feedback for the student..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={4}
                            className="rounded-none"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" className="rounded-none" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button className="rounded-none" onClick={handleSubmit} disabled={!status || reviewSubmission.isPending}>
                        {reviewSubmission.isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Review"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
