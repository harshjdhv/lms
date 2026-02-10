"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Megaphone, Calendar, Sparkles } from "lucide-react"
import { useAnnouncements } from "@/hooks/queries/use-announcements"
import { cn } from "@/lib/utils"

export function StudentAnnouncementFeed() {
    const { data: announcements = [], isLoading } = useAnnouncements()

    if (isLoading) {
        return (
            <div className="flex h-full flex-col gap-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="overflow-hidden rounded-xl border border-border/60 bg-card/70 p-4">
                        <div className="mb-3 h-24 rounded-lg bg-gradient-to-r from-muted/50 to-muted/30 animate-pulse" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-20 rounded-full" />
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-16 w-full rounded-lg" />
                        </div>
                    </div>
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
                className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-gradient-to-br from-muted/20 to-transparent p-6 text-center"
            >
                <div className="rounded-full bg-purple-500/10 p-4 mb-4">
                    <Megaphone className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Recent Announcements</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                    Announcements from your teachers will appear here. Stay tuned!
                </p>
            </motion.div>
        )
    }

    return (
        <ScrollArea className="h-full pr-2">
            <div className="flex flex-col gap-3">
                <AnimatePresence>
                    {announcements.map((announcement, index) => (
                        <motion.article
                            key={announcement.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.08 }}
                            whileHover={{ y: -2 }}
                            className={cn(
                                "group overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card/95 to-background/80 p-4 transition-all duration-300",
                                "hover:border-primary/30 hover:shadow-md"
                            )}
                        >
                            {announcement.imageUrl && (
                                <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-lg bg-muted">
                                    <img
                                        src={announcement.imageUrl}
                                        alt={announcement.title}
                                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            )}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <Badge
                                        variant="secondary"
                                        className="text-xs font-normal bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 dark:text-purple-400 border-0"
                                    >
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        {announcement.course.title}
                                    </Badge>
                                    <span className="shrink-0 text-xs text-muted-foreground flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {new Date(announcement.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-base font-semibold leading-tight group-hover:text-primary transition-colors">
                                    {announcement.title}
                                </h3>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3 leading-relaxed">
                                    {announcement.content}
                                </p>
                            </div>
                        </motion.article>
                    ))}
                </AnimatePresence>
            </div>
        </ScrollArea>
    )
}
