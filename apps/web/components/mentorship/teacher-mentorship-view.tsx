/**
 * @file components/mentorship/teacher-mentorship-view.tsx
 * @description Teacher's view of the mentorship page - manage mentees and document requirements
 * @module Apps/Web/Components/Mentorship
 */

"use client";

import { useState } from "react";
import {
    Users,
    FileText,
    Clock,
    CheckCircle2,
    Plus,
    Search,
    Eye,
    Trash2,
    MoreHorizontal,
    GraduationCap,
    AlertCircle,
    Filter,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useMentorshipData } from "@/hooks/queries/use-mentorship";
import { AddMenteeDialog } from "./add-mentee-dialog";
import { CreateRequirementDialog } from "./create-requirement-dialog";
import { SubmissionReviewPanel } from "./submission-review-panel";
import { cn } from "@/lib/utils";

interface TeacherMentorshipViewProps {
    userName: string;
}

export function TeacherMentorshipView({ userName }: TeacherMentorshipViewProps) {
    const { data, isLoading, error } = useMentorshipData();
    const [searchQuery, setSearchQuery] = useState("");
    const [addMenteeOpen, setAddMenteeOpen] = useState(false);
    const [createRequirementOpen, setCreateRequirementOpen] = useState(false);
    const [selectedTab, setSelectedTab] = useState("overview");

    if (isLoading) {
        return <MentorshipSkeleton />;
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

    const stats = data?.stats || {
        totalMentees: 0,
        activeMentees: 0,
        pendingDocuments: 0,
        completedDocuments: 0,
    };

    const mentees = data?.mentees || [];
    const requirements = data?.requirements || [];
    const submissions = data?.submissions || [];

    const filteredMentees = mentees.filter((m) =>
        m.mentee?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.mentee?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pendingSubmissions = submissions.filter((s) => s.status === "PENDING");

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text">
                        Mentorship Dashboard
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Manage your mentees and track their document submissions.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setCreateRequirementOpen(true)}
                        className="gap-2"
                    >
                        <FileText className="h-4 w-4" />
                        New Requirement
                    </Button>
                    <Button onClick={() => setAddMenteeOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Mentee
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Mentees"
                    value={stats.totalMentees}
                    icon={Users}
                    description={`${stats.activeMentees} active`}
                    trend="neutral"
                    gradient="from-blue-500/10 to-cyan-500/10"
                    iconColor="text-blue-500"
                />
                <StatsCard
                    title="Document Requirements"
                    value={requirements.length}
                    icon={FileText}
                    description="Total documents"
                    trend="neutral"
                    gradient="from-purple-500/10 to-pink-500/10"
                    iconColor="text-purple-500"
                />
                <StatsCard
                    title="Pending Reviews"
                    value={stats.pendingDocuments}
                    icon={Clock}
                    description="Awaiting review"
                    trend={stats.pendingDocuments > 0 ? "warning" : "success"}
                    gradient="from-amber-500/10 to-orange-500/10"
                    iconColor="text-amber-500"
                />
                <StatsCard
                    title="Approved Documents"
                    value={stats.completedDocuments}
                    icon={CheckCircle2}
                    description="Successfully reviewed"
                    trend="success"
                    gradient="from-emerald-500/10 to-green-500/10"
                    iconColor="text-emerald-500"
                />
            </div>

            {/* Main Content Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
                <TabsList className="grid w-full max-w-lg grid-cols-3">
                    <TabsTrigger value="overview" className="gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Mentees
                    </TabsTrigger>
                    <TabsTrigger value="requirements" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Requirements
                    </TabsTrigger>
                    <TabsTrigger value="submissions" className="gap-2 relative">
                        <Eye className="h-4 w-4" />
                        Submissions
                        {pendingSubmissions.length > 0 && (
                            <Badge variant="destructive" className="ml-2 h-5 min-w-5 px-1 text-xs">
                                {pendingSubmissions.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* Mentees Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search mentees..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Button variant="outline" size="icon">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>

                    {filteredMentees.length === 0 ? (
                        <EmptyMentees onAdd={() => setAddMenteeOpen(true)} />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredMentees.map((mentorship) => (
                                <MenteeCard key={mentorship.id} mentorship={mentorship} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Requirements Tab */}
                <TabsContent value="requirements" className="space-y-4">
                    {requirements.length === 0 ? (
                        <EmptyRequirements onCreate={() => setCreateRequirementOpen(true)} />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {requirements.map((req) => (
                                <RequirementCard key={req.id} requirement={req} menteeCount={mentees.length} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Submissions Tab */}
                <TabsContent value="submissions" className="space-y-4">
                    <SubmissionReviewPanel submissions={submissions} />
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <AddMenteeDialog open={addMenteeOpen} onOpenChange={setAddMenteeOpen} />
            <CreateRequirementDialog
                open={createRequirementOpen}
                onOpenChange={setCreateRequirementOpen}
            />
        </div>
    );
}

// Stats Card Component
function StatsCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    gradient,
    iconColor,
}: {
    title: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    trend: "success" | "warning" | "neutral";
    gradient: string;
    iconColor: string;
}) {
    return (
        <Card className={cn("overflow-hidden border-0 shadow-lg", `bg-gradient-to-br ${gradient}`)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className={cn("p-2 rounded-lg bg-background/80", iconColor)}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
        </Card>
    );
}

// Mentee Card Component
function MenteeCard({ mentorship }: { mentorship: any }) {
    const mentee = mentorship.mentee;
    const initials = mentee?.name
        ?.split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase() || "?";

    return (
        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14 ring-2 ring-primary/10">
                            <AvatarImage src={mentee?.avatar || undefined} alt={mentee?.name || "Mentee"} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-lg">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <h3 className="font-semibold text-lg leading-none">{mentee?.name || "Unknown"}</h3>
                            <p className="text-sm text-muted-foreground">{mentee?.email}</p>
                            <div className="flex gap-2 mt-2">
                                {mentee?.studentId && (
                                    <Badge variant="outline" className="text-xs">
                                        {mentee.studentId}
                                    </Badge>
                                )}
                                {mentee?.semester && (
                                    <Badge variant="secondary" className="text-xs">
                                        {mentee.semester}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                View Documents
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Mentee
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <Badge
                        variant={mentorship.status === "ACTIVE" ? "default" : "secondary"}
                        className={cn(
                            mentorship.status === "ACTIVE" && "bg-emerald-500 hover:bg-emerald-600"
                        )}
                    >
                        {mentorship.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                        Added {new Date(mentorship.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

// Requirement Card Component
function RequirementCard({
    requirement,
    menteeCount,
}: {
    requirement: any;
    menteeCount: number;
}) {
    const submissionCount = requirement._count?.submissions || 0;
    const progress = menteeCount > 0 ? Math.round((submissionCount / menteeCount) * 100) : 0;
    const isOverdue =
        requirement.dueDate && new Date(requirement.dueDate) < new Date();

    return (
        <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                            {requirement.title}
                            {requirement.isRequired && (
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                            )}
                        </CardTitle>
                        {requirement.category && (
                            <Badge variant="outline" className="text-xs">
                                {requirement.category}
                            </Badge>
                        )}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit Requirement</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                {requirement.description && (
                    <CardDescription className="line-clamp-2">
                        {requirement.description}
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {requirement.dueDate && (
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className={cn("h-4 w-4", isOverdue ? "text-destructive" : "text-muted-foreground")} />
                            <span className={cn(isOverdue && "text-destructive font-medium")}>
                                Due: {new Date(requirement.dueDate).toLocaleDateString()}
                                {isOverdue && " (Overdue)"}
                            </span>
                        </div>
                    )}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Submissions</span>
                            <span className="font-medium">{submissionCount}/{menteeCount}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Empty States
function EmptyMentees({ onAdd }: { onAdd: () => void }) {
    return (
        <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                    <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Mentees Yet</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                    Start building your mentee network. Add students to guide them through their academic journey.
                </p>
                <Button onClick={onAdd} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Your First Mentee
                </Button>
            </CardContent>
        </Card>
    );
}

function EmptyRequirements({ onCreate }: { onCreate: () => void }) {
    return (
        <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-purple-500/10 p-4 mb-4">
                    <FileText className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Document Requirements</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                    Create document requirements that your mentees need to submit. Track their progress easily.
                </p>
                <Button onClick={onCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create First Requirement
                </Button>
            </CardContent>
        </Card>
    );
}

// Loading Skeleton
function MentorshipSkeleton() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-64" />
                    <Skeleton className="h-5 w-96" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-36" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                ))}
            </div>
            <Skeleton className="h-12 w-96" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-48" />
                ))}
            </div>
        </div>
    );
}
