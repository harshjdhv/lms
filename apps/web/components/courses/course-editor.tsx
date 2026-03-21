"use client";

import { useState, useTransition, useEffect } from "react";
import { Chapter, Course, ReflectionPoint } from "@workspace/database";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Badge } from "@workspace/ui/components/badge";
import { Switch } from "@workspace/ui/components/switch";
import {
    PlusCircle,
    Loader2,
    GripVertical,
    Pencil,
    Eye,
    EyeOff,
    Video,
    Settings2,
    Save,
    Check,
    ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@workspace/ui/lib/utils";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChapterInlineEditor } from "./chapter-inline-editor";
import Link from "next/link";

interface CourseEditorProps {
    course: Course & {
        chapters: (Chapter & {
            reflectionPoints: ReflectionPoint[]
        })[];
    };
}

export function CourseEditor({ course }: CourseEditorProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [title, setTitle] = useState(course.title);
    const [description, setDescription] = useState(course.description || "");
    const [imageUrl, setImageUrl] = useState(course.imageUrl || "");
    const [isPublished, setIsPublished] = useState(course.isPublished);
    const [savingDetails, setSavingDetails] = useState(false);
    const [detailsSaved, setDetailsSaved] = useState(false);

    const [chapters, setChapters] = useState(course.chapters);
    const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);

    useEffect(() => {
        setChapters(course.chapters);
    }, [course.chapters]);

    const [newChapterTitle, setNewChapterTitle] = useState("");
    const [creatingChapter, setCreatingChapter] = useState(false);
    const [showNewChapterInput, setShowNewChapterInput] = useState(false);

    const hasChanges =
        title !== course.title ||
        description !== (course.description || "") ||
        imageUrl !== (course.imageUrl || "") ||
        isPublished !== course.isPublished;

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleSaveDetails = async () => {
        try {
            setSavingDetails(true);
            const res = await fetch(`/api/courses/${course.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description, isPublished, imageUrl }),
            });
            if (!res.ok) throw new Error("Failed to update");
            setDetailsSaved(true);
            setTimeout(() => setDetailsSaved(false), 2000);
            toast.success("Course updated");
            startTransition(() => router.refresh());
        } catch {
            toast.error("Failed to update course");
        } finally {
            setSavingDetails(false);
        }
    };

    const handleCreateChapter = async () => {
        if (!newChapterTitle.trim()) return;
        try {
            setCreatingChapter(true);
            const res = await fetch(`/api/courses/${course.id}/chapters`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newChapterTitle }),
            });
            if (!res.ok) throw new Error("Failed to create");
            const newChapter = await res.json();
            setChapters((prev) => [...prev, { ...newChapter, reflectionPoints: [] }]);
            setNewChapterTitle("");
            setShowNewChapterInput(false);
            toast.success("Chapter created");
            startTransition(() => router.refresh());
        } catch {
            toast.error("Failed to create chapter");
        } finally {
            setCreatingChapter(false);
        }
    };

    const handleReorder = async (newChapters: (Chapter & { reflectionPoints: ReflectionPoint[] })[]) => {
        setChapters(newChapters);
        const bulkUpdateData = newChapters.map((chapter, index) => ({
            id: chapter.id,
            position: index + 1,
        }));
        try {
            await fetch(`/api/courses/${course.id}/chapters/reorder`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ list: bulkUpdateData }),
            });
            toast.success("Chapters reordered");
        } catch {
            toast.error("Failed to reorder");
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = chapters.findIndex((c) => c.id === active.id);
            const newIndex = chapters.findIndex((c) => c.id === over?.id);
            handleReorder(arrayMove(chapters, oldIndex, newIndex));
        }
    };

    return (
        <div className="flex w-full min-w-0 flex-col overflow-x-hidden animate-in fade-in-50 duration-500">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 border-b bg-background px-6 py-5 lg:flex-row lg:items-center">
                <div className="min-w-0 space-y-1">
                    <Link
                        href="/dashboard/courses/my"
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit mb-1"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        My Courses
                    </Link>
                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl truncate">{course.title}</h1>
                    <p className="text-sm text-muted-foreground">Manage your course content and settings</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <Badge
                        variant={isPublished ? "default" : "secondary"}
                        className={cn(
                            "rounded-none px-3 py-1",
                            isPublished && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        )}
                    >
                        {isPublished ? "Published" : "Draft"}
                    </Badge>
                    {hasChanges && (
                        <Button
                            onClick={handleSaveDetails}
                            disabled={savingDetails}
                            size="sm"
                            className="rounded-none gap-2"
                        >
                            {savingDetails ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : detailsSaved ? (
                                <><Check className="h-4 w-4" />Saved</>
                            ) : (
                                <><Save className="h-4 w-4" />Save Changes</>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Content — two columns */}
            <div className="grid grid-cols-1 xl:grid-cols-3 divide-y xl:divide-y-0 xl:divide-x divide-border">

                {/* Left Column — Course Settings */}
                <div className="min-w-0 divide-y divide-border">
                    {/* Section label */}
                    <div className="flex items-center gap-2 px-6 py-3 bg-muted/30 border-b">
                        <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Course Details</span>
                    </div>

                    {/* Title */}
                    <div className="px-6 py-4 space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Course title"
                            className="rounded-none"
                        />
                    </div>

                    {/* Description */}
                    <div className="px-6 py-4 space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what students will learn..."
                            rows={4}
                            className="rounded-none resize-none"
                        />
                    </div>

                    {/* Cover Image */}
                    <div className="px-6 py-4 space-y-2">
                        <label className="text-sm font-medium">Cover Image</label>
                        {imageUrl && (
                            <div className="relative aspect-video w-full overflow-hidden border border-border">
                                <img src={imageUrl} alt="Course" className="h-full w-full object-cover" />
                            </div>
                        )}
                        <Input
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://..."
                            className="rounded-none"
                        />
                        <p className="text-xs text-muted-foreground">Enter an image URL for your course cover.</p>
                    </div>

                    {/* Publish toggle */}
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                            {isPublished
                                ? <Eye className="h-4 w-4 text-emerald-500" />
                                : <EyeOff className="h-4 w-4 text-muted-foreground" />
                            }
                            <div>
                                <p className="text-sm font-medium">Published</p>
                                <p className="text-xs text-muted-foreground">
                                    {isPublished ? "Students can see this course" : "Only you can see this course"}
                                </p>
                            </div>
                        </div>
                        <Switch checked={isPublished} onCheckedChange={setIsPublished} />
                    </div>

                    {/* Unsaved changes banner */}
                    {hasChanges && (
                        <div className="flex items-center justify-between px-6 py-3 border-l-2 border-l-amber-500 bg-amber-500/5">
                            <p className="text-xs text-amber-600">You have unsaved changes</p>
                            <Button
                                onClick={handleSaveDetails}
                                disabled={savingDetails}
                                size="sm"
                                className="rounded-none h-7 text-xs gap-1.5"
                            >
                                {savingDetails ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : detailsSaved ? (
                                    <><Check className="h-3 w-3" />Saved</>
                                ) : (
                                    <><Save className="h-3 w-3" />Save</>
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Right Column — Chapters */}
                <div className="min-w-0 xl:col-span-2 divide-y divide-border">
                    {/* Section label + add button */}
                    <div className="flex items-center justify-between px-6 py-3 bg-muted/30 border-b">
                        <div className="flex items-center gap-2">
                            <Video className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Chapters ({chapters.length})
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowNewChapterInput(true)}
                            className="rounded-none h-7 text-xs gap-1.5 text-primary"
                        >
                            <PlusCircle className="h-3.5 w-3.5" />
                            Add Chapter
                        </Button>
                    </div>

                    {/* New chapter input */}
                    {showNewChapterInput && (
                        <div className="flex items-center gap-3 px-6 py-3 bg-muted/20">
                            <Input
                                value={newChapterTitle}
                                onChange={(e) => setNewChapterTitle(e.target.value)}
                                placeholder="Chapter title..."
                                className="flex-1 rounded-none"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleCreateChapter();
                                    if (e.key === "Escape") { setShowNewChapterInput(false); setNewChapterTitle(""); }
                                }}
                            />
                            <Button
                                onClick={handleCreateChapter}
                                disabled={creatingChapter || !newChapterTitle.trim()}
                                size="sm"
                                className="rounded-none"
                            >
                                {creatingChapter ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setShowNewChapterInput(false); setNewChapterTitle(""); }}
                                className="rounded-none"
                            >
                                Cancel
                            </Button>
                        </div>
                    )}

                    {/* Chapters list */}
                    {chapters.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-16 text-center gap-2">
                            <Video className="h-8 w-8 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">No chapters yet</p>
                            <p className="text-xs text-muted-foreground/70">Add your first chapter to get started</p>
                        </div>
                    ) : (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={chapters.map(c => c.id)} strategy={verticalListSortingStrategy}>
                                <div className="divide-y divide-border">
                                    {chapters.map((chapter, index) => (
                                        <ChapterRow
                                            key={chapter.id}
                                            chapter={chapter}
                                            index={index}
                                            courseId={course.id}
                                            isExpanded={expandedChapterId === chapter.id}
                                            onToggleExpand={() =>
                                                setExpandedChapterId(expandedChapterId === chapter.id ? null : chapter.id)
                                            }
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </div>
            </div>
        </div>
    );
}

interface ChapterRowProps {
    chapter: Chapter & { reflectionPoints: ReflectionPoint[] };
    index: number;
    courseId: string;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

function ChapterRow({ chapter, index, courseId, isExpanded, onToggleExpand }: ChapterRowProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: chapter.id });

    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group bg-card transition-colors",
                isExpanded ? "flex flex-col" : "flex items-center gap-3 px-5 py-3 hover:bg-muted/30",
                isDragging && "opacity-50 bg-muted z-50"
            )}
        >
            <div className={cn("flex items-center gap-3 w-full", isExpanded && "px-5 py-3 border-b border-border")}>
                <button
                    {...attributes}
                    {...listeners}
                    className="p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing shrink-0 transition-colors"
                >
                    <GripVertical className="h-4 w-4" />
                </button>

                <span className="flex items-center justify-center w-5 h-5 border border-border text-[10px] font-medium shrink-0 text-muted-foreground">
                    {index + 1}
                </span>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{chapter.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        {chapter.isFree && (
                            <Badge variant="secondary" className="rounded-none text-[10px] px-1.5 py-0">
                                Free
                            </Badge>
                        )}
                        {chapter.videoUrl && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Video className="h-3 w-3" />
                                Video
                            </span>
                        )}
                    </div>
                </div>

                <Badge
                    variant={chapter.isPublished ? "default" : "secondary"}
                    className={cn(
                        "text-xs shrink-0 rounded-none",
                        chapter.isPublished && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    )}
                >
                    {chapter.isPublished ? "Published" : "Draft"}
                </Badge>

                <Button
                    variant={isExpanded ? "secondary" : "ghost"}
                    size="sm"
                    onClick={onToggleExpand}
                    className={cn(
                        "rounded-none transition-all",
                        !isExpanded && "opacity-0 group-hover:opacity-100"
                    )}
                >
                    {isExpanded ? "Close" : <><Pencil className="h-3.5 w-3.5 mr-1" />Edit</>}
                </Button>
            </div>

            {isExpanded && (
                <div className="w-full">
                    <ChapterInlineEditor
                        initialData={chapter}
                        courseId={courseId}
                        chapterId={chapter.id}
                        onCancel={onToggleExpand}
                        onSaveSuccess={onToggleExpand}
                    />
                </div>
            )}
        </div>
    );
}
