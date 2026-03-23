"use client";

import { useState } from "react";
import {
    Users,
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    RefreshCw,
    ExternalLink,
    Plus,
    Search,
    Eye,
    Trash2,
    MoreHorizontal,
    GraduationCap,
    AlertCircle,
    FolderOpen,
    FolderPlus,
    Folder,
    ChevronRight,
    Pencil,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Progress } from "@workspace/ui/components/progress";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import {
    useMentorshipData,
    DocumentFolder,
    DocumentRequirement,
    DocumentSubmission,
    MenteeUser,
    useDeleteFolder,
} from "@/hooks/queries/use-mentorship";
import { AddMenteeDialog } from "./add-mentee-dialog";
import { CreateRequirementDialog } from "./create-requirement-dialog";
import { CreateFolderDialog } from "./create-folder-dialog";
import { SubmissionReviewPanel } from "./submission-review-panel";
import { StatsCard, StatsCardSkeleton, gradientPresets } from "@/components/ui/stats-card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const HATCH = {
    backgroundImage: "repeating-linear-gradient(45deg, var(--color-border) 0, var(--color-border) 1px, transparent 0, transparent 50%)",
    backgroundSize: "6px 6px",
};

const TABS = [
    { id: "mentees", label: "Mentees", icon: GraduationCap },
    { id: "documents", label: "Documents", icon: FolderOpen },
    { id: "submissions", label: "Submissions", icon: Eye },
] as const;

type Tab = typeof TABS[number]["id"];

interface TeacherMentorshipViewProps {
    userName: string;
}

