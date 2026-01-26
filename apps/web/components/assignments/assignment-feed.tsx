"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"

interface Assignment {
    id: string
    title: string
    content: string
    attachmentUrl?: string | null
    createdAt: string
    course: {
        title: string
    }
}

import { FileIcon, ExternalLink } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

export function AssignmentFeed() {
    const [assignments, setAssignments] = useState<Assignment[]>([])

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const res = await fetch("/api/assignments")
                if (res.ok) {
                    const data = await res.json()
                    setAssignments(data)
                }
            } catch (error) {
                console.error("Failed to fetch assignments", error)
            }
        }

        fetchAssignments()
        const interval = setInterval(fetchAssignments, 5000) // Poll every 5s

        return () => clearInterval(interval)
    }, [])

    return (
        <Card className="h-full flex flex-col border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0 pb-4">
                <CardTitle className="text-xl font-semibold tracking-tight">Recent Updates</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 min-h-0">
                <ScrollArea className="h-[400px] w-full pr-4">
                    <div className="flex flex-col gap-4">
                        {assignments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                                <p>No assignments or announcements yet.</p>
                                <p className="text-sm mt-2">Join a course to see updates.</p>
                            </div>
                        ) : (
                            assignments.map((assignment) => (
                                <div key={assignment.id} className="group flex flex-col gap-3 rounded-xl border bg-card p-5 text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                                    <div className="flex items-start justify-between gap-4">
                                        <h3 className="font-semibold leading-tight">{assignment.title}</h3>
                                        <Badge variant="outline" className="shrink-0 bg-background/50">
                                            {assignment.course.title}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                        {assignment.content}
                                    </p>
                                    {assignment.attachmentUrl && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <a
                                                href={assignment.attachmentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-sm text-primary hover:underline bg-primary/5 px-3 py-2 rounded-md transition-colors hover:bg-primary/10"
                                            >
                                                <FileIcon className="h-4 w-4" />
                                                View Attachment
                                                <ExternalLink className="h-3 w-3 opacity-50" />
                                            </a>
                                        </div>
                                    )}
                                    <div className="text-xs text-muted-foreground/60 font-medium pt-1">
                                        {new Date(assignment.createdAt).toLocaleDateString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: 'numeric'
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
