import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export interface RealtimeMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
}

export function useChatRealtime(chatId: string | null) {
  const [newMessage, setNewMessage] = useState<RealtimeMessage | null>(null);
  const channelRef = useRef<ReturnType<
    ReturnType<typeof createClient>["channel"]
  > | null>(null);

  // Memoize supabase client to prevent recreating it
  const supabase = useMemo(() => createClient(), []);

  // Memoize clearNewMessage to prevent recreating it
  const clearNewMessage = useCallback(() => {
    setNewMessage(null);
  }, []);

  useEffect(() => {
    if (!chatId) {
      return;
    }

    const channelName = `chat:${chatId}:messages`;
    const channel = supabase.channel(channelName);
    const tableName = "Message";

    channel
      .on<
        RealtimePostgresChangesPayload<{
          [key: string]: any;
        }>
      >(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: tableName,
          filter: `chatId=eq.${chatId}`,
        },
        (payload) => {
          const messageData = (payload as any).new as {
            id: string;
            chatId: string;
            senderId: string;
            content: string;
            createdAt: string;
          };

          if (messageData.chatId !== chatId) {
            return;
          }
          setNewMessage({
            id: messageData.id,
            chatId: messageData.chatId,
            senderId: messageData.senderId,
            content: messageData.content,
            createdAt: messageData.createdAt,
            sender: {
              id: messageData.senderId,
              name: "",
              email: "",
              avatar: null,
            },
          });
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [chatId, supabase]);

  return { newMessage, clearNewMessage };
}
