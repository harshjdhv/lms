"use client";

import { Skeleton } from "@workspace/ui/components/skeleton";

export default function ChapterLoading() {
    return (
        <div className="flex flex-col lg:flex-row w-full min-h-0 gap-0 animate-in fade-in-50 duration-300">
            {/* Main content area */}
            <div className="flex-1 min-w-0 flex flex-col p-4 lg:p-6">
                {/* Back button */}
                <div className="flex items-center gap-2 mb-4">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                </div>

                {/* Title & description */}
                <div className="space-y-3 mb-4">
                    <Skeleton className="h-8 w-3/4 max-w-md" />
                    <Skeleton className="h-4 w-full max-w-sm" />
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-28 rounded-full" />
                    </div>
                </div>

                {/* Video player skeleton */}
                <div className="w-full max-w-3xl">
                    <Skeleton className="aspect-video w-full rounded-lg" />
                </div>

                {/* Info section skeleton */}
                <div className="mt-6 p-4 rounded-lg border bg-muted/10 max-w-3xl space-y-3">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-full max-w-md" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-28" />
                    </div>
                </div>
            </div>

            {/* Right sidebar skeleton */}
            <aside className="w-full lg:w-80 xl:w-96 shrink-0 border-t lg:border-t-0 lg:border-l border-border bg-muted/10">
                <div className="p-3 border-b border-border">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-16 mt-1" />
                </div>
                <div className="p-2 space-y-1">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="flex items-center gap-3 rounded-md px-3 py-2.5">
                            <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                            <Skeleton className="h-4 flex-1" />
                        </div>
                    ))}
                </div>
            </aside>
        </div>
    );
}
