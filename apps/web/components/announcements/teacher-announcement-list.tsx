"use client"

import { useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@workspace/ui/components/table"
import { Megaphone, Calendar } from "lucide-react"
import { useAnnouncements } from "@/hooks/queries/use-announcements"

export function TeacherAnnouncementList({ refreshTrigger }: { refreshTrigger: number }) {
    const { data: announcements = [], isLoading, refetch } = useAnnouncements()

    // Refetch when refreshTrigger changes (after creating a new announcement)
    useEffect(() => {
        if (refreshTrigger > 0) {
            refetch()
        }
    }, [refreshTrigger, refetch])

    return (
        <Card className="shadow-none border-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <CardTitle>Recent Announcements</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableHead className="w-[300px]">Announcement</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Date Posted</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                        Loading announcements...
                                    </TableCell>
                                </TableRow>
                            ) : announcements.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                        No announcements yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                announcements.map((announcement) => (
                                    <TableRow key={announcement.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600">
                                                    <Megaphone className="h-4 w-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span>{announcement.title}</span>
                                                    <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{announcement.content}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-normal">{announcement.course.title}</Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm flex items-center gap-2">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(announcement.createdAt).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
