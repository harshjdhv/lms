import { useEffect, useRef, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { mentorshipKeys } from "@/hooks/queries/use-mentorship";

const WATCHED_TABLES = [
    "DocumentSubmission",
    "DocumentRequirement",
    "DocumentFolder",
    "Mentorship",
];

export function useMentorshipRealtime() {
    const queryClient = useQueryClient();
    const supabase = useMemo(() => createClient(), []);
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

    useEffect(() => {
        const channel = supabase.channel("mentorship:changes");

        WATCHED_TABLES.forEach((table) => {
            channel.on(
                "postgres_changes" as any,
                { event: "*", schema: "public", table },
                () => {
                    queryClient.invalidateQueries({ queryKey: mentorshipKeys.all });
                }
            );
        });

        channel.subscribe();
        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [supabase, queryClient]);
}
