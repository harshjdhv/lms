"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Trash2, Eye, EyeOff, Gift, AlertCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Chapter, ReflectionPoint } from "@workspace/database";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Switch } from "@workspace/ui/components/switch";
import { cn } from "@workspace/ui/lib/utils";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    videoUrl: z.string().optional(),
    isFree: z.boolean(),
    isPublished: z.boolean(),
});

type ChapterFormValues = z.infer<typeof formSchema>;

interface ChapterInlineEditorProps {
    initialData: Chapter & {
        reflectionPoints?: ReflectionPoint[];
    };
    courseId: string;
    chapterId: string;
    onCancel: () => void;
    onSaveSuccess: () => void;
}

export function ChapterInlineEditor({
    initialData,
    courseId,
    chapterId,
    onCancel,
    onSaveSuccess
}: ChapterInlineEditorProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const form = useForm<ChapterFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: initialData.title,
            description: initialData.description || "",
            videoUrl: initialData.videoUrl || "",
            isFree: !!initialData.isFree,
            isPublished: !!initialData.isPublished,
        },
    });

    const { watch, setValue, formState } = form;
    const watchedValues = watch();
    const { isDirty, isValid, errors } = formState;

    const onSubmit = async (values: ChapterFormValues) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/courses/${courseId}/chapters/${chapterId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!response.ok) throw new Error("Something went wrong");

            toast.success("Chapter updated");

            form.reset(values);
            startTransition(() => {
                router.refresh();
                onSaveSuccess();
            });
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const onDelete = async () => {
        try {
            setDeleting(true);
            const response = await fetch(`/api/courses/${courseId}/chapters/${chapterId}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Something went wrong");

            toast.success("Chapter deleted");
            startTransition(() => {
                router.refresh();
                onCancel(); // Close current editor
            });
        } catch {
            toast.error("Something went wrong");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="border-t bg-muted/30 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input
                                {...form.register("title")}
                                placeholder="Chapter title"
                                className="bg-background"
                            />
                            {errors.title && (
                                <p className="text-xs text-destructive flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.title.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                {...form.register("description")}
                                placeholder="What will students learn?"
                                rows={3}
                                className="bg-background resize-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Video URL</label>
                            <Input
                                {...form.register("videoUrl")}
                                placeholder="https://youtube.com/..."
                                className="bg-background"
                            />
                        </div>

                        {/* AI / Reflection Resources */}
                        <div className="space-y-4 pt-4 border-t">
                            {/* Transcript Section */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="text-xs font-medium uppercase text-muted-foreground">Transcript</div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs"
                                        disabled={loading || !watchedValues.videoUrl}
                                        onClick={() => {
                                            const url = form.getValues("videoUrl");
                                            if (!url) return;
                                            toast.promise(
                                                fetch("/api/reflection/transcript", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ chapterId }),
                                                }).then(async (r) => {
                                                    const data = await r.json();
                                                    if (!r.ok) throw new Error(data.message || "Failed");
                                                    if (data.status === "processing") return "Processing transcript...";
                                                    startTransition(() => {
                                                        router.refresh();
                                                    });
                                                    return `Success! ${data.segmentsCount} segments.`;
                                                }),
                                                {
                                                    loading: "Fetching transcript...",
                                                    success: (msg) => msg,
                                                    error: (err) => `Error: ${err.message}`,
                                                }
                                            );
                                        }}
                                    >
                                        {initialData.transcriptJson ? "Refresh" : "Generate"}
                                    </Button>
                                </div>
                                {initialData.transcriptJson && (
                                    <div className="text-xs font-mono bg-background p-2 rounded border h-20 overflow-y-auto text-muted-foreground">
                                        {(initialData.transcriptJson as any[]).slice(0, 3).map((s: any, i) => (
                                            <div key={i}>[{Math.floor(s.start)}s] {s.text}</div>
                                        ))}
                                        <div className="mt-1 text-center italic opacity-50">
                                            {(initialData.transcriptJson as any[]).length} segments total
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Reflection Points Section */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="text-xs font-medium uppercase text-muted-foreground">Reflection Points</div>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        className="h-7 text-xs"
                                        disabled={loading || !initialData.transcriptJson}
                                        onClick={() => {
                                            toast.promise(
                                                fetch("/api/reflection/points/generate", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ chapterId }),
                                                }).then(async (r) => {
                                                    const data = await r.json();
                                                    if (!r.ok) throw new Error(data.error || "Failed");
                                                    startTransition(() => {
                                                        router.refresh();
                                                    });
                                                    return `Generated ${data.count} points.`;
                                                }),
                                                {
                                                    loading: "Generating points...",
                                                    success: (msg) => msg,
                                                    error: (err) => `Error: ${err.message}`,
                                                }
                                            );
                                        }}
                                    >
                                        Auto-Generate
                                    </Button>
                                </div>

                                {/* Points List */}
                                {initialData.reflectionPoints && initialData.reflectionPoints.length > 0 ? (
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                        {initialData.reflectionPoints.map((p) => (
                                            <div key={p.id} className="text-xs flex items-center justify-between p-1.5 bg-background rounded border">
                                                <span className="font-mono bg-muted px-1 rounded mr-2">
                                                    {Math.floor(p.time / 60)}:{(Math.floor(p.time % 60)).toString().padStart(2, '0')}
                                                </span>
                                                <span className="truncate flex-1 opacity-80">{p.topic}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    initialData.transcriptJson && (
                                        <div className="text-xs text-muted-foreground italic text-center py-2">
                                            No points yet. Auto-generate or add valid times.
                                        </div>
                                    )
                                )}

                                {/* Manual Add Input */}
                                <div className="flex gap-2 pt-1">
                                    <Input
                                        placeholder="mm:ss"
                                        className="w-16 h-7 text-xs px-2"
                                        id={`manual-time-${chapterId}`}
                                    />
                                    <Input
                                        placeholder="Topic"
                                        className="flex-1 h-7 text-xs px-2"
                                        id={`manual-topic-${chapterId}`}
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="h-7 text-xs px-2"
                                        onClick={() => {
                                            const timeInput = document.getElementById(`manual-time-${chapterId}`) as HTMLInputElement;
                                            const topicInput = document.getElementById(`manual-topic-${chapterId}`) as HTMLInputElement;
                                            const timeStr = timeInput.value;
                                            const topic = topicInput.value;

                                            if (!timeStr.includes(":") || !topic) {
                                                toast.error("Format: mm:ss and topic required");
                                                return;
                                            }
                                            const parts = timeStr.split(":").map(Number);
                                            if (parts.length !== 2) {
                                                toast.error("Format: mm:ss");
                                                return;
                                            }
                                            const m = parts[0];
                                            const s = parts[1];
                                            if (m === undefined || s === undefined) return;
                                            const time = m * 60 + s;

                                            if (isNaN(time)) {
                                                toast.error("Invalid time");
                                                return;
                                            }

                                            toast.promise(
                                                fetch("/api/courses/" + courseId + "/chapters/" + chapterId + "/reflection-points", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ time, topic }),
                                                }).then(async (r) => {
                                                    if (!r.ok) throw new Error("Failed");
                                                    startTransition(() => {
                                                        router.refresh();
                                                    });
                                                }),
                                                {
                                                    loading: "Adding...",
                                                    success: "Added",
                                                    error: "Failed"
                                                }
                                            );

                                            timeInput.value = "";
                                            topicInput.value = "";
                                        }}
                                    >
                                        Add
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-background rounded-lg border p-3 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Gift className={cn(
                                        "h-4 w-4",
                                        watchedValues.isFree ? "text-amber-500" : "text-muted-foreground"
                                    )} />
                                    <span className="text-sm">Free Preview</span>
                                </div>
                                <Switch
                                    checked={watchedValues.isFree}
                                    onCheckedChange={(checked) => setValue("isFree", checked, { shouldDirty: true })}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {watchedValues.isPublished ? (
                                        <Eye className="h-4 w-4 text-emerald-500" />
                                    ) : (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span className="text-sm">Published</span>
                                </div>
                                <Switch
                                    checked={watchedValues.isPublished}
                                    onCheckedChange={(checked) => setValue("isPublished", checked, { shouldDirty: true })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button type="button" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Chapter
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure? This cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={onDelete}
                                    disabled={deleting}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <div className="flex items-center gap-2">
                        <Button type="button" variant="ghost" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !isValid || !isDirty}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
