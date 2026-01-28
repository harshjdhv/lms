"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface EnrollButtonProps {
    courseId: string;
}

export function EnrollButton({ courseId }: EnrollButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
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

            toast.success("Enrolled successfully");
            router.refresh();
        } catch {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button onClick={onClick} disabled={isLoading} size="sm" className="w-full md:w-auto">
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Enroll for Free
        </Button>
    );
}
