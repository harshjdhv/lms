"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader2, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Chapter } from "@workspace/database";

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

            // Generate and cache transcript for quiz questions (fire-and-forget)
            if (values.videoUrl?.trim()) {
                fetch("/api/reflection/transcript", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ chapterId }),
                }).then((r) => {
                    if (r.ok) toast.success("Transcript cached for quizzes");
                }).catch(() => {});
            }
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
