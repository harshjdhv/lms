"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Megaphone, Calendar, Sparkles } from "lucide-react"
import { useAnnouncements } from "@/hooks/queries/use-announcements"
import { cn } from "@/lib/utils"

export function StudentAnnouncementFeed() {
    const { data: announcements = [], isLoading } = useAnnouncements()

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="overflow-hidden">
                        <div className="h-32 bg-gradient-to-r from-muted/50 to-muted/30 animate-pulse" />
                        <CardHeader className="pb-2">
                            <Skeleton className="h-5 w-20 rounded-full" />
                            <Skeleton className="h-5 w-3/4 mt-2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-16 w-full rounded-lg" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (announcements.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="bg-gradient-to-br from-muted/30 to-transparent border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="rounded-full bg-purple-500/10 p-4 mb-4">
                            <Megaphone className="h-8 w-8 text-purple-500" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No Recent Announcements</h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            Announcements from your teachers will appear here. Stay tuned!
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <AnimatePresence>
                {announcements.map((announcement, index) => (
                    <motion.div
                        key={announcement.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.08 }}
                    >
                        <Card className={cn(
                            "overflow-hidden flex flex-col h-full transition-all duration-300",
                            "hover:shadow-lg hover:-translate-y-1 border-l-4 border-l-transparent",
                            "hover:border-l-purple-500/50 group"
                        )}>
                            {announcement.imageUrl && (
                                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                                    <img
                                        src={announcement.imageUrl}
                                        alt={announcement.title}
                                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            )}
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between mb-2">
                                    <Badge
                                        variant="secondary"
                                        className="text-xs font-normal bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 dark:text-purple-400 border-0"
                                    >
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        {announcement.course.title}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {new Date(announcement.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <CardTitle className="text-base leading-tight group-hover:text-primary transition-colors">
                                    {announcement.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 pb-4">
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3 leading-relaxed">
                                    {announcement.content}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}