export function TeacherMentorshipView({ userName }: TeacherMentorshipViewProps) {
    const { data, isLoading, error } = useMentorshipData();
    const [searchQuery, setSearchQuery] = useState("");
    const [addMenteeOpen, setAddMenteeOpen] = useState(false);
    const [createRequirementOpen, setCreateRequirementOpen] = useState(false);
    const [createFolderOpen, setCreateFolderOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>("mentees");
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [selectedMenteeId, setSelectedMenteeId] = useState<string | null>(null);
    const [selectedProfileMenteeId, setSelectedProfileMenteeId] = useState<string | null>(null);

    const deleteFolder = useDeleteFolder();

    if (isLoading) {
        return (
            <div className="flex w-full min-w-0 flex-col">
                <div className="flex flex-col justify-between gap-4 border-b bg-background px-6 py-5 lg:flex-row lg:items-center">
                    <div className="space-y-2">
                        <div className="h-7 w-56 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-80 bg-muted/50 rounded animate-pulse" />
                    </div>
                    <div className="flex gap-3">
                        <div className="h-9 w-36 bg-muted rounded animate-pulse" />
                        <div className="h-9 w-28 bg-muted rounded animate-pulse" />
                    </div>
                </div>
                <div className="grid grid-cols-4 border-b divide-x divide-border">
                    {[...Array(4)].map((_, i) => <StatsCardSkeleton key={i} />)}
                </div>
                <div className="h-4 w-full border-b shrink-0" style={HATCH} />
                <div className="flex border-b divide-x divide-border">
                    {TABS.map(t => <div key={t.id} className="px-6 py-3 h-11 w-36 bg-muted/40 animate-pulse" />)}
                </div>
                <div className="px-6 py-6 space-y-px">
                    {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-muted/40 animate-pulse border-b border-border" />)}
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

    const stats = data?.stats || { totalMentees: 0, activeMentees: 0, pendingDocuments: 0, completedDocuments: 0 };
    const mentees = data?.mentees || [];
    const requirements = data?.requirements || [];
    const submissions = data?.submissions || [];
    const folders = data?.folders || [];
    const pendingCount = submissions.filter(s => s.status === "PENDING").length;

    const filteredMentees = mentees.filter(m =>
        m.mentee?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.mentee?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Document filtering by folder
    const unfolderedRequirements = requirements.filter(r => !r.folderId);
    const currentFolderRequirements = selectedFolderId
        ? requirements.filter(r => r.folderId === selectedFolderId)
        : unfolderedRequirements;
    const currentFolder = selectedFolderId
        ? folders.find(f => f.id === selectedFolderId)
        : null;
    const selectedMentee = mentees.find(m => m.mentee.id === selectedMenteeId)?.mentee ?? null;
    const selectedMenteeSubmissions = selectedMenteeId
        ? submissions.filter(s => s.studentId === selectedMenteeId)
        : [];
    const selectedProfileMentee = mentees.find(m => m.mentee.id === selectedProfileMenteeId)?.mentee ?? null;

    const handleDeleteFolder = async (folderId: string) => {
        try {
            await deleteFolder.mutateAsync(folderId);
            toast.success("Folder deleted. Requirements moved to uncategorized.");
            if (selectedFolderId === folderId) {
                setSelectedFolderId(null);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to delete folder");
        }
    };

    return (
        <div className="flex w-full min-w-0 flex-col">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 border-b bg-background px-6 py-5 lg:flex-row lg:items-center">
                <div className="min-w-0 space-y-1">
                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Mentorship Dashboard</h1>
                    <p className="text-sm text-muted-foreground">Manage your mentees and track their document submissions.</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    {activeTab === "documents" && (
                        <Button variant="outline" onClick={() => setCreateFolderOpen(true)} className="rounded-none gap-2">
                            <FolderPlus className="h-4 w-4" />
                            New Folder
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => setCreateRequirementOpen(true)} className="rounded-none gap-2">
                        <FileText className="h-4 w-4" />
                        New Requirement
                    </Button>
                    <Button onClick={() => setAddMenteeOpen(true)} className="rounded-none gap-2">
                        <Plus className="h-4 w-4" />
                        Add Mentee
                    </Button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 border-b divide-x divide-border">
                <StatsCard title="Total Mentees" value={stats.totalMentees} icon={Users} description={`${stats.activeMentees} active`} index={0} {...gradientPresets.blue} />
                <StatsCard title="Folders" value={folders.length} icon={Folder} description={`${requirements.length} requirements`} index={1} {...gradientPresets.purple} />
                <StatsCard title="Pending Reviews" value={stats.pendingDocuments} icon={Clock} description="Awaiting review" trend={stats.pendingDocuments > 0 ? "warning" : "neutral"} index={2} {...gradientPresets.amber} />
                <StatsCard title="Approved" value={stats.completedDocuments} icon={CheckCircle2} description="Successfully reviewed" trend="success" index={3} {...gradientPresets.emerald} />
            </div>

            {/* Hatched divider */}
            <div className="h-4 w-full border-b shrink-0" style={HATCH} />

            {/* Tab nav */}
            <div className="flex border-b divide-x divide-border">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                            if (tab.id !== "documents") setSelectedFolderId(null);
                        }}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 text-sm transition-colors",
                            activeTab === tab.id
                                ? "bg-background font-medium border-b-2 border-b-foreground -mb-px"
                                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                        )}
                    >
                        <tab.icon className="h-3.5 w-3.5" />
                        {tab.label}
                        {tab.id === "submissions" && pendingCount > 0 && (
                            <Badge variant="destructive" className="rounded-none h-4 min-w-4 px-1 text-[10px]">
                                {pendingCount}
                            </Badge>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {activeTab === "mentees" && (
                <div className="flex flex-col">
                    {/* Search bar */}
                    <div className="flex items-center gap-3 px-6 py-3 border-b">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search mentees..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-9 rounded-none h-8 text-sm"
                            />
                        </div>
                    </div>

                    {filteredMentees.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                            <Users className="h-8 w-8 text-muted-foreground/40" />
                            <div>
                                <p className="text-sm font-medium">No mentees yet</p>
                                <p className="text-xs text-muted-foreground mt-1">Add students to guide them through their academic journey.</p>
                            </div>
                            <Button onClick={() => setAddMenteeOpen(true)} className="rounded-none gap-2" size="sm">
                                <Plus className="h-4 w-4" />
                                Add Your First Mentee
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {filteredMentees.map(mentorship => (
                                <MenteeRow
                                    key={mentorship.id}
                                    mentorship={mentorship}
                                    onViewProfile={() => {
                                        window.setTimeout(() => setSelectedProfileMenteeId(mentorship.mentee.id), 0);
                                    }}
                                    onViewDocuments={() => {
                                        // Wait for dropdown close animation/event cycle before opening dialog.
                                        window.setTimeout(() => setSelectedMenteeId(mentorship.mentee.id), 0);
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "documents" && (
                <div className="flex min-h-0">
                    {/* Folder sidebar */}
                    <div className="w-60 shrink-0 border-r border-border">
                        <div className="px-3 py-2">
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest px-2 py-1.5">Folders</p>
                        </div>
                        <div className="px-2 pb-2 space-y-0.5">
                            {/* Uncategorized */}
                            <button
                                onClick={() => setSelectedFolderId(null)}
                                className={cn(
                                    "flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors text-left rounded-sm",
                                    selectedFolderId === null
                                        ? "bg-muted font-medium text-foreground"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                )}
                            >
                                <FolderOpen className="h-4 w-4 shrink-0" />
                                <span className="truncate flex-1">Uncategorized</span>
                                <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                                    {unfolderedRequirements.length}
                                </span>
                            </button>

                            {/* Folder list */}
                            {folders.map(folder => {
                                const folderReqs = requirements.filter(r => r.folderId === folder.id);
                                return (
                                    <div key={folder.id} className="group relative">
                                        <button
                                            onClick={() => setSelectedFolderId(folder.id)}
                                            className={cn(
                                                "flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors text-left rounded-sm",
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
                                                {folderReqs.length}
                                            </span>
                                        </button>
                                        <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-none">
                                                        <MoreHorizontal className="h-3 w-3" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-none">
                                                    <DropdownMenuItem>
                                                        <Pencil className="h-3.5 w-3.5 mr-2" />
                                                        Rename
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => handleDeleteFolder(folder.id)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                                                        Delete Folder
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Add folder button */}
                            <button
                                onClick={() => setCreateFolderOpen(true)}
                                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors text-left rounded-sm"
                            >
                                <FolderPlus className="h-4 w-4 shrink-0" />
                                <span className="truncate">New Folder</span>
                            </button>
                        </div>
                    </div>

                    {/* Document content */}
                    <div className="flex-1 min-w-0 flex flex-col">
                        {/* Breadcrumb / folder header */}
                        <div className="flex items-center justify-between gap-3 px-6 py-3 border-b bg-muted/20">
                            <div className="flex items-center gap-2 text-sm min-w-0">
                                <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground">Documents</span>
                                <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                                {currentFolder ? (
                                    <span className="font-medium flex items-center gap-1.5 truncate">
                                        <div
                                            className="h-2.5 w-2.5 rounded-full shrink-0"
                                            style={{ backgroundColor: currentFolder.color || "#64748B" }}
                                        />
                                        {currentFolder.name}
                                    </span>
                                ) : (
                                    <span className="font-medium truncate">Uncategorized</span>
                                )}
                                <Badge variant="secondary" className="rounded-none text-[10px] px-1.5 py-0 ml-1 shrink-0">
                                    {currentFolderRequirements.length}
                                </Badge>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-none h-7 text-xs gap-1.5 shrink-0"
                                onClick={() => setCreateRequirementOpen(true)}
                            >
                                <Plus className="h-3 w-3" />
                                Add Requirement
                            </Button>
                        </div>

                        {/* Requirements list */}
                        {currentFolderRequirements.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                                <FileText className="h-8 w-8 text-muted-foreground/40" />
                                <div>
                                    <p className="text-sm font-medium">
                                        {currentFolder ? `No requirements in "${currentFolder.name}"` : "No uncategorized requirements"}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Create requirements that your mentees need to submit.
                                    </p>
                                </div>
                                <Button onClick={() => setCreateRequirementOpen(true)} className="rounded-none gap-2" size="sm">
                                    <Plus className="h-4 w-4" />
                                    Create Requirement
                                </Button>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {currentFolderRequirements.map(req => (
                                    <RequirementRow key={req.id} requirement={req} menteeCount={mentees.length} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === "submissions" && (
                <SubmissionReviewPanel submissions={submissions} />
            )}

            <AddMenteeDialog open={addMenteeOpen} onOpenChange={setAddMenteeOpen} />
            <CreateRequirementDialog
                open={createRequirementOpen}
                onOpenChange={setCreateRequirementOpen}
                folders={folders}
                defaultFolderId={selectedFolderId}
            />
            <CreateFolderDialog open={createFolderOpen} onOpenChange={setCreateFolderOpen} />
            <MenteeProfileDialog
                open={selectedProfileMenteeId !== null}
                onOpenChange={(open) => {
                    if (!open) setSelectedProfileMenteeId(null);
                }}
                mentee={selectedProfileMentee}
            />
            <MenteeDocumentsDialog
                open={selectedMenteeId !== null}
                onOpenChange={(open) => {
                    if (!open) setSelectedMenteeId(null);
                }}
                mentee={selectedMentee}
                folders={folders}
                requirements={requirements}
                submissions={selectedMenteeSubmissions}
            />
        </div>
    );
}

function MenteeRow({
    mentorship,
    onViewProfile,
    onViewDocuments,
}: {
    mentorship: any;
    onViewProfile: () => void;
    onViewDocuments: () => void;
}) {
    const mentee = mentorship.mentee;
    const initials = mentee?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

    return (
        <div className="group flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
            <Avatar className="h-9 w-9 shrink-0 border border-border">
                <AvatarImage src={mentee?.avatar || undefined} alt={mentee?.name || "Mentee"} />
                <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{mentee?.name || "Unknown"}</p>
                <p className="text-xs text-muted-foreground truncate">{mentee?.email}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                {mentee?.studentId && (
                    <Badge variant="outline" className="rounded-none text-xs">{mentee.studentId}</Badge>
                )}
                {mentee?.semester && (
                    <Badge variant="secondary" className="rounded-none text-xs">{mentee.semester}</Badge>
                )}
                <Badge
                    variant={mentorship.status === "ACTIVE" ? "default" : "secondary"}
                    className={cn("rounded-none text-xs", mentorship.status === "ACTIVE" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20")}
                >
                    {mentorship.status}
                </Badge>
            </div>

            <span className="text-xs text-muted-foreground shrink-0 hidden md:block">
                {new Date(mentorship.createdAt).toLocaleDateString()}
            </span>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-none h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-none">
                    <DropdownMenuItem onClick={onViewProfile}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onViewDocuments}>
                        <FileText className="h-4 w-4 mr-2" />
                        View Documents
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />Remove Mentee
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

function RequirementRow({ requirement, menteeCount }: { requirement: any; menteeCount: number }) {
    const submissionCount = requirement._count?.submissions || 0;
    const progress = menteeCount > 0 ? Math.round((submissionCount / menteeCount) * 100) : 0;
    const isOverdue = requirement.dueDate && new Date(requirement.dueDate) < new Date();

    return (
        <div className="group flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
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
                        <Badge
                            variant="secondary"
                            className="rounded-none text-[10px] px-1.5 py-0 gap-1"
                        >
                            <div
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: requirement.folder.color || "#64748B" }}
                            />
                            {requirement.folder.name}
                        </Badge>
                    )}
                </div>
                {requirement.description && (
                    <p className="text-xs text-muted-foreground truncate">{requirement.description}</p>
                )}
            </div>

            <div className="flex items-center gap-4 shrink-0">
                {requirement.dueDate && (
                    <span className={cn("text-xs flex items-center gap-1", isOverdue ? "text-destructive" : "text-muted-foreground")}>
                        <Clock className="h-3 w-3" />
                        {isOverdue ? "Overdue" : new Date(requirement.dueDate).toLocaleDateString()}
                    </span>
                )}
                <div className="w-24 space-y-1 hidden md:block">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Submissions</span>
                        <span>{submissionCount}/{menteeCount}</span>
                    </div>
                    <Progress value={progress} className="h-1" />
                </div>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-none h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-none">
                    <DropdownMenuItem>Edit Requirement</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

function MenteeDocumentsDialog({
    open,
    onOpenChange,
    mentee,
    folders,
    requirements,
    submissions,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mentee: MenteeUser | null;
    folders: DocumentFolder[];
    requirements: DocumentRequirement[];
    submissions: DocumentSubmission[];
}) {
    const getSubmission = (requirementId: string) =>
        submissions.find((submission) => submission.requirementId === requirementId);

    const getStatus = (submission?: DocumentSubmission) => {
        if (!submission) {
            return { label: "Not Submitted", icon: FileText, color: "text-muted-foreground" };
        }
        switch (submission.status) {
            case "APPROVED":
                return { label: "Approved", icon: CheckCircle2, color: "text-emerald-600" };
            case "REJECTED":
                return { label: "Rejected", icon: XCircle, color: "text-destructive" };
            case "REVISION_REQUESTED":
                return { label: "Revision Needed", icon: RefreshCw, color: "text-amber-600" };
            default:
                return { label: "Pending Review", icon: Clock, color: "text-amber-600" };
        }
    };

    const uncategorizedRequirements = requirements.filter((requirement) => !requirement.folderId);
    const sections = [
        {
            id: "uncategorized",
            name: "Uncategorized",
            color: "#64748B",
            requirements: uncategorizedRequirements,
        },
        ...folders.map((folder) => ({
            id: folder.id,
            name: folder.name,
            color: folder.color || "#64748B",
            requirements: requirements.filter((requirement) => requirement.folderId === folder.id),
        })),
    ].filter((section) => section.requirements.length > 0);

    const totalSubmitted = requirements.filter((requirement) => getSubmission(requirement.id)).length;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-hidden rounded-none p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b border-border">
                    <DialogTitle className="text-base">
                        {mentee?.name || "Mentee"} - Documents
                    </DialogTitle>
                    <DialogDescription>
                        {totalSubmitted}/{requirements.length} requirements submitted
                    </DialogDescription>
                </DialogHeader>

                <div className="overflow-y-auto">
                    {sections.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                            <FileText className="h-8 w-8 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">No document requirements yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {sections.map((section) => (
                                <div key={section.id}>
                                    <div className="flex items-center gap-2 px-6 py-2.5 border-b border-border bg-muted/20 text-sm">
                                        <span
                                            className="h-2 w-2 rounded-full shrink-0 inline-block"
                                            style={{ backgroundColor: section.color }}
                                        />
                                        <span className="font-medium">{section.name}</span>
                                        <Badge variant="secondary" className="rounded-none text-[10px] px-1.5 py-0 h-4 ml-1">
                                            {section.requirements.filter((requirement) => getSubmission(requirement.id)).length}/{section.requirements.length}
                                        </Badge>
                                    </div>

                                    <div className="divide-y divide-border">
                                        {section.requirements.map((requirement) => {
                                            const submission = getSubmission(requirement.id);
                                            const status = getStatus(submission);
                                            const StatusIcon = status.icon;

                                            return (
                                                <div key={requirement.id} className="flex items-start gap-4 px-6 py-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="text-sm font-medium">{requirement.title}</p>
                                                            {requirement.isRequired && (
                                                                <Badge variant="destructive" className="rounded-none text-[10px] px-1.5 py-0">
                                                                    Required
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {requirement.description && (
                                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{requirement.description}</p>
                                                        )}
                                                        <div className={cn("text-xs flex items-center gap-1 mt-1.5", status.color)}>
                                                            <StatusIcon className="h-3 w-3" />
                                                            {status.label}
                                                        </div>
                                                    </div>

                                                    {submission && (
                                                        <Button variant="outline" size="sm" className="rounded-none h-7 text-xs gap-1.5 shrink-0" asChild>
                                                            <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">
                                                                <ExternalLink className="h-3 w-3" />
                                                                View
                                                            </a>
                                                        </Button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function MenteeProfileDialog({
    open,
    onOpenChange,
    mentee,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mentee: MenteeUser | null;
}) {
    const initials = mentee?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-none">
                <DialogHeader>
                    <DialogTitle>Mentee Profile</DialogTitle>
                    <DialogDescription>Basic student details</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border border-border">
                            <AvatarImage src={mentee?.avatar || undefined} alt={mentee?.name || "Mentee"} />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="font-medium truncate">{mentee?.name || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground truncate">{mentee?.email || "-"}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="rounded-sm border border-border p-2">
                            <p className="text-xs text-muted-foreground">Student ID</p>
                            <p className="font-medium">{mentee?.studentId || "-"}</p>
                        </div>
                        <div className="rounded-sm border border-border p-2">
                            <p className="text-xs text-muted-foreground">Semester</p>
                            <p className="font-medium">{mentee?.semester || "-"}</p>
                        </div>
                        <div className="rounded-sm border border-border p-2 col-span-2">
                            <p className="text-xs text-muted-foreground">Grade</p>
                            <p className="font-medium">{mentee?.grade || "-"}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
