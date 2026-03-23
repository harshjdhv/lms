"use client";

import { StatsCardSkeleton } from "@/components/ui/stats-card";

interface MyCoursesSkeletonProps {
    isTeacher?: boolean;
}

export function MyCoursesSkeleton({ isTeacher = false }: MyCoursesSkeletonProps) {
    return (
        <div className="flex w-full min-w-0 flex-col overflow-x-hidden animate-in fade-in-50 duration-500">
            <div className="flex flex-col justify-between gap-4 border-b bg-background px-6 py-5 lg:flex-row lg:items-center">
                <div className="space-y-2">
                    <div className="h-7 w-40 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-64 bg-muted/50 rounded animate-pulse" />
                </div>
                <div className="flex gap-3">
                    <div className="h-9 w-48 bg-muted rounded animate-pulse" />
                    {isTeacher && <div className="h-9 w-32 bg-muted rounded animate-pulse" />}
                </div>
            </div>
            {isTeacher && (
                <div className="grid grid-cols-3 border-b divide-x divide-border">
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                </div>
            )}
            <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3 border-t border-border"
                style={{ backgroundImage: "repeating-linear-gradient(45deg, var(--color-border) 0, var(--color-border) 1px, transparent 0, transparent 50%)", backgroundSize: "6px 6px" }}
            >
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-72 bg-card animate-pulse" />
                ))}
            </div>
        </div>
    );
}
