"use client";

import { useEffect, useState } from "react";
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
import { GripVertical, Pencil } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { Chapter } from "@workspace/database";

interface ChaptersListProps {
    initialChapters: Chapter[];
    onReorder: (chapters: Chapter[]) => void;
    onEdit: (chapterId: string) => void;
}

export function ChaptersList({
    initialChapters,
    onReorder,
    onEdit,
}: ChaptersListProps) {
    const [chapters, setChapters] = useState(initialChapters);

    useEffect(() => {
        setChapters(initialChapters);
    }, [initialChapters]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setChapters((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);

                const newItems = arrayMove(items, oldIndex, newIndex);
                onReorder(newItems); // Trigger parent update
                return newItems;
            });
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={chapters}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-2">
                    {chapters.map((chapter) => (
                        <SortableChapterItem
                            key={chapter.id}
                            chapter={chapter}
                            onEdit={onEdit}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}

interface SortableChapterItemProps {
    chapter: Chapter;
    onEdit: (id: string) => void;
}

function SortableChapterItem({ chapter, onEdit }: SortableChapterItemProps) {
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
                "flex items-center gap-x-2 bg-background border border-border text-foreground rounded-md mb-2 text-sm p-2",
                isDragging && "opacity-50 z-50 ring-2 ring-primary"
            )}
        >
            <div
                {...attributes}
                {...listeners}
                className={cn(
                    "px-2 py-3 border-r border-border hover:bg-muted/50 rounded-l-md cursor-grab active:cursor-grabbing",
                    isDragging && "cursor-grabbing"
                )}
            >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 font-medium truncate ml-2">{chapter.title}</div>
            <div className="ml-auto w-auto flex items-center gap-x-2 pr-2">
                {chapter.isFree && <Badge variant="secondary">Free</Badge>}
                <Badge className={cn("bg-slate-500", chapter.isPublished && "bg-sky-600")}>
                    {chapter.isPublished ? "Published" : "Draft"}
                </Badge>
                <Button
                    onClick={() => onEdit(chapter.id)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-muted"
                >
                    <Pencil className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
