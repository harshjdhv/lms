"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Megaphone, Calendar, BookOpen, Filter, RefreshCw } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import { useAnnouncements } from "@/hooks/queries/use-announcements"
import { StatsCard, StatsCardSkeleton, gradientPresets } from "@/components/ui/stats-card"
import { cn } from "@/lib/utils"

const HATCH = {
    backgroundImage: "repeating-linear-gradient(45deg, var(--color-border) 0, var(--color-border) 1px, transparent 0, transparent 50%)",
    backgroundSize: "6px 6px",
}

export function StudentAnnouncementsView() {
    const { data: announcements = [], isLoading, refetch, isFetching } = useAnnouncements()
    const [filterCourse, setFilterCourse] = useState("all")

    const courses = Array.from(new Set(announcements.map(a => a.course.title)))

    const filtered = filterCourse === "all"
        ? announcements
        : announcements.filter(a => a.course.title === filterCourse)

    return (
        <div className="flex w-full min-w-0 flex-col overflow-x-hidden animate-in fade-in-50 duration-500">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col justify-between gap-4 border-b bg-background px-6 py-5 lg:flex-row lg:items-center"
            >
                <div className="min-w-0 space-y-1">
                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Announcements</h1>
                    <p className="text-sm text-muted-foreground">Updates and notices from your courses.</p>
                </div>
                <div className="flex w-full items-center gap-2 sm:w-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="shrink-0"
                    >
                        <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
                    </Button>
                </div>
            </motion.div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 border-b divide-x divide-border">
                {isLoading ? (
                    <>
                        <StatsCardSkeleton />
                        <StatsCardSkeleton />
                    </>
                ) : (
                    <>
                        <StatsCard
                            title="Total Announcements"
                            value={announcements.length}
                            icon={Megaphone}
                            description="From all your courses"
                            trend="neutral"
                            index={0}
                            {...gradientPresets.purple}
                        />
                        <StatsCard
                            title="Courses"
                            value={courses.length}
                            icon={BookOpen}
                            description="With announcements"
                            trend="neutral"
                            index={1}
                            {...gradientPresets.blue}
                        />
                    </>
                )}
            </div>

            {/* Hatched divider */}
            <div className="h-4 w-full border-b shrink-0" style={HATCH} />

            {/* Filter bar */}
            <div className="flex items-center gap-2 px-6 py-3 border-b">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">Filter by course:</span>
                <Select value={filterCourse} onValueChange={setFilterCourse}>
                    <SelectTrigger className="w-[200px] rounded-none h-8 text-sm">
                        <SelectValue placeholder="All Courses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        {courses.map(course => (
                            <SelectItem key={course} value={course}>{course}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {filterCourse !== "all" && (
                    <button
                        onClick={() => setFilterCourse("all")}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Announcement list */}
            {isLoading ? (
                <div className="divide-y divide-border">
                    {[1, 2, 3, 4].map(i => (
                        <AnnouncementSkeleton key={i} />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-6">
                    <div className="bg-purple-500/10 p-4">
                        <Megaphone className="h-8 w-8 text-purple-500" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">No announcements</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                            {filterCourse === "all"
                                ? "Your teachers haven't posted anything yet. Check back soon."
                                : "No announcements for this course."}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="divide-y divide-border">
                    <AnimatePresence>
                        {filtered.map((announcement, index) => (
                            <AnnouncementRow
                                key={announcement.id}
                                announcement={announcement}
                                index={index}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}

function AnnouncementRow({ announcement, index }: { announcement: any; index: number }) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.05 }}
            className="flex flex-col gap-3 px-6 py-5 hover:bg-muted/20 transition-colors border-l-2 border-l-transparent hover:border-l-purple-400"
        >
            {announcement.imageUrl && (
                <div className="relative aspect-video w-full max-w-lg overflow-hidden bg-muted">
                    <img
                        src={announcement.imageUrl}
                        alt={announcement.title}
                        className="object-cover w-full h-full"
                    />
                </div>
            )}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <Badge variant="secondary" className="rounded-none text-[10px] px-1.5 py-0">
                    {announcement.course.title}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1.5 shrink-0">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(announcement.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })}
                </span>
            </div>
            <div className="space-y-1.5">
                <h3 className="text-base font-semibold leading-tight">{announcement.title}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {announcement.content}
                </p>
            </div>
        </motion.article>
    )
}

function AnnouncementSkeleton() {
    return (
        <div className="flex flex-col gap-3 px-6 py-5">
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-5 w-2/3" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
    )
}
