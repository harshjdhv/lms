"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Megaphone, Calendar } from "lucide-react"

interface Announcement {
    id: string
    title: string
    content: string
    imageUrl: string
    createdAt: string
    course: {
        title: string
    }
}

export function StudentAnnouncementFeed() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [loading, setLoading] = useState(true)

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch("/api/announcements")
            if (res.ok) {
                const data = await res.json()
                setAnnouncements(data)
            }
        } catch (error) {
            console.error("Failed to fetch announcements", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAnnouncements()
    }, [])

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="overflow-hidden">
                        <div className="h-48 bg-muted animate-pulse" />
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (announcements.length === 0) {
        return (
            <Card className="bg-muted/30 border-dashed">
                <CardContent className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                    <Megaphone className="h-12 w-12 mb-4 opacity-20" />
                    <p>No recent announcements</p>
                    <p className="text-sm">Announcements from your teachers will appear here (recent 7 days).</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Announcements</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {announcements.map((announcement) => (
                    <Card key={announcement.id} className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
                        {announcement.imageUrl && (
                            <div className="relative aspect-video w-full overflow-hidden bg-muted">
                                <img
                                    src={announcement.imageUrl}
                                    alt={announcement.title}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        )}
                        <CardHeader>
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="secondary" className="text-xs font-normal">
                                    {announcement.course.title}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(announcement.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <CardTitle className="text-lg line-clamp-1">{announcement.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
                                {announcement.content}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
