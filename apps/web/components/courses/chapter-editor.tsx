"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader2, Trash2, Eye, EyeOff, Video, Settings2, Gift, Save, Check, AlertCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Chapter } from "@workspace/database";
import Link from "next/link";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Switch } from "@workspace/ui/components/switch";
import { Badge } from "@workspace/ui/components/badge";
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

interface ChapterEditorProps {
    initialData: Chapter;
    courseId: string;
    chapterId: string;
}

export function ChapterEditor({
    initialData,
    courseId,
    chapterId,
}: ChapterEditorProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
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

            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
            toast.success("Chapter updated");
            form.reset(values);
            startTransition(() => router.refresh());

            // Generate and cache transcript for quiz questions (fire-and-forget)
            if (values.videoUrl?.trim()) {
                fetch("/api/reflection/transcript", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ chapterId }),
                }).then((r) => {
                    if (r.ok) toast.success("Transcript cached for quizzes");
                }).catch(() => { });
            }
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
            router.push(`/dashboard/courses/${courseId}`);
            router.refresh();
        } catch {
            toast.error("Something went wrong");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto p-6 pb-24 space-y-6">
            {/* Header */}
            <div className="space-y-4">
                <Link
                    href={`/dashboard/courses/${courseId}`}
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to course
                </Link>

                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Edit Chapter</h1>
                        <p className="text-muted-foreground mt-1">
                            Configure chapter content and settings
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant={watchedValues.isPublished ? "default" : "secondary"}
                            className={cn(
                                "px-3 py-1",
                                watchedValues.isPublished && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            )}
                        >
                            {watchedValues.isPublished ? "Published" : "Draft"}
                        </Badge>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete this chapter? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={onDelete}
                                        disabled={deleting}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        {deleting ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            "Delete"
                                        )}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Title & Description */}
                <section className="rounded-xl border bg-card p-1">
                    <div className="flex items-center gap-2 px-5 pt-4 text-sm font-medium text-muted-foreground">
                        <Settings2 className="h-4 w-4" />
                        Chapter Details
                    </div>
                    <div className="grid gap-4 p-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input
                                {...form.register("title")}
                                placeholder="e.g. Introduction to the course"
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
                                placeholder="What will students learn in this chapter?"
                                rows={3}
                                className="bg-background resize-none"
                            />
                        </div>
                    </div>
                </section>

                {/* Video */}
                <section className="rounded-xl border bg-card p-1">
                    <div className="flex items-center gap-2 px-5 pt-4 text-sm font-medium text-muted-foreground">
                        <Video className="h-4 w-4" />
                        Video Content
                    </div>
                    <div className="p-5 space-y-2">
                        <label className="text-sm font-medium">Video URL</label>
                        <Input
                            {...form.register("videoUrl")}
                            placeholder="https://youtube.com/watch?v=..."
                            className="bg-background"
                        />
                        <p className="text-xs text-muted-foreground">
                            Paste a YouTube, Vimeo, or other video URL
                        </p>
                    </div>
                </section>

                {/* Access & Visibility */}
                <section className="rounded-xl border bg-card overflow-hidden">
                    <div className="flex items-center gap-2 px-5 pt-4 text-sm font-medium text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        Access & Visibility
                    </div>
                    <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                            <div className="flex items-center gap-3">
                                <Gift className={cn(
                                    "h-4 w-4",
                                    watchedValues.isFree ? "text-amber-500" : "text-muted-foreground"
                                )} />
                                <div>
                                    <p className="text-sm font-medium">Free Preview</p>
                                    <p className="text-xs text-muted-foreground">
                                        Allow non-enrolled students to view this chapter
                                    </p>
                                </div>
                            </div>
                            <Switch
                                checked={watchedValues.isFree}
                                onCheckedChange={(checked) => setValue("isFree", checked, { shouldDirty: true })}
                            />
                        </div>

                        <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                            <div className="flex items-center gap-3">
                                {watchedValues.isPublished ? (
                                    <Eye className="h-4 w-4 text-emerald-500" />
                                ) : (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                )}
                                <div>
                                    <p className="text-sm font-medium">Published</p>
                                    <p className="text-xs text-muted-foreground">
                                        {watchedValues.isPublished
                                            ? "This chapter is visible to students"
                                            : "This chapter is hidden from students"
                                        }
                                    </p>
                                </div>
                            </div>
                            <Switch
                                checked={watchedValues.isPublished}
                                onCheckedChange={(checked) => setValue("isPublished", checked, { shouldDirty: true })}
                            />
                        </div>
                    </div>
                </section>

                {/* Save Button - Fixed at bottom */}
                {isDirty && (
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t z-50">
                        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                            <p className="text-sm text-muted-foreground">
                                You have unsaved changes
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => form.reset()}
                                    disabled={loading}
                                >
                                    Discard
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading || !isValid}
                                >
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : saved ? (
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
                        </div>
                    </div>
                )}

                {/* Non-sticky save for when no changes */}
                {!isDirty && (
                    <Button
                        type="submit"
                        disabled={true}
                        className="w-full"
                        size="lg"
                    >
                        <Check className="h-4 w-4 mr-2" />
                        All changes saved
                    </Button>
                )}
            </form>
        </div>
    );
}
