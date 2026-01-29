"use client";

import { Skeleton } from "@workspace/ui/components/skeleton";

export default function CourseLoading() {
    return (
        <div className="w-full max-w-5xl mx-auto p-6 space-y-6 animate-in fade-in-50 duration-300">
            {/* Header skeleton */}
            <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-32" />
            </div>
            
            {/* Title & description */}
            <div className="space-y-3">
                <Skeleton className="h-9 w-3/4 max-w-md" />
                <Skeleton className="h-5 w-full max-w-lg" />
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                {/* Left column - details */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="rounded-xl border bg-card p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-5 w-5 rounded" />
                            <Skeleton className="h-5 w-32" />
                        </div>
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>

                {/* Right column - chapters */}
                <div className="space-y-4">
                    <div className="rounded-xl border bg-card p-4 space-y-3">
                        <Skeleton className="h-5 w-24" />
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-4 flex-1" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
