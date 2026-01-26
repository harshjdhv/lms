"use client"

import { useState } from "react"
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter
} from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Label } from "@workspace/ui/components/label"
import { toast } from "sonner"
import { Megaphone } from "lucide-react"
import { FileUpload } from "@/components/assignments/file-upload" // Reusing file upload
import { CreateCourseDialog } from "@/components/courses/create-course-dialog"

interface Course {
    id: string
    title: string
}

export function CreateAnnouncementSection({ courses, onCreated }: { courses: Course[], onCreated: () => void }) {
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [courseId, setCourseId] = useState("")
    const [imageUrl, setImageUrl] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!courseId) return toast.error("Select a course")

        setLoading(true)
        try {
            const res = await fetch("/api/announcements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content, courseId, imageUrl }),
            })

            if (!res.ok) throw new Error("Failed")

            toast.success("Announcement posted")
            setTitle("")
            setContent("")
            setImageUrl("")
            onCreated()
        } catch (e) {
            toast.error("Failed to post announcement")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="border-dashed shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex flex-col gap-1.5">
                    <CardTitle className="flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-primary" />
                        Make an Announcement
                    </CardTitle>
                    <CardDescription>
                        Broadcast updates to your students.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <form id="create-announcement" onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Course</Label>
                        {courses.length === 0 ? (
                            <div className="flex items-center justify-between text-sm text-muted-foreground border rounded-md p-2 bg-muted/50">
                                <span>No courses found.</span>
                                <CreateCourseDialog trigger={<Button variant="link" size="sm" className="h-auto p-0">Create one</Button>} />
                            </div>
                        ) : (
                            <Select value={courseId || undefined} onValueChange={setCourseId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select course..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement title" required />
                    </div>

                    <div className="space-y-2">
                        <Label>Content</Label>
                        <Textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="What do you want to announce?"
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Attach Image (Optional)</Label>
                        <FileUpload onUploadComplete={setImageUrl} />
                    </div>
                </form>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t px-6 py-4">
                <Button form="create-announcement" disabled={loading} className="ml-auto">
                    {loading ? "Posting..." : "Post Announcement"}
                </Button>
            </CardFooter>
        </Card>
    )
}
