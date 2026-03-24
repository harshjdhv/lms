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
import { Plus } from "lucide-react"
import { FileUpload } from "./file-upload"
import { CreateCourseDialog } from "@/components/courses/create-course-dialog"

interface Course {
    id: string
    title: string
    semester: string | null
}

export function CreateAssignmentSection({ courses, onCreated }: { courses: Course[], onCreated: () => void }) {
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [semester, setSemester] = useState("")
    const [attachmentUrl, setAttachmentUrl] = useState("")
    const [dueDate, setDueDate] = useState("")
    const [loading, setLoading] = useState(false)
    const semesterOptions = Array.from({ length: 8 }, (_, index) => `SEM-${index + 1}`)
    const courseCountBySemester = courses.reduce<Record<string, number>>((acc, course) => {
        if (course.semester) {
            acc[course.semester] = (acc[course.semester] ?? 0) + 1
        }
        return acc
    }, {})

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!semester) return toast.error("Select a semester")

        setLoading(true)
        try {
            const res = await fetch("/api/assignments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content, semester, attachmentUrl, dueDate: dueDate ? new Date(dueDate).toISOString() : null }),
            })

            if (!res.ok) throw new Error("Failed")

            toast.success("Assignment created")
            setTitle("")
            setContent("")
            // Keep course selected
            setAttachmentUrl("")
            setDueDate("")
            onCreated()
        } catch (e) {
            toast.error("Failed to create assignment")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="border-dashed shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex flex-col gap-1.5">
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5 text-primary" />
                        Create New Assignment
                    </CardTitle>
                    <CardDescription>
                        Fill in the details below to post a new assignment or material.
                    </CardDescription>
                </div>
                <CreateCourseDialog />
            </CardHeader>
            <CardContent>
                <form id="create-assignment" onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Semester</Label>
                            {courses.length === 0 ? (
                                <div className="flex items-center justify-between text-sm text-muted-foreground border rounded-md p-2 bg-muted/50">
                                    <span>No courses found.</span>
                                    <CreateCourseDialog trigger={<Button variant="link" size="sm" className="h-auto p-0">Create one</Button>} />
                                </div>
                            ) : (
                                <Select value={semester || undefined} onValueChange={setSemester}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select semester..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {semesterOptions.map((option) => (
                                            <SelectItem key={option} value={option}>
                                                {option} ({courseCountBySemester[option] ?? 0} courses)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            <p className="text-xs text-muted-foreground">
                                This assignment will be shown to students in the selected semester. If the count is 0, create a course for that semester first.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Assignment title" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Content / Instructions</Label>
                        <Textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Detailed instructions..."
                            className="min-h-[120px]"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Input
                            type="datetime-local"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Attach Document (Optional)</Label>
                        <FileUpload onUploadComplete={setAttachmentUrl} />
                    </div>
                </form>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t px-6 py-4">
                <Button form="create-assignment" disabled={loading} className="ml-auto">
                    {loading ? "Creating..." : "Post Assignment"}
                </Button>
            </CardFooter>
        </Card>
    )
}
