"use client"

import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { FileIcon, ExternalLink, Clock, Calendar } from "lucide-react"
import { useState } from "react"
import { useAssignments, type Assignment } from "@/hooks/queries/use-assignments"

export function AssignmentFeed() {
    const { data: assignments = [], isLoading } = useAssignments()
    const [filter, setFilter] = useState<'ALL' | string>('ALL')

    const filtered = filter === 'ALL' ? assignments : assignments.filter(a => a.course.title === filter)
    const courses = Array.from(new Set(assignments.map(a => a.course.title)))

    if (isLoading) {
        return (
            <div className="flex flex-col h-full bg-sidebar/50 backdrop-blur-sm border rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between p-4 border-b bg-background/50">
                    <Skeleton className="h-6 w-32" />
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                </div>
                <div className="flex-1 p-4 space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
                            <Skeleton className="h-5 w-24 rounded-full" />
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-sidebar/50 backdrop-blur-sm border rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between p-4 border-b bg-background/50">
                <h3 className="font-semibold text-lg">Assignments Feed</h3>
                <div className="flex gap-2 overflow-x-auto pb-1 max-w-[50%] no-scrollbar">
                    <Badge
                        variant={filter === 'ALL' ? "default" : "outline"}
                        className="cursor-pointer whitespace-nowrap"
                        onClick={() => setFilter('ALL')}
                    >
                        All
                    </Badge>
                    {courses.map(c => (
                        <Badge
                            key={c}
                            variant={filter === c ? "default" : "outline"}
                            className="cursor-pointer whitespace-nowrap"
                            onClick={() => setFilter(c)}
                        >
                            {c}
                        </Badge>
                    ))}
                </div>
            </div>

            <ScrollArea className="flex-1 p-4 h-[400px]">
                <div className="flex flex-col gap-4">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl bg-background/50">
                            <p>No active assignments found.</p>
                            <p className="text-sm mt-1">Check back later!</p>
                        </div>
                    ) : (
                        filtered.map((assignment) => (
                            <div key={assignment.id} className="group relative flex flex-col gap-3 rounded-xl border bg-card p-5 text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/20 bg-gradient-to-br from-card to-background">
                                <div className="absolute top-4 right-4 text-xs text-muted-foreground flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-full">
                                    <Clock className="w-3 h-3" />
                                    <span>Due in 3 days</span>
                                </div>

                                <div className="flex flex-col gap-1 pr-20">
                                    <Badge variant="outline" className="w-fit mb-1 border-primary/20 text-primary bg-primary/5">
                                        {assignment.course.title}
                                    </Badge>
                                    <h3 className="font-semibold text-lg leading-tight tracking-tight">{assignment.title}</h3>
                                </div>

                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap line-clamp-3">
                                    {assignment.content}
                                </p>

                                {assignment.attachmentUrl && (
                                    <a
                                        href={assignment.attachmentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 mt-2 bg-muted/40 rounded-lg border border-border/50 hover:bg-muted/60 transition-colors group-hover:border-primary/20"
                                    >
                                        <div className="h-8 w-8 rounded bg-background flex items-center justify-center shadow-sm">
                                            <FileIcon className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">Attached Resource</p>
                                        </div>
                                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </a>
                                )}

                                <div className="flex items-center gap-2 pt-2 mt-auto text-xs text-muted-foreground border-t">
                                    <Calendar className="h-3 w-3" />
                                    <span>Posted {new Date(assignment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
