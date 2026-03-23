"use client";

import { useState } from "react";
import {
    User,
    FileText,
    Clock,
    CheckCircle2,
    Upload,
    AlertCircle,
    Calendar,
    ExternalLink,
    RefreshCw,
    Mail,
    Award,
    XCircle,
    FileUp,
    FolderOpen,
    ChevronRight,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Progress } from "@workspace/ui/components/progress";
import { useMentorshipData } from "@/hooks/queries/use-mentorship";
import { DocumentUploadDialog } from "./document-upload-dialog";
import { StatsCard, StatsCardSkeleton, gradientPresets } from "@/components/ui/stats-card";
import { cn } from "@/lib/utils";

interface StudentMentorshipViewProps {
    userName: string;
}

export function StudentMentorshipView({ userName }: StudentMentorshipViewProps) {
    const { data, isLoading, error } = useMentorshipData();
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [selectedRequirement, setSelectedRequirement] = useState<string | null>(null);
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

    if (isLoading) {
        return (
            <div className="flex w-full min-w-0 flex-col">
                <div className="flex flex-col justify-between gap-4 border-b bg-background px-6 py-5 lg:flex-row lg:items-center">
                    <div className="space-y-2">
                        <div className="h-7 w-56 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-80 bg-muted/50 rounded animate-pulse" />
                    </div>
                </div>
                {/* Mentor + Stats skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 border-b">
                    <div className="border-r border-border px-6 py-6 space-y-4">
                        <div className="h-16 w-16 rounded-full bg-muted animate-pulse mx-auto" />
                        <div className="h-5 w-32 bg-muted rounded animate-pulse mx-auto" />
                        <div className="h-4 w-48 bg-muted/50 rounded animate-pulse mx-auto" />
                    </div>
                    <div className="col-span-2 grid grid-cols-2 divide-x divide-y divide-border">
                        {[...Array(4)].map((_, i) => <StatsCardSkeleton key={i} />)}
                    </div>
                </div>
                <div className="space-y-px">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted/40 animate-pulse border-b border-border" />)}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <p className="text-sm text-muted-foreground">Failed to load mentorship data</p>
                <Button variant="outline" size="sm" className="rounded-none" onClick={() => window.location.reload()}>
                    Try Again
                </Button>
            </div>
        );
    }

    const mentor = data?.mentor;
    const requirements = data?.requirements || [];
    const submissions = data?.submissions || [];
    const stats = data?.stats || { pendingDocuments: 0, completedDocuments: 0 };
    const folders = data?.folders || [];

    const getSubmissionForRequirement = (reqId: string) => submissions.find(s => s.requirementId === reqId);
    const approvedCount = submissions.filter(s => s.status === "APPROVED").length;
    const progressPercent = requirements.length > 0 ? Math.round((approvedCount / requirements.length) * 100) : 0;

    const selectedReq = requirements.find(r => r.id === selectedRequirement) || null;

    const handleUpload = (reqId: string) => {
        setSelectedRequirement(reqId);
        setUploadDialogOpen(true);
    };

    if (!mentor) {
        return (
            <div className="flex w-full min-w-0 flex-col">
                <div className="flex flex-col justify-between gap-4 border-b bg-background px-6 py-5">
                    <div className="min-w-0 space-y-1">
                        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                            Welcome, {userName.split(" ")[0]}
                        </h1>
                        <p className="text-sm text-muted-foreground">Your mentorship dashboard</p>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-6">
                    <User className="h-10 w-10 text-muted-foreground/40" />
                    <div>
                        <p className="text-sm font-medium">No mentor assigned yet</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                            Once a teacher adds you as their mentee, you&apos;ll be able to see their document requirements here.
                        </p>
                    </div>
                    <Badge variant="secondary" className="rounded-none gap-1.5 py-1.5 px-3">
                        <Clock className="h-3.5 w-3.5" />
                        Waiting for assignment
                    </Badge>
                </div>
            </div>
        );
    }

    const mentorInitials = mentor.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "M";

    // Folder-based document filtering
    const unfolderedRequirements = requirements.filter(r => !r.folderId);
    const currentFolderRequirements = selectedFolderId
        ? requirements.filter(r => r.folderId === selectedFolderId)
        : unfolderedRequirements;
    const currentFolder = selectedFolderId
        ? folders.find(f => f.id === selectedFolderId)
        : null;

    const hasFolders = folders.length > 0;
    const allDocs = hasFolders ? currentFolderRequirements : requirements;

    return (
        <div className="flex w-full min-w-0 flex-col">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 border-b bg-background px-6 py-5 lg:flex-row lg:items-center">
                <div className="min-w-0 space-y-1">
                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">My Mentor &amp; Documents</h1>
                    <p className="text-sm text-muted-foreground">View your mentor&apos;s requirements and submit your documents.</p>
                </div>
            </div>

            {/* ─── Mentor Column (left) + 2×2 Stats Grid (right) ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 border-b">
                {/* Left — Mentor card */}
                <div className="border-r border-border flex flex-col">
                    <div className="flex items-center gap-4 px-6 py-5">
                        <Avatar className="h-14 w-14 border-2 border-border shrink-0">
                            <AvatarImage src={mentor.avatar || undefined} alt={mentor.name || "Mentor"} />
                            <AvatarFallback className="text-base font-semibold">{mentorInitials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold truncate">{mentor.name}</p>
                            {mentor.title && <p className="text-xs text-muted-foreground mt-0.5 truncate">{mentor.title}</p>}
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{mentor.email}</p>
                        </div>
                    </div>

                    <div className="border-t border-border px-6 py-3 flex items-center gap-4">
                        {mentor.expertise && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <Award className="h-3 w-3 text-primary" />
                                {mentor.expertise}
                            </span>
                        )}
                    </div>

                    {/* Progress bar */}
                    <div className="border-t border-border px-6 py-4 space-y-2 mt-auto">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Overall Progress</span>
                            <span className="font-medium tabular-nums">{approvedCount}/{requirements.length}</span>
                        </div>
                        <Progress value={progressPercent} className="h-1.5" />
                        <div className="flex items-center gap-2 pt-1">
                            <Button variant="outline" className="flex-1 rounded-none gap-2 text-xs h-8" size="sm">
                                <Mail className="h-3.5 w-3.5" />
                                Contact Mentor
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right — 2×2 Stats Grid */}
                <div className="col-span-2 grid grid-cols-2">
                    <div className="border-b border-r border-border">
                        <StatsCard title="Total Required" value={requirements.length} icon={FileText} description="Document requirements" index={0} {...gradientPresets.blue} />
                    </div>
                    <div className="border-b border-border">
                        <StatsCard title="Submitted" value={submissions.length} icon={Upload} description="Documents uploaded" index={1} {...gradientPresets.purple} />
                    </div>
                    <div className="border-r border-border">
                        <StatsCard title="Pending Review" value={stats.pendingDocuments} icon={Clock} description="Awaiting feedback" trend={stats.pendingDocuments > 0 ? "warning" : "neutral"} index={2} {...gradientPresets.amber} />
                    </div>
                    <div>
                        <StatsCard title="Approved" value={approvedCount} icon={CheckCircle2} description="Successfully approved" trend="success" index={3} {...gradientPresets.emerald} />
                    </div>
                </div>
            </div>

            {/* ─── Documents Section ─── */}
            <div className="flex min-h-0 flex-1">
                {/* Folder sidebar (only show if folders exist) */}
                {hasFolders && (
                    <div className="w-48 shrink-0 border-r border-border">
                        <div className="px-3 py-2">
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest px-2 py-1.5">Folders</p>
                        </div>
                        <div className="px-2 pb-2 space-y-0.5">
                            <button
                                onClick={() => setSelectedFolderId(null)}
                                className={cn(
                                    "flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors text-left rounded-sm",
                                    selectedFolderId === null
                                        ? "bg-muted font-medium text-foreground"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                )}
                            >
                                <FolderOpen className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate flex-1">Uncategorized</span>
                                <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                                    {unfolderedRequirements.length}
                                </span>
                            </button>

                            {folders.map(folder => {
                                const folderReqs = requirements.filter(r => r.folderId === folder.id);
                                const folderSubmitted = folderReqs.filter(r => getSubmissionForRequirement(r.id)).length;
                                return (
                                    <button
                                        key={folder.id}
                                        onClick={() => setSelectedFolderId(folder.id)}
                                        className={cn(
                                            "flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors text-left rounded-sm",
                                            selectedFolderId === folder.id
                                                ? "bg-muted font-medium text-foreground"
                                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                        )}
                                    >
                                        <div
                                            className="h-2.5 w-2.5 rounded-full shrink-0"
                                            style={{ backgroundColor: folder.color || "#64748B" }}
                                        />
                                        <span className="truncate flex-1">{folder.name}</span>
                                        <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                                            {folderSubmitted}/{folderReqs.length}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Document list */}
                <div className="flex-1 min-w-0">
                    {/* Breadcrumb header */}
                    {hasFolders && (
                        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-border bg-muted/20 text-sm">
                            <FolderOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground">Documents</span>
                            <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                            {currentFolder ? (
                                <span className="font-medium flex items-center gap-1.5 truncate">
                                    <span
                                        className="h-2 w-2 rounded-full shrink-0 inline-block"
                                        style={{ backgroundColor: currentFolder.color || "#64748B" }}
                                    />
                                    {currentFolder.name}
                                </span>
                            ) : (
                                <span className="font-medium truncate">Uncategorized</span>
                            )}
                        </div>
                    )}

                    {!hasFolders && (
                        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-border bg-muted/20 text-sm">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="font-medium">All Documents</span>
                            <Badge variant="secondary" className="rounded-none text-[10px] px-1.5 py-0 ml-1 h-4">
                                {requirements.length}
                            </Badge>
                        </div>
                    )}

                    {allDocs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                            <FileText className="h-8 w-8 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">
                                {currentFolder ? `No documents in &ldquo;${currentFolder.name}&rdquo;` : "No documents yet"}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {allDocs.map(req => (
                                <DocumentRow
                                    key={req.id}
                                    requirement={req}
                                    submission={getSubmissionForRequirement(req.id)}
                                    onUpload={() => handleUpload(req.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <DocumentUploadDialog
                open={uploadDialogOpen}
                onOpenChange={setUploadDialogOpen}
                requirement={selectedReq}
            />
        </div>
    );
}

function DocumentRow({ requirement, submission, onUpload }: { requirement: { id: string; title: string; description?: string | null; dueDate?: string | null; isRequired: boolean; category?: string | null; folder?: { name: string; color: string | null } | null }; submission?: { status: string; fileUrl: string; feedback?: string | null }; onUpload: () => void }) {
    const isOverdue = requirement.dueDate && new Date(requirement.dueDate) < new Date();
    const daysUntilDue = requirement.dueDate
        ? Math.ceil((new Date(requirement.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

    const getStatus = () => {
        if (!submission) return { label: "Not Submitted", icon: FileUp, color: "text-muted-foreground" };
        switch (submission.status) {
            case "APPROVED": return { label: "Approved", icon: CheckCircle2, color: "text-emerald-600" };
            case "REJECTED": return { label: "Rejected", icon: XCircle, color: "text-destructive" };
            case "REVISION_REQUESTED": return { label: "Revision Needed", icon: RefreshCw, color: "text-amber-600" };
            default: return { label: "Pending Review", icon: Clock, color: "text-amber-600" };
        }
    };

    const status = getStatus();
    const StatusIcon = status.icon;

    return (
        <div className="flex items-start gap-4 px-6 py-4 hover:bg-muted/20 transition-colors">
            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{requirement.title}</p>
                    {requirement.isRequired && (
                        <Badge variant="destructive" className="rounded-none text-[10px] px-1.5 py-0">Required</Badge>
                    )}
                    {requirement.category && (
                        <Badge variant="outline" className="rounded-none text-[10px] px-1.5 py-0">{requirement.category}</Badge>
                    )}
                    {requirement.folder && (
                        <Badge variant="secondary" className="rounded-none text-[10px] px-1.5 py-0 gap-1">
                            <span
                                className="h-1.5 w-1.5 rounded-full inline-block"
                                style={{ backgroundColor: requirement.folder.color || "#64748B" }}
                            />
                            {requirement.folder.name}
                        </Badge>
                    )}
                </div>
                {requirement.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{requirement.description}</p>
                )}
                <div className="flex items-center gap-4 flex-wrap pt-0.5">
                    {requirement.dueDate && (
                        <span className={cn("text-xs flex items-center gap-1", isOverdue ? "text-destructive" : "text-muted-foreground")}>
                            <Calendar className="h-3 w-3" />
                            {isOverdue ? "Overdue" : daysUntilDue !== null && daysUntilDue <= 7 ? `Due in ${daysUntilDue}d` : new Date(requirement.dueDate).toLocaleDateString()}
                        </span>
                    )}
                    <span className={cn("text-xs flex items-center gap-1", status.color)}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                    </span>
                </div>
                {submission?.feedback && (
                    <div className="mt-2 px-3 py-2 bg-muted/50 text-xs text-muted-foreground rounded-sm">
                        <span className="font-medium text-foreground">Feedback: </span>{submission.feedback}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 shrink-0 pt-0.5">
                {submission && (
                    <Button variant="outline" size="sm" className="rounded-none h-7 text-xs gap-1.5" asChild>
                        <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                            View
                        </a>
                    </Button>
                )}
                {(!submission || submission.status === "REJECTED" || submission.status === "REVISION_REQUESTED") && (
                    <Button onClick={onUpload} size="sm" className="rounded-none h-7 text-xs gap-1.5">
                        <Upload className="h-3 w-3" />
                        {submission ? "Resubmit" : "Upload"}
                    </Button>
                )}
            </div>
        </div>
    );
}
