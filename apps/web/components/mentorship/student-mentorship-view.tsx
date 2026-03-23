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
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Progress } from "@workspace/ui/components/progress";
import { useMentorshipData } from "@/hooks/queries/use-mentorship";
import { DocumentUploadDialog } from "./document-upload-dialog";
import { StatsCard, StatsCardSkeleton, gradientPresets } from "@/components/ui/stats-card";
import { cn } from "@/lib/utils";

const HATCH = {
    backgroundImage: "repeating-linear-gradient(45deg, var(--color-border) 0, var(--color-border) 1px, transparent 0, transparent 50%)",
    backgroundSize: "6px 6px",
};

const TABS = [
    { id: "required", label: "Required Documents" },
    { id: "optional", label: "Optional Documents" },
] as const;

type Tab = typeof TABS[number]["id"];

interface StudentMentorshipViewProps {
    userName: string;
}

export function StudentMentorshipView({ userName }: StudentMentorshipViewProps) {
    const { data, isLoading, error } = useMentorshipData();
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [selectedRequirement, setSelectedRequirement] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<Tab>("required");

    if (isLoading) {
        return (
            <div className="flex w-full min-w-0 flex-col">
                <div className="flex flex-col justify-between gap-4 border-b bg-background px-6 py-5 lg:flex-row lg:items-center">
                    <div className="space-y-2">
                        <div className="h-7 w-56 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-80 bg-muted/50 rounded animate-pulse" />
                    </div>
                </div>
                <div className="grid grid-cols-4 border-b divide-x divide-border">
                    {[...Array(4)].map((_, i) => <StatsCardSkeleton key={i} />)}
                </div>
                <div className="h-4 w-full border-b shrink-0" style={HATCH} />
                <div className="grid grid-cols-1 xl:grid-cols-4 divide-y xl:divide-y-0 xl:divide-x divide-border">
                    <div className="px-6 py-6 space-y-4">
                        <div className="h-20 w-20 rounded-full bg-muted animate-pulse mx-auto" />
                        <div className="h-5 w-32 bg-muted rounded animate-pulse mx-auto" />
                        <div className="h-4 w-48 bg-muted/50 rounded animate-pulse mx-auto" />
                    </div>
                    <div className="xl:col-span-3 space-y-px">
                        {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted/40 animate-pulse border-b border-border" />)}
                    </div>
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

    const getSubmissionForRequirement = (reqId: string) => submissions.find(s => s.requirementId === reqId);
    const requiredDocs = requirements.filter(r => r.isRequired);
    const optionalDocs = requirements.filter(r => !r.isRequired);
    const approvedCount = submissions.filter(s => s.status === "APPROVED").length;
    const progressPercent = requirements.length > 0 ? Math.round((approvedCount / requirements.length) * 100) : 0;

    const handleUpload = (requirement: any) => {
        setSelectedRequirement(requirement);
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
                <div className="h-4 w-full border-b shrink-0" style={HATCH} />
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-6">
                    <User className="h-10 w-10 text-muted-foreground/40" />
                    <div>
                        <p className="text-sm font-medium">No mentor assigned yet</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                            Once a teacher adds you as their mentee, you'll be able to see their document requirements here.
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
    const activeDocs = activeTab === "required" ? requiredDocs : optionalDocs;

    return (
        <div className="flex w-full min-w-0 flex-col">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 border-b bg-background px-6 py-5 lg:flex-row lg:items-center">
                <div className="min-w-0 space-y-1">
                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">My Mentor & Documents</h1>
                    <p className="text-sm text-muted-foreground">View your mentor's requirements and submit your documents.</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 border-b divide-x divide-border">
                <StatsCard title="Total Required" value={requirements.length} icon={FileText} description="Document requirements" index={0} {...gradientPresets.blue} />
                <StatsCard title="Submitted" value={submissions.length} icon={Upload} description="Documents uploaded" index={1} {...gradientPresets.purple} />
                <StatsCard title="Pending Review" value={stats.pendingDocuments} icon={Clock} description="Awaiting feedback" trend={stats.pendingDocuments > 0 ? "warning" : "neutral"} index={2} {...gradientPresets.amber} />
                <StatsCard title="Approved" value={approvedCount} icon={CheckCircle2} description="Successfully approved" trend="success" index={3} {...gradientPresets.emerald} />
            </div>

            {/* Hatched divider */}
            <div className="h-4 w-full border-b shrink-0" style={HATCH} />

            {/* Two-column: mentor card left, documents right */}
            <div className="grid grid-cols-1 xl:grid-cols-4 divide-y xl:divide-y-0 xl:divide-x divide-border">

                {/* Left — Mentor card */}
                <div className="min-w-0 divide-y divide-border">
                    {/* Section label */}
                    <div className="flex items-center gap-2 px-6 py-3 bg-muted/30">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Your Mentor</span>
                    </div>

                    {/* Avatar + name */}
                    <div className="flex flex-col items-center gap-3 px-6 py-6 text-center">
                        <Avatar className="h-16 w-16 border-2 border-border">
                            <AvatarImage src={mentor.avatar || undefined} alt={mentor.name || "Mentor"} />
                            <AvatarFallback className="text-lg font-semibold">{mentorInitials}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{mentor.name}</p>
                            {mentor.title && <p className="text-xs text-muted-foreground mt-0.5">{mentor.title}</p>}
                        </div>
                    </div>

                    {/* Expertise */}
                    {mentor.expertise && (
                        <div className="flex items-center justify-between px-6 py-3">
                            <span className="text-xs text-muted-foreground">Expertise</span>
                            <span className="text-xs font-medium flex items-center gap-1.5">
                                <Award className="h-3 w-3 text-primary" />
                                {mentor.expertise}
                            </span>
                        </div>
                    )}

                    {/* Email */}
                    <div className="flex items-center justify-between gap-3 px-6 py-3">
                        <span className="text-xs text-muted-foreground shrink-0">Email</span>
                        <span className="text-xs truncate">{mentor.email}</span>
                    </div>

                    {/* Progress */}
                    <div className="px-6 py-4 space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Overall Progress</span>
                            <span className="font-medium">{approvedCount}/{requirements.length} approved</span>
                        </div>
                        <Progress value={progressPercent} className="h-1.5" />
                    </div>

                    {/* Contact button */}
                    <div className="px-6 py-4">
                        <Button variant="outline" className="w-full rounded-none gap-2 text-sm" size="sm">
                            <Mail className="h-4 w-4" />
                            Contact Mentor
                        </Button>
                    </div>
                </div>

                {/* Right — Documents */}
                <div className="min-w-0 xl:col-span-3 divide-y divide-border">
                    {/* Tab nav */}
                    <div className="flex divide-x divide-border">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-3 text-sm transition-colors",
                                    activeTab === tab.id
                                        ? "bg-background font-medium border-b-2 border-b-foreground -mb-px"
                                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                                )}
                            >
                                {tab.label}
                                <Badge variant="secondary" className="rounded-none text-[10px] px-1.5 py-0">
                                    {tab.id === "required" ? requiredDocs.length : optionalDocs.length}
                                </Badge>
                            </button>
                        ))}
                    </div>

                    {/* Document list */}
                    {activeDocs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                            <FileText className="h-8 w-8 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">
                                No {activeTab} documents yet
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {activeDocs.map(req => (
                                <DocumentRow
                                    key={req.id}
                                    requirement={req}
                                    submission={getSubmissionForRequirement(req.id)}
                                    onUpload={() => handleUpload(req)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <DocumentUploadDialog
                open={uploadDialogOpen}
                onOpenChange={setUploadDialogOpen}
                requirement={selectedRequirement}
            />
        </div>
    );
}

function DocumentRow({ requirement, submission, onUpload }: { requirement: any; submission?: any; onUpload: () => void }) {
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

    const leftBorderColor = submission?.status === "APPROVED"
        ? "border-l-emerald-500"
        : submission?.status === "REJECTED"
            ? "border-l-destructive"
            : submission
                ? "border-l-amber-500"
                : "border-l-transparent";

    return (
        <div className={cn("flex items-start gap-4 px-6 py-4 hover:bg-muted/20 transition-colors border-l-2", leftBorderColor)}>
            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{requirement.title}</p>
                    {requirement.category && (
                        <Badge variant="outline" className="rounded-none text-[10px] px-1.5 py-0">{requirement.category}</Badge>
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
                    <div className="mt-2 px-3 py-2 bg-muted/50 border-l-2 border-l-primary text-xs text-muted-foreground">
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
