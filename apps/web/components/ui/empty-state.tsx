/**
 * @file components/ui/empty-state.tsx
 * @description Beautiful empty state component with customizable styling
 * @module Apps/Web/Components/UI
 */

"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import type { LucideIcon } from "lucide-react";

interface EmptyStateAction {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: LucideIcon;
    variant?: "default" | "outline" | "secondary";
}

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: EmptyStateAction;
    secondaryAction?: EmptyStateAction;
    iconColor?: string;
    iconBgColor?: string;
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    secondaryAction,
    iconColor = "text-primary",
    iconBgColor = "bg-primary/10",
    className,
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Card className={cn("border-dashed", className)}>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                        className={cn("rounded-full p-4 mb-4", iconBgColor)}
                    >
                        <Icon className={cn("h-8 w-8", iconColor)} />
                    </motion.div>

                    <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="text-lg font-semibold mb-2"
                    >
                        {title}
                    </motion.h3>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground mb-6 max-w-sm"
                    >
                        {description}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="flex items-center gap-3"
                    >
                        {action && (
                            <Button
                                variant={action.variant || "default"}
                                onClick={action.onClick}
                                asChild={!!action.href}
                                className="gap-2"
                            >
                                {action.href ? (
                                    <a href={action.href}>
                                        {action.icon && <action.icon className="h-4 w-4" />}
                                        {action.label}
                                    </a>
                                ) : (
                                    <>
                                        {action.icon && <action.icon className="h-4 w-4" />}
                                        {action.label}
                                    </>
                                )}
                            </Button>
                        )}
                        {secondaryAction && (
                            <Button
                                variant={secondaryAction.variant || "outline"}
                                onClick={secondaryAction.onClick}
                                asChild={!!secondaryAction.href}
                                className="gap-2"
                            >
                                {secondaryAction.href ? (
                                    <a href={secondaryAction.href}>
                                        {secondaryAction.icon && <secondaryAction.icon className="h-4 w-4" />}
                                        {secondaryAction.label}
                                    </a>
                                ) : (
                                    <>
                                        {secondaryAction.icon && <secondaryAction.icon className="h-4 w-4" />}
                                        {secondaryAction.label}
                                    </>
                                )}
                            </Button>
                        )}
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

// Common empty state presets
export const emptyStatePresets = {
    noAssignments: {
        title: "No Assignments",
        description: "There are no assignments to display right now.",
        iconColor: "text-blue-500",
        iconBgColor: "bg-blue-500/10",
    },
    noCourses: {
        title: "No Courses Found",
        description: "You haven't created or enrolled in any courses yet.",
        iconColor: "text-purple-500",
        iconBgColor: "bg-purple-500/10",
    },
    noSubmissions: {
        title: "No Submissions",
        description: "No submissions have been received yet.",
        iconColor: "text-amber-500",
        iconBgColor: "bg-amber-500/10",
    },
    noAnnouncements: {
        title: "No Announcements",
        description: "There are no recent announcements to display.",
        iconColor: "text-emerald-500",
        iconBgColor: "bg-emerald-500/10",
    },
};
