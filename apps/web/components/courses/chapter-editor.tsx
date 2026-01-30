"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader2, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Chapter, ReflectionPoint } from "@workspace/database";

import { Button } from "@workspace/ui/components/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Switch } from "@workspace/ui/components/switch";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";

const formSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    videoUrl: z.string().optional(),
    isFree: z.boolean(),
    isPublished: z.boolean(),
});

type ChapterFormValues = z.infer<typeof formSchema>;

interface ChapterEditorProps {
    initialData: Chapter & {
        reflectionPoints?: ReflectionPoint[];
    };
    courseId: string;
    chapterId: string;
}

export function ChapterEditor({
    initialData,
    courseId,
    chapterId,
}: ChapterEditorProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

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

    const { isSubmitting, isValid } = form.formState;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/courses/${courseId}/chapters/${chapterId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                throw new Error("Something went wrong");
            }

            toast.success("Chapter updated");
            router.refresh();

        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const onDelete = async () => {
        try {
            setLoading(true);
            const confirmed = window.confirm("Are you sure you want to delete this chapter?");
            if (confirmed) {
                const response = await fetch(`/api/courses/${courseId}/chapters/${chapterId}`, {
                    method: "DELETE",
                });

                if (!response.ok) {
                    throw new Error("Something went wrong");
                }

                toast.success("Chapter deleted");
                router.push(`/dashboard/courses/${courseId}`);
                router.refresh();
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="w-full">
                    <Link
                        href={`/dashboard/courses/${courseId}`}
                        className="flex items-center text-sm hover:opacity-75 transition mb-6"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to course setup
                    </Link>
                    <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col gap-y-2">
                            <h1 className="text-2xl font-medium">Chapter Creation</h1>
                            <span className="text-sm text-slate-700">
                                Complete all fields {isValid ? "(Complete)" : "(Incomplete)"}
                            </span>
                        </div>
                        <div className="flex items-center gap-x-2">
                            <Button onClick={onDelete} disabled={loading} variant="destructive" size="sm">
                                <Trash className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Chapter Details</CardTitle>
                                    <CardDescription>Customize your chapter.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        disabled={isSubmitting}
                                                        placeholder="e.g. 'Introduction to the course'"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        disabled={isSubmitting}
                                                        placeholder="e.g. 'This chapter covers...'"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Chapter Video</CardTitle>
                                    <CardDescription>Add a video to this chapter.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="videoUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Video URL</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        disabled={isSubmitting}
                                                        placeholder="e.g. 'https://youtube.com/...'"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>Enter a YouTube or Vimeo URL.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="space-y-4 mt-6">
                                        {/* Transcript Section */}
                                        <div className="rounded-lg border bg-muted/20 p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h3 className="font-medium">Transcript</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {initialData.transcriptJson
                                                            ? `${(initialData.transcriptJson as any[]).length} segments available`
                                                            : "No transcript generated"}
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={loading || !form.getValues("videoUrl")}
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
                                                                router.refresh();
                                                                return `Success! ${data.segmentsCount} transcript segments found.`;
                                                            }),
                                                            {
                                                                loading: "Fetching transcript...",
                                                                success: (msg) => msg,
                                                                error: (err) => `Error: ${err.message}`,
                                                            }
                                                        );
                                                    }}
                                                >
                                                    {initialData.transcriptJson ? "Refresh Transcript" : "Generate Transcript"}
                                                </Button>
                                            </div>
                                            {initialData.transcriptJson && (
                                                <div className="text-xs font-mono bg-background p-2 rounded border h-24 overflow-y-auto text-muted-foreground">
                                                    {(initialData.transcriptJson as any[]).slice(0, 5).map((s: any, i) => (
                                                        <div key={i}>[{Math.floor(s.start)}s] {s.text}</div>
                                                    ))}
                                                    {(initialData.transcriptJson as any[]).length > 5 && (
                                                        <div className="mt-1 text-center italic">...and {(initialData.transcriptJson as any[]).length - 5} more</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Reflection Points Section */}
                                        <div className="rounded-lg border bg-muted/20 p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h3 className="font-medium">Reflection Points</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {initialData.reflectionPoints && initialData.reflectionPoints.length > 0
                                                            ? `${initialData.reflectionPoints.length} points generated`
                                                            : "No reflection points"}
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
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
                                                                router.refresh();
                                                                return `Success! Generated ${data.count} reflection points.`;
                                                            }),
                                                            {
                                                                loading: "Analyzing transcript and generating points...",
                                                                success: (msg) => msg,
                                                                error: (err) => `Error: ${err.message}`,
                                                            }
                                                        );
                                                    }}
                                                >
                                                    Generate Points
                                                </Button>
                                            </div>
                                            {initialData.reflectionPoints && initialData.reflectionPoints.length > 0 ? (
                                                <div className="space-y-1">
                                                    {initialData.reflectionPoints.map((p) => (
                                                        <div key={p.id} className="text-sm flex items-center justify-between p-2 bg-background rounded border">
                                                            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                                                                {Math.floor(p.time / 60)}:{(Math.floor(p.time % 60)).toString().padStart(2, '0')}
                                                            </span>
                                                            <span className="text-muted-foreground truncate ml-2 flex-1">{p.topic}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                initialData.transcriptJson && (
                                                    <div className="text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-900/10 dark:text-yellow-400 p-2 rounded flex items-center gap-2">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
                                                        Ready to generate points from transcript
                                                    </div>
                                                )
                                            )}

                                            {/* Manual Add Point */}
                                            <div className="mt-4 pt-4 border-t">
                                                <div className="text-xs font-medium mb-2 uppercase text-muted-foreground">Or Add Manually</div>
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="mm:ss"
                                                        className="w-20"
                                                        id="manual-time"
                                                    />
                                                    <Input
                                                        placeholder="Topic (e.g. Introduction)"
                                                        className="flex-1"
                                                        id="manual-topic"
                                                    />
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() => {
                                                            const timeStr = (document.getElementById("manual-time") as HTMLInputElement).value;
                                                            const topic = (document.getElementById("manual-topic") as HTMLInputElement).value;

                                                            if (!timeStr.includes(":") || !topic) {
                                                                toast.error("Format: mm:ss and topic required");
                                                                return;
                                                            }

                                                            const [m, s] = timeStr.split(":").map(Number);
                                                            const time = m * 60 + s;

                                                            if (isNaN(time)) {
                                                                toast.error("Invalid time format");
                                                                return;
                                                            }

                                                            toast.promise(
                                                                fetch("/api/courses/" + courseId + "/chapters/" + chapterId + "/reflection-points", {
                                                                    method: "POST",
                                                                    headers: { "Content-Type": "application/json" },
                                                                    body: JSON.stringify({ time, topic }),
                                                                }).then(async (r) => {
                                                                    if (!r.ok) throw new Error("Failed");
                                                                    router.refresh();
                                                                }),
                                                                {
                                                                    loading: "Adding point...",
                                                                    success: "Point added",
                                                                    error: "Failed to add point"
                                                                }
                                                            );

                                                            (document.getElementById("manual-time") as HTMLInputElement).value = "";
                                                            (document.getElementById("manual-topic") as HTMLInputElement).value = "";
                                                        }}
                                                    >
                                                        Add
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Access Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="isFree"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Free Preview</FormLabel>
                                                    <FormDescription>
                                                        Check this box if you want this chapter to be free for preview.
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        disabled={isSubmitting}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="isPublished"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Published</FormLabel>
                                                    <FormDescription>
                                                        Reviewing this chapter? Unpublish it to hide it from students.
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        disabled={isSubmitting}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Button disabled={isSubmitting || !isValid} type="submit" className="w-full" size="lg">
                                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}
