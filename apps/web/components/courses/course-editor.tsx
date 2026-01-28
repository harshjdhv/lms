"use client";

import { useState } from "react";
import { Chapter, Course } from "@workspace/database";
import { ChaptersList } from "./chapters-list";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card";
import { PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CourseEditorProps {
    course: Course & {
        chapters: Chapter[];
    };
}

export function CourseEditor({ course }: CourseEditorProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [chapters, setChapters] = useState(course.chapters);
    const [newChapterTitle, setNewChapterTitle] = useState("");
    const [creatingChapter, setCreatingChapter] = useState(false);

    // Form states (simplified, ideally use react-hook-form)
    const [title, setTitle] = useState(course.title);
    const [description, setDescription] = useState(course.description || "");

    const onReorder = async (updateData: { id: string; position: number; }[]) => {
        try {
            await fetch(`/api/courses/${course.id}/chapters/reorder`, {
                method: "PUT",
                body: JSON.stringify({ list: updateData }),
            });
            toast.success("Chapters reordered");
            router.refresh();
        } catch {
            toast.error("Something went wrong");
        }
    }

    const handleReorder = (newChapters: Chapter[]) => {
        setChapters(newChapters);
        const bulkUpdateData = newChapters.map((chapter, index) => ({
            id: chapter.id,
            position: index + 1,
        }));
        onReorder(bulkUpdateData);
    };

    const handleCreateChapter = async () => {
        if (!newChapterTitle) return;
        try {
            setCreatingChapter(true);
            const res = await fetch(`/api/courses/${course.id}/chapters`, {
                method: "POST",
                body: JSON.stringify({ title: newChapterTitle }),
            });

            if (!res.ok) throw new Error("Failed to create");

            const newChapter = await res.json();
            setChapters((prev) => [...prev, newChapter]);
            setNewChapterTitle("");
            toast.success("Chapter created");
            router.refresh();
        } catch {
            toast.error("Failed to create chapter");
        } finally {
            setCreatingChapter(false);
        }
    };

    const handleUpdateCourse = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/courses/${course.id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    title,
                    description,
                    isPublished: course.isPublished // For now keep same
                })
            });

            if (!res.ok) throw new Error("Failed to update");

            toast.success("Course details updated");
            router.refresh();
        } catch {
            toast.error("Failed to update course");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Course Details</CardTitle>
                        <CardDescription>Basic information about your course.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                        <Button onClick={handleUpdateCourse} disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save Details
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Course Chapters</CardTitle>
                        <CardDescription>Drag and drop to reorder chapters.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChaptersList
                            initialChapters={chapters}
                            onReorder={handleReorder}
                            onEdit={(id) => {
                                router.push(`/dashboard/courses/${course.id}/chapters/${id}`);
                            }}
                        />

                        <div className="flex items-center gap-2 mt-4">
                            <Input
                                placeholder="New Chapter Title..."
                                value={newChapterTitle}
                                onChange={(e) => setNewChapterTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleCreateChapter();
                                }}
                            />
                            <Button onClick={handleCreateChapter} disabled={creatingChapter || !newChapterTitle}>
                                {creatingChapter ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
