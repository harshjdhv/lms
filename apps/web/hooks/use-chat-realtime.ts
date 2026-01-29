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

    // Create a unique channel for this chat
    const channelName = `chat:${chatId}:messages`;
    const channel = supabase.channel(channelName);

    // Subscribe to INSERT events on messages table
    // Strategy: Listen to all INSERTs and filter in code (more reliable than server-side filters)
    const tableName = "Message";

    console.log(`🔍 Setting up Realtime subscription for chat ${chatId}`);
    console.log(`   Table: ${tableName}`);
    console.log(`   Listening to all INSERTs, filtering for chatId: ${chatId}`);

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
          // No filter - we'll filter in code for better reliability
        },
        (payload) => {
          console.log("📨 Realtime payload received:", payload);

          const messageData = (payload as any).new as {
            id: string;
            chatId: string;
            senderId: string;
            content: string;
            createdAt: string;
          };

          // Filter in code - only process messages for this chat
          if (messageData.chatId !== chatId) {
            console.log(
              `⏭️ Message for different chat (${messageData.chatId}), ignoring`,
            );
            return;
          }

          console.log(
            `✅ Processing Realtime message for chat ${chatId}:`,
            messageData.id,
          );

          // Set the new message immediately - no API call needed!
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
      .subscribe((status) => {
        console.log(
          `📡 Realtime subscription status for chat ${chatId}:`,
          status,
        );
        if (status === "SUBSCRIBED") {
          console.log(
            `✅ Realtime subscribed successfully! Messages will appear instantly`,
          );
        } else if (status === "CHANNEL_ERROR") {
          console.error(`❌ Realtime subscription error:`, status);
        } else if (status === "TIMED_OUT") {
          console.warn(`⏱️ Realtime subscription timed out`);
        } else if (status === "CLOSED") {
          console.log(`🔌 Realtime channel closed`);
        }
      });

    channelRef.current = channel;

    // Cleanup: unsubscribe when component unmounts or chatId changes
    return () => {
      console.log(`🧹 Cleaning up Realtime subscription for chat ${chatId}`);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [chatId, supabase]);

  return { newMessage, clearNewMessage };
}
