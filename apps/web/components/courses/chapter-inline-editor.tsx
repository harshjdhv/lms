"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Trash2, Eye, EyeOff, Video, Settings2, Gift, Save, AlertCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Chapter } from "@workspace/database";

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
    initialData: Chapter;
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

            // Generate and cache transcript
            if (values.videoUrl?.trim() && values.videoUrl !== initialData.videoUrl) {
                fetch("/api/reflection/transcript", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ chapterId }),
                }).catch(() => { });
            }

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

