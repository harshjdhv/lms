/**
 * @file components/mentorship/student-mentorship-view.tsx
 * @description Student's view of the mentorship page - view mentor and submit documents
 * @module Apps/Web/Components/Mentorship
 */

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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Progress } from "@workspace/ui/components/progress";
import { useMentorshipData } from "@/hooks/queries/use-mentorship";
import { DocumentUploadDialog } from "./document-upload-dialog";
import { cn } from "@/lib/utils";

interface StudentMentorshipViewProps {
    userName: string;
}

export function StudentMentorshipView({ userName }: StudentMentorshipViewProps) {
    const { data, isLoading, error } = useMentorshipData();
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [selectedRequirement, setSelectedRequirement] = useState<any>(null);

    if (isLoading) {
        return <StudentMentorshipSkeleton />;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <p className="text-lg text-muted-foreground">Failed to load mentorship data</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                    Try Again
                </Button>
            </div>
        );
    }

    const mentor = data?.mentor;
    const requirements = data?.requirements || [];
    const submissions = data?.submissions || [];
    const stats = data?.stats || { pendingDocuments: 0, completedDocuments: 0 };

    // Map submissions to requirements
    const getSubmissionForRequirement = (reqId: string) =>
        submissions.find((s) => s.requirementId === reqId);

    const requiredDocs = requirements.filter((r) => r.isRequired);
    const optionalDocs = requirements.filter((r) => !r.isRequired);
    const submittedCount = submissions.length;
    const approvedCount = submissions.filter((s) => s.status === "APPROVED").length;
    const progressPercent =
        requirements.length > 0
            ? Math.round((approvedCount / requirements.length) * 100)
            : 0;

    const handleUpload = (requirement: any) => {
        setSelectedRequirement(requirement);
        setUploadDialogOpen(true);
    };

    if (!mentor) {
        return <NoMentorAssigned userName={userName} />;
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text">
                        My Mentor & Documents
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        View your mentor's requirements and submit your documents.
                    </p>
                </div>
            </div>

            {/* Mentor Card & Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Mentor Info Card */}
                <Card className="lg:col-span-1 overflow-hidden">
                    <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
                    <CardContent className="-mt-12 relative">
                        <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg">
                            <AvatarImage src={mentor.avatar || undefined} alt={mentor.name || "Mentor"} />
                            <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                                {mentor.name
                                    ?.split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                    .toUpperCase() || "M"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="mt-4 space-y-3">
                            <div>
                                <h2 className="text-2xl font-bold">{mentor.name}</h2>
                                {mentor.title && (
                                    <p className="text-muted-foreground">{mentor.title}</p>
                                )}
                            </div>
                            {mentor.expertise && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Award className="h-4 w-4 text-primary" />
                                    <span>{mentor.expertise}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <span>{mentor.email}</span>
                            </div>
                            <Button variant="outline" className="w-full mt-4 gap-2">
                                <Mail className="h-4 w-4" />
                                Contact Mentor
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Progress Overview */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Document Progress
                        </CardTitle>
                        <CardDescription>
                            Track your document submission progress
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">Overall Progress</span>
                                <span className="text-muted-foreground">
                                    {approvedCount}/{requirements.length} approved
                                </span>
                            </div>
                            <Progress value={progressPercent} className="h-3" />
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatBox
                                label="Total Required"
                                value={requirements.length}
                                icon={FileText}
                                color="text-blue-500"
                                bgColor="bg-blue-500/10"
                            />
                            <StatBox
                                label="Submitted"
                                value={submittedCount}
                                icon={Upload}
                                color="text-purple-500"
                                bgColor="bg-purple-500/10"
                            />
                            <StatBox
                                label="Pending Review"
                                value={stats.pendingDocuments}
                                icon={Clock}
                                color="text-amber-500"
                                bgColor="bg-amber-500/10"
                            />
                            <StatBox
                                label="Approved"
                                value={approvedCount}
                                icon={CheckCircle2}
                                color="text-emerald-500"
                                bgColor="bg-emerald-500/10"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Documents Section */}
            <Tabs defaultValue="required" className="space-y-6">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="required" className="gap-2">
                        Required Documents
                        <Badge variant="secondary">{requiredDocs.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="optional" className="gap-2">
                        Optional
                        <Badge variant="outline">{optionalDocs.length}</Badge>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="required" className="space-y-4">
                    {requiredDocs.length === 0 ? (
                        <EmptyDocuments type="required" />
                    ) : (
                        <div className="grid gap-4">
                            {requiredDocs.map((req) => (
                                <DocumentRequirementCard
                                    key={req.id}
                                    requirement={req}
                                    submission={getSubmissionForRequirement(req.id)}
                                    onUpload={() => handleUpload(req)}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="optional" className="space-y-4">
                    {optionalDocs.length === 0 ? (
                        <EmptyDocuments type="optional" />
                    ) : (
                        <div className="grid gap-4">
                            {optionalDocs.map((req) => (
                                <DocumentRequirementCard
                                    key={req.id}
                                    requirement={req}
                                    submission={getSubmissionForRequirement(req.id)}
                                    onUpload={() => handleUpload(req)}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Upload Dialog */}
            <DocumentUploadDialog
                open={uploadDialogOpen}
                onOpenChange={setUploadDialogOpen}
                requirement={selectedRequirement}
            />
        </div>
    );
}

// Stat Box Component
function StatBox({
    label,
    value,
    icon: Icon,
    color,
    bgColor,
}: {
    label: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
}) {
    return (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
            <div className={cn("p-2 rounded-lg", bgColor)}>
                <Icon className={cn("h-5 w-5", color)} />
            </div>
            <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
            </div>
        </div>
    );
}

// Document Requirement Card
function DocumentRequirementCard({
    requirement,
    submission,
    onUpload,
}: {
    requirement: any;
    submission?: any;
    onUpload: () => void;
}) {
    const isOverdue =
        requirement.dueDate && new Date(requirement.dueDate) < new Date();
    const daysUntilDue = requirement.dueDate
        ? Math.ceil(
            (new Date(requirement.dueDate).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
        : null;

    const getStatusConfig = () => {
        if (!submission) {
            return {
                label: "Not Submitted",
                variant: "outline" as const,
                icon: FileUp,
                color: "text-muted-foreground",
            };
        }
        switch (submission.status) {
            case "APPROVED":
                return {
                    label: "Approved",
                    variant: "default" as const,
                    icon: CheckCircle2,
                    color: "text-emerald-500",
                };
            case "REJECTED":
                return {
                    label: "Rejected",
                    variant: "destructive" as const,
                    icon: XCircle,
                    color: "text-destructive",
                };
            case "REVISION_REQUESTED":
                return {
                    label: "Revision Needed",
                    variant: "secondary" as const,
                    icon: RefreshCw,
                    color: "text-amber-500",
                };
            default:
                return {
                    label: "Pending Review",
                    variant: "secondary" as const,
                    icon: Clock,
                    color: "text-amber-500",
                };
        }
    };

    const status = getStatusConfig();
    const StatusIcon = status.icon;

    return (
        <Card
            className={cn(
                "transition-all duration-300 hover:shadow-md",
                submission?.status === "APPROVED" && "border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/50 dark:bg-emerald-950/20",
                submission?.status === "REJECTED" && "border-destructive/30 bg-destructive/5"
            )}
        >
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                            <div
                                className={cn(
                                    "p-2 rounded-lg",
                                    submission?.status === "APPROVED"
                                        ? "bg-emerald-500/10"
                                        : submission?.status === "REJECTED"
                                            ? "bg-destructive/10"
                                            : "bg-primary/10"
                                )}
                            >
                                <FileText
                                    className={cn(
                                        "h-5 w-5",
                                        submission?.status === "APPROVED"
                                            ? "text-emerald-500"
                                            : submission?.status === "REJECTED"
                                                ? "text-destructive"
                                                : "text-primary"
                                    )}
                                />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{requirement.title}</h3>
                                <div className="flex items-center gap-2 flex-wrap mt-1">
                                    {requirement.category && (
                                        <Badge variant="outline" className="text-xs">
                                            {requirement.category}
                                        </Badge>
                                    )}
                                    {requirement.isRequired && (
                                        <Badge variant="destructive" className="text-xs">
                                            Required
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {requirement.description && (
                            <p className="text-sm text-muted-foreground">{requirement.description}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm">
                            {requirement.dueDate && (
                                <div
                                    className={cn(
                                        "flex items-center gap-1.5",
                                        isOverdue ? "text-destructive" : "text-muted-foreground"
                                    )}
                                >
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        {isOverdue
                                            ? "Overdue"
                                            : daysUntilDue !== null && daysUntilDue <= 7
                                                ? `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? "s" : ""}`
                                                : `Due: ${new Date(requirement.dueDate).toLocaleDateString()}`}
                                    </span>
                                </div>
                            )}
                            <div className={cn("flex items-center gap-1.5", status.color)}>
                                <StatusIcon className="h-4 w-4" />
                                <span>{status.label}</span>
                            </div>
                        </div>

                        {submission?.feedback && (
                            <div className="mt-3 p-3 rounded-lg bg-muted/50 border-l-4 border-primary">
                                <p className="text-sm font-medium mb-1">Feedback from mentor:</p>
                                <p className="text-sm text-muted-foreground">{submission.feedback}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {submission && (
                            <Button variant="outline" size="sm" asChild>
                                <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View
                                </a>
                            </Button>
                        )}
                        {(!submission ||
                            submission.status === "REJECTED" ||
                            submission.status === "REVISION_REQUESTED") && (
                                <Button onClick={onUpload} className="gap-2">
                                    <Upload className="h-4 w-4" />
                                    {submission ? "Resubmit" : "Upload"}
                                </Button>
                            )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// No Mentor Assigned View
function NoMentorAssigned({ userName }: { userName: string }) {
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Welcome, {userName.split(" ")[0]}
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Your mentorship dashboard
                    </p>
                </div>
            </div>

            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="rounded-full bg-primary/10 p-6 mb-6">
                        <User className="h-12 w-12 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">No Mentor Assigned Yet</h2>
                    <p className="text-muted-foreground max-w-md mb-6">
                        You haven't been assigned to a mentor yet. Once a teacher adds you as their mentee,
                        you'll be able to see their document requirements here.
                    </p>
                    <Badge variant="secondary" className="text-sm py-2 px-4">
                        <Clock className="h-4 w-4 mr-2" />
                        Waiting for assignment
                    </Badge>
                </CardContent>
            </Card>
        </div>
    );
}

// Empty Documents
function EmptyDocuments({ type }: { type: "required" | "optional" }) {
    return (
        <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                    No {type === "required" ? "Required" : "Optional"} Documents
                </h3>
                <p className="text-muted-foreground max-w-sm">
                    Your mentor hasn't added any {type} document requirements yet.
                </p>
            </CardContent>
        </Card>
    );
}

// Loading Skeleton
function StudentMentorshipSkeleton() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-72" />
                    <Skeleton className="h-5 w-96" />
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="h-80" />
                <Skeleton className="h-80 lg:col-span-2" />
            </div>
            <Skeleton className="h-12 w-80" />
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                ))}
            </div>
        </div>
    );
}
