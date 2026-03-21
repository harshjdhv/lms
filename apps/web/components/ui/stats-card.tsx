/**
 * @file components/ui/stats-card.tsx
 * @description Flat stats cell component with grid-line style
 * @module Apps/Web/Components/UI
 */

"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    description?: string;
    trend?: "up" | "down" | "neutral" | "warning" | "success";
    gradient: string;
    iconColor: string;
    index?: number;
    className?: string;
}

const trendColors = {
    up: "text-emerald-600",
    down: "text-red-500",
    neutral: "text-muted-foreground",
    warning: "text-amber-500",
    success: "text-emerald-500",
};

export function StatsCard({
    title,
    value,
    icon: Icon,
    description,
    trend = "neutral",
    iconColor,
    index = 0,
    className,
}: StatsCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.06 }}
            className={cn("group", className)}
        >
            <div className="relative h-full p-5 bg-background">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                        {title}
                    </span>
                    <Icon className={cn("h-4 w-4", iconColor)} />
                </div>

                {/* Value */}
                <div className="text-4xl font-bold tracking-tight tabular-nums">
                    {typeof value === "number" ? value.toLocaleString() : value}
                </div>

                {/* Description */}
                {description && (
                    <p className={cn("text-xs mt-2", trendColors[trend])}>
                        {description}
                    </p>
                )}
            </div>
        </motion.div>
    );
}

// Preset gradient configurations — kept for API compat, gradient unused in flat style
export const gradientPresets = {
    blue: {
        gradient: "from-blue-500/10 to-cyan-500/10",
        iconColor: "text-blue-500",
    },
    purple: {
        gradient: "from-purple-500/10 to-pink-500/10",
        iconColor: "text-purple-500",
    },
    amber: {
        gradient: "from-amber-500/10 to-orange-500/10",
        iconColor: "text-amber-500",
    },
    emerald: {
        gradient: "from-emerald-500/10 to-green-500/10",
        iconColor: "text-emerald-500",
    },
    indigo: {
        gradient: "from-indigo-500/10 to-violet-500/10",
        iconColor: "text-indigo-500",
    },
    rose: {
        gradient: "from-rose-500/10 to-pink-500/10",
        iconColor: "text-rose-500",
    },
};

// Stats card skeleton for loading states
export function StatsCardSkeleton() {
    return (
        <div className="relative h-full p-5 bg-background animate-pulse">
            <div className="flex items-center justify-between mb-4">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-4 w-4 bg-muted rounded" />
            </div>
            <div className="h-9 w-12 bg-muted rounded mb-2" />
            <div className="h-3 w-16 bg-muted rounded" />
        </div>
    );
}
