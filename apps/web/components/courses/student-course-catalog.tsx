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
import { Skeleton } from "@workspace/ui/components/skeleton"
import { toast } from "sonner"
import { Search, BookOpen } from "lucide-react"
import { useAvailableCourses, useEnrollCourseViaBody } from "@/hooks/queries/use-courses"

export function StudentCourseCatalog() {
    const [open, setOpen] = useState(false)
    const { data: courses = [], isLoading, refetch } = useAvailableCourses({ enabled: open })
    const enrollMutation = useEnrollCourseViaBody()
    const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null)

    const handleEnroll = async (courseId: string) => {
        setEnrollingCourseId(courseId)
        try {
            await enrollMutation.mutateAsync(courseId)
            toast.success("Enrolled successfully!")
        } catch {
            toast.error("Failed to enroll")
        } finally {
            setEnrollingCourseId(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val)
            // Refetch when opening to ensure fresh data
            if (val) refetch()
        }}>
            <DialogTrigger asChild>
                <Button className="relative w-full sm:w-auto overflow-hidden group">
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
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border bg-card">
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-5 w-24 rounded-full" />
                                    </div>
                                    <Skeleton className="h-10 w-24" />
                                </div>
                            ))}
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
                                                By {course.teacher?.name || "Instructor"}
                                            </Badge>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleEnroll(course.id)}
                                        disabled={enrollingCourseId === course.id}
                                        className="shrink-0"
                                    >
                                        {enrollingCourseId === course.id ? "Joining..." : "Join Course"}
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
