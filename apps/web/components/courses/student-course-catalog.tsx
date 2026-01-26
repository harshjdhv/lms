"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Badge } from "@workspace/ui/components/badge"
import { toast } from "sonner"
import { Search, BookOpen } from "lucide-react"

interface Course {
    id: string
    title: string
    description: string
    teacher: { name: string | null }
}

export function StudentCourseCatalog() {
    const [open, setOpen] = useState(false)
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(false)
    const [enrolling, setEnrolling] = useState<string | null>(null)

    const fetchCourses = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/courses/available")
            if (res.ok) {
                setCourses(await res.json())
            }
        } catch (e) {
            toast.error("Failed to load courses")
        } finally {
            setLoading(false)
        }
    }

    const handleEnroll = async (courseId: string) => {
        setEnrolling(courseId)
        try {
            const res = await fetch("/api/courses/enroll", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courseId })
            })

            if (!res.ok) throw new Error("Failed")

            toast.success("Enrolled successfully!")
            setCourses(prev => prev.filter(c => c.id !== courseId))
            // The dashboard feed polls, so it will pick up new assignments automatically
            // But we might want to refresh the page to update stats if we had them
        } catch (e) {
            toast.error("Failed to enroll")
        } finally {
            setEnrolling(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val)
            if (val) fetchCourses()
        }}>
            <DialogTrigger asChild>
                <Button className="w-full relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Search className="mr-2 h-4 w-4" />
                    Browse & Join Courses
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Available Courses</DialogTitle>
                    <DialogDescription>
                        Browse and enroll in courses to start receiving assignments.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[400px] mt-4 pr-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-40 text-muted-foreground">
                            Loading courses...
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                            <BookOpen className="h-8 w-8 mb-2 opacity-50" />
                            <p>No new courses available at the moment.</p>
                            <p className="text-sm">You might already be enrolled in everything!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {courses.map(course => (
                                <div key={course.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border bg-card hover:border-primary/50 transition-colors shadow-sm">
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-lg">{course.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{course.description || "No description provided."}</p>
                                        <div className="flex items-center gap-2 pt-1">
                                            <Badge variant="secondary" className="text-xs font-normal">
                                                By {course.teacher.name || "Instructor"}
                                            </Badge>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleEnroll(course.id)}
                                        disabled={enrolling === course.id}
                                        className="shrink-0"
                                    >
                                        {enrolling === course.id ? "Joining..." : "Join Course"}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
