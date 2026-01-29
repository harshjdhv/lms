"use client";

import { Skeleton } from "@workspace/ui/components/skeleton";

export function CoursesLoading() {
    return (
        <div className="w-full flex flex-col gap-6 p-6 max-w-[1600px] mx-auto animate-in fade-in-50 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-44" />
                    <Skeleton className="h-5 w-72" />
                </div>
                <Skeleton className="h-10 w-28 rounded-md" />
            </div>

            {/* Course grid skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="rounded-xl border bg-card overflow-hidden">
                        <Skeleton className="aspect-video w-full" />
                        <div className="p-4 space-y-3">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-10 w-full rounded-md mt-4" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
