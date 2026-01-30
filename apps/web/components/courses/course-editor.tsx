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
    Check
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
import { ArrowLeft } from "lucide-react";
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

    // Course details state
    const [title, setTitle] = useState(course.title);
    const [description, setDescription] = useState(course.description || "");
    const [imageUrl, setImageUrl] = useState(course.imageUrl || "");
    const [isPublished, setIsPublished] = useState(course.isPublished);
    const [savingDetails, setSavingDetails] = useState(false);
    const [detailsSaved, setDetailsSaved] = useState(false);

    // Chapter state
    const [chapters, setChapters] = useState(course.chapters);
    const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);

    useEffect(() => {
        setChapters(course.chapters);
    }, [course.chapters]);

    const [newChapterTitle, setNewChapterTitle] = useState("");
    const [creatingChapter, setCreatingChapter] = useState(false);
    const [showNewChapterInput, setShowNewChapterInput] = useState(false);

    const hasChanges = title !== course.title ||
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
            const newChapters = arrayMove(chapters, oldIndex, newIndex);
            handleReorder(newChapters);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 pb-20 space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <Link
                        href="/dashboard/courses"
                        className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Courses
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your course content and settings
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge
                        variant={isPublished ? "default" : "secondary"}
                        className={cn(
                            "px-3 py-1",
                            isPublished && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        )}
                    >
                        {isPublished ? "Published" : "Draft"}
                    </Badge>
                </div>
            </div>

            {/* Course Details Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    <Settings2 className="h-4 w-4" />
                    Course Details
                </div>

                <div className="rounded-xl border bg-card p-1">
                    <div className="grid gap-4 p-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Course title"
                                className="bg-background"
                            />
                        </div>

                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what students will learn..."
                            rows={3}
                            className="bg-background resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Course Image</label>
                        <div className="flex items-start gap-4">
                            {imageUrl && (
                                <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-md border bg-muted">
                                    <img
                                        src={imageUrl}
                                        alt="Course"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="flex-1 space-y-2">
                                <Input
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="bg-background"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter an image URL for your course cover.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between py-2 px-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                            {isPublished ? (
                                <Eye className="h-4 w-4 text-emerald-500" />
                            ) : (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                            )}
                            <div>
                                <p className="text-sm font-medium">Published</p>
                                <p className="text-xs text-muted-foreground">
                                    {isPublished ? "Students can see this course" : "Only you can see this course"}
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={isPublished}
                            onCheckedChange={setIsPublished}
                        />
                    </div>
                </div>

                {hasChanges && (
                    <div className="border-t px-5 py-3 bg-muted/30 rounded-b-xl flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">You have unsaved changes</p>
                        <Button
                            onClick={handleSaveDetails}
                            disabled={savingDetails}
                            size="sm"
                        >
                            {savingDetails ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : detailsSaved ? (
                                <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Saved
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </section>

            {/* Chapters Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        <Video className="h-4 w-4" />
                        Chapters ({chapters.length})
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNewChapterInput(true)}
                        className="text-primary"
                    >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Chapter
                    </Button>
                </div>

                <div className="rounded-xl border bg-card overflow-hidden">
                    {showNewChapterInput && (
                        <div className="p-4 border-b bg-muted/30 flex items-center gap-3">
                            <Input
                                value={newChapterTitle}
                                onChange={(e) => setNewChapterTitle(e.target.value)}
                                placeholder="Chapter title..."
                                className="flex-1 bg-background"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleCreateChapter();
                                    if (e.key === "Escape") {
                                        setShowNewChapterInput(false);
                                        setNewChapterTitle("");
                                    }
                                }}
                            />
                            <Button
                                onClick={handleCreateChapter}
                                disabled={creatingChapter || !newChapterTitle.trim()}
                                size="sm"
                            >
                                {creatingChapter ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Create"
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setShowNewChapterInput(false);
                                    setNewChapterTitle("");
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    )}

                    {chapters.length === 0 ? (
                        <div className="p-8 text-center">
                            <Video className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                            <p className="text-muted-foreground">No chapters yet</p>
                            <p className="text-sm text-muted-foreground/70 mt-1">
                                Add your first chapter to get started
                            </p>
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={chapters.map(c => c.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="divide-y">
                                    {chapters.map((chapter, index) => (
                                        <ChapterRow
                                            key={chapter.id}
                                            chapter={chapter}
                                            index={index}
                                            courseId={course.id}
                                            isExpanded={expandedChapterId === chapter.id}
                                            onToggleExpand={() => setExpandedChapterId(
                                                expandedChapterId === chapter.id ? null : chapter.id
                                            )}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </div>
            </section >
        </div >
    );
}

interface ChapterRowProps {
    chapter: Chapter & {
        reflectionPoints: ReflectionPoint[];
    };
    index: number;
    courseId: string;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

function ChapterRow({ chapter, index, courseId, isExpanded, onToggleExpand }: ChapterRowProps) {
    // const router = useRouter(); // Removed unused router
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: chapter.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group bg-card transition-colors hover:bg-muted/30",
                isExpanded ? "flex flex-col" : "flex items-center gap-3 px-4 py-3",
                isDragging && "opacity-50 bg-muted shadow-lg z-50"
            )}
        >
            <div className={cn("flex items-center gap-3 w-full", isExpanded && "px-4 py-3")}>
                <button
                    {...attributes}
                    {...listeners}
                    className="p-1 rounded hover:bg-muted cursor-grab active:cursor-grabbing text-muted-foreground shrink-0"
                >
                    <GripVertical className="h-4 w-4" />
                </button>

                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium shrink-0">
                    {index + 1}
                </span>

                <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{chapter.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        {chapter.isFree && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
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
                        "text-xs shrink-0",
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
                        "transition-all",
                        !isExpanded && "opacity-0 group-hover:opacity-100"
                    )}
                >
                    {isExpanded ? (
                        "Close"
                    ) : (
                        <>
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                        </>
                    )}
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
