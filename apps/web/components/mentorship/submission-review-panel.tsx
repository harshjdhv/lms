/**
 * @file components/mentorship/submission-review-panel.tsx
 * @description Panel for teachers to review document submissions
 * @module Apps/Web/Components/Mentorship
 */

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
    Filter,
    Loader2,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { Badge } from "@workspace/ui/components/badge";
import {
    Card,
    CardContent,
} from "@workspace/ui/components/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
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

    const statusCounts = {
        pending: submissions.filter((s) => s.status === "PENDING").length,
        approved: submissions.filter((s) => s.status === "APPROVED").length,
        rejected: submissions.filter((s) => s.status === "REJECTED").length,
        revision: submissions.filter((s) => s.status === "REVISION_REQUESTED").length,
    };

    if (submissions.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Submissions Yet</h3>
                    <p className="text-muted-foreground max-w-sm">
                        Your mentees haven't submitted any documents yet. They'll appear here once they start submitting.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
                <FilterButton
                    label="All"
                    count={submissions.length}
                    isActive={filterStatus === "all"}
                    onClick={() => setFilterStatus("all")}
                />
                <FilterButton
                    label="Pending"
                    count={statusCounts.pending}
                    isActive={filterStatus === "PENDING"}
                    onClick={() => setFilterStatus("PENDING")}
                    color="amber"
                />
                <FilterButton
                    label="Approved"
                    count={statusCounts.approved}
                    isActive={filterStatus === "APPROVED"}
                    onClick={() => setFilterStatus("APPROVED")}
                    color="emerald"
                />
                <FilterButton
                    label="Rejected"
                    count={statusCounts.rejected}
                    isActive={filterStatus === "REJECTED"}
                    onClick={() => setFilterStatus("REJECTED")}
                    color="red"
                />
                <FilterButton
                    label="Revision"
                    count={statusCounts.revision}
                    isActive={filterStatus === "REVISION_REQUESTED"}
                    onClick={() => setFilterStatus("REVISION_REQUESTED")}
                    color="blue"
                />
            </div>

            {/* Submissions List */}
            <div className="space-y-3">
                {filteredSubmissions.map((submission) => (
                    <SubmissionCard
                        key={submission.id}
                        submission={submission}
                        onReview={() => openReviewDialog(submission)}
                    />
                ))}
            </div>

            {/* Review Dialog */}
            <ReviewDialog
                open={reviewDialogOpen}
                onOpenChange={setReviewDialogOpen}
                submission={selectedSubmission}
            />
        </div>
    );
}

function FilterButton({
    label,
    count,
    isActive,
    onClick,
    color = "gray",
}: {
    label: string;
    count: number;
    isActive: boolean;
    onClick: () => void;
    color?: "gray" | "amber" | "emerald" | "red" | "blue";
}) {
    const colorClasses = {
        gray: "bg-muted",
        amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    };

    return (
        <Button
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={onClick}
            className="gap-2"
        >
            {label}
            <Badge
                variant="secondary"
                className={cn(
                    "min-w-5 h-5 px-1.5 text-xs",
                    isActive ? "bg-primary-foreground/20 text-primary-foreground" : colorClasses[color]
                )}
            >
                {count}
            </Badge>
        </Button>
    );
}

function SubmissionCard({
    submission,
    onReview,
}: {
    submission: any;
    onReview: () => void;
}) {
    const student = submission.student;
    const requirement = submission.requirement;
    const initials = student?.name
        ?.split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase() || "?";

    const getStatusConfig = () => {
        switch (submission.status) {
            case "APPROVED":
                return {
                    label: "Approved",
                    icon: CheckCircle2,
                    color: "text-emerald-500",
                    bg: "bg-emerald-50 dark:bg-emerald-950/30",
                };
            case "REJECTED":
                return {
                    label: "Rejected",
                    icon: XCircle,
                    color: "text-red-500",
                    bg: "bg-red-50 dark:bg-red-950/30",
                };
            case "REVISION_REQUESTED":
                return {
                    label: "Revision Needed",
                    icon: RefreshCw,
                    color: "text-blue-500",
                    bg: "bg-blue-50 dark:bg-blue-950/30",
                };
            default:
                return {
                    label: "Pending Review",
                    icon: Clock,
                    color: "text-amber-500",
                    bg: "bg-amber-50 dark:bg-amber-950/30",
                };
        }
    };

    const status = getStatusConfig();
    const StatusIcon = status.icon;

    return (
        <Card className={cn("transition-all hover:shadow-md", status.bg)}>
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    {/* Student Info */}
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={student?.avatar || undefined} alt={student?.name || "Student"} />
                        <AvatarFallback className="bg-primary/10">{initials}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold">{student?.name || "Unknown"}</h4>
                            <Badge variant="outline" className="text-xs">
                                {requirement?.title}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                            {submission.fileName}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>
                                Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                            </span>
                            {submission.feedback && (
                                <span className="flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3" />
                                    Has feedback
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3">
                        <div className={cn("flex items-center gap-1.5 text-sm font-medium", status.color)}>
                            <StatusIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">{status.label}</span>
                        </div>

                        <Button variant="outline" size="sm" asChild>
                            <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </Button>

                        <Button size="sm" onClick={onReview}>
                            Review
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
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
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Review Submission</DialogTitle>
                    <DialogDescription>
                        Review <strong>{submission.fileName}</strong> from{" "}
                        <strong>{submission.student?.name}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Preview Link */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                                <p className="font-medium text-sm">{submission.fileName}</p>
                                <p className="text-xs text-muted-foreground">
                                    {submission.fileSize
                                        ? `${(submission.fileSize / 1024 / 1024).toFixed(2)} MB`
                                        : "Size unknown"}
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View
                            </a>
                        </Button>
                    </div>

                    {/* Status Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Decision</label>
                        <Select value={status} onValueChange={(v) => setStatus(v as DocumentStatus)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select your decision" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="APPROVED">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        Approve
                                    </div>
                                </SelectItem>
                                <SelectItem value="REJECTED">
                                    <div className="flex items-center gap-2">
                                        <XCircle className="h-4 w-4 text-red-500" />
                                        Reject
                                    </div>
                                </SelectItem>
                                <SelectItem value="REVISION_REQUESTED">
                                    <div className="flex items-center gap-2">
                                        <RefreshCw className="h-4 w-4 text-blue-500" />
                                        Request Revision
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Feedback */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Feedback{" "}
                            <span className="text-muted-foreground font-normal">(optional)</span>
                        </label>
                        <Textarea
                            placeholder="Provide feedback for the student..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={4}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!status || reviewSubmission.isPending}>
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
