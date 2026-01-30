/**
 * @file components/ui/stats-card.tsx
 * @description Unified stats card component with gradient backgrounds and animations
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
    gradient,
    iconColor,
    index = 0,
    className,
}: StatsCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={cn("group", className)}
        >
            <div
                className={cn(
                    "relative overflow-hidden rounded-xl border-0 shadow-lg p-6",
                    "transition-all duration-300 hover:shadow-xl",
                    `bg-gradient-to-br ${gradient}`
                )}
            >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/5 blur-2xl" />

                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-muted-foreground">
                        {title}
                    </span>
                    <div
                        className={cn(
                            "p-2 rounded-lg bg-background/80 backdrop-blur-sm shadow-sm",
                            "transition-transform duration-300 group-hover:scale-110",
                            iconColor
                        )}
                    >
                        <Icon className="h-4 w-4" />
                    </div>
                </div>

                {/* Value */}
                <div className="text-3xl font-bold tracking-tight">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </div>

                {/* Description */}
                {description && (
                    <p className={cn("text-xs mt-1", trendColors[trend])}>
                        {description}
                    </p>
                )}
            </div>
        </motion.div>
    );
}

// Preset gradient configurations for easy use
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
        <div className="relative overflow-hidden rounded-xl border-0 shadow-lg p-6 bg-muted/20 animate-pulse">
            <div className="flex items-center justify-between mb-3">
                <div className="h-4 w-24 bg-muted/50 rounded" />
                <div className="h-8 w-8 bg-muted/50 rounded-lg" />
            </div>
            <div className="h-8 w-16 bg-muted/50 rounded mb-2" />
            <div className="h-3 w-20 bg-muted/50 rounded" />
        </div>
    );
}
