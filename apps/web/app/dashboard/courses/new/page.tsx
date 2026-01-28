"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function CreateCoursePage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!title) return;

        try {
            setLoading(true);
            const res = await fetch("/api/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title }),
            });

            if (!res.ok) {
                if (res.status === 403) throw new Error("Only teachers can create courses");
                throw new Error("Failed to create course");
            }

            const course = await res.json();
            toast.success("Course created!");
            router.push(`/dashboard/courses/${course.id}`);
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto flex items-center justify-center min-h-[80vh] p-6">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Name your course</CardTitle>
                    <CardDescription>
                        What would you like to name your new course? Don&apos;t worry, you can change this later.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label>Course Title</Label>
                            <Input
                                placeholder="e.g. Advanced Web Development"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button asChild variant="ghost">
                                <Link href="/dashboard/courses/my">Cancel</Link>
                            </Button>
                            <Button onClick={handleCreate} disabled={!title || loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Continue
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
