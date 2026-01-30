/**
 * @file components/ui/progress-ring.tsx
 * @description Circular progress indicator component with smooth animations
 * @module Apps/Web/Components/UI
 */

"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
    progress: number; // 0-100
    size?: "sm" | "md" | "lg";
    strokeWidth?: number;
    label?: string;
    sublabel?: string;
    showPercentage?: boolean;
    color?: "primary" | "emerald" | "blue" | "purple" | "amber";
    className?: string;
}

const sizeConfig = {
    sm: { size: 64, fontSize: "text-lg" },
    md: { size: 96, fontSize: "text-2xl" },
    lg: { size: 128, fontSize: "text-3xl" },
};

const colorConfig = {
    primary: "stroke-primary",
    emerald: "stroke-emerald-500",
    blue: "stroke-blue-500",
    purple: "stroke-purple-500",
    amber: "stroke-amber-500",
};

export function ProgressRing({
    progress,
    size = "md",
    strokeWidth = 8,
    label,
    sublabel,
    showPercentage = true,
    color = "primary",
    className,
}: ProgressRingProps) {
    const { size: ringSize, fontSize } = sizeConfig[size];
    const radius = (ringSize - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const clampedProgress = Math.min(100, Math.max(0, progress));
    const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

    return (
        <div className={cn("relative inline-flex items-center justify-center", className)}>
            <svg
                width={ringSize}
                height={ringSize}
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={radius}
                    fill="none"
                    className="stroke-muted"
                    strokeWidth={strokeWidth}
                />

                {/* Progress circle */}
                <motion.circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={radius}
                    fill="none"
                    className={cn(colorConfig[color])}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{
                        strokeDasharray: circumference,
                    }}
                />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {showPercentage && (
                    <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className={cn("font-bold", fontSize)}
                    >
                        {Math.round(clampedProgress)}%
                    </motion.span>
                )}
                {label && (
                    <span className="text-xs text-muted-foreground font-medium">
                        {label}
                    </span>
                )}
                {sublabel && (
                    <span className="text-xs text-muted-foreground">
                        {sublabel}
                    </span>
                )}
            </div>
        </div>
    );
}

// Mini progress ring for inline use
export function MiniProgressRing({
    progress,
    color = "primary",
}: {
    progress: number;
    color?: "primary" | "emerald" | "blue" | "purple" | "amber";
}) {
    const size = 24;
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <svg width={size} height={size} className="transform -rotate-90">
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                className="stroke-muted"
                strokeWidth={strokeWidth}
            />
            <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                className={cn(colorConfig[color])}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ strokeDasharray: circumference }}
            />
        </svg>
    );
}
