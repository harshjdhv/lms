"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface EnrollButtonProps {
    courseId: string;
    variant?: "default" | "outline";
    size?: "default" | "sm" | "lg";
    className?: string;
}

export function EnrollButton({
    courseId,
    variant = "default",
    size = "default",
    className
}: EnrollButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();

    const onClick = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/courses/${courseId}/enroll`, {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Something went wrong");
            }

            setIsSuccess(true);
            toast.success("Enrolled successfully!");

            // Brief delay to show success state before refresh
            setTimeout(() => {
                router.refresh();
            }, 500);
        } catch {
            toast.error("Something went wrong");
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={onClick}
            disabled={isLoading || isSuccess}
            size={size}
            variant={variant}
            className={cn(
                "relative overflow-hidden transition-all duration-300",
                isSuccess && "bg-emerald-500 hover:bg-emerald-500 text-white",
                className
            )}
        >
            {isLoading ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enrolling...
                </>
            ) : isSuccess ? (
                <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Enrolled!
                </>
            ) : (
                <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Enroll for Free
                </>
            )}
        </Button>
    );
}
