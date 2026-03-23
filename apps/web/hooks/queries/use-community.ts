import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Chat, Message, User } from "@/components/community/types";

export const communityKeys = {
  all: ["community"] as const,
  chats: () => [...communityKeys.all, "chats"] as const,
  messages: (chatId: string) =>
    [...communityKeys.all, "messages", chatId] as const,
};

async function fetchChats(): Promise<Chat[]> {
  const response = await fetch("/api/chat");
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to fetch chats");
  }
  const data = await response.json();
  return data.chats || [];
}

async function fetchMessages(chatId: string): Promise<Message[]> {
  const response = await fetch(`/api/chat/${chatId}/messages`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to fetch messages");
  }
  const data = await response.json();
  return data.messages || [];
}

export function useChats() {
  return useQuery({
    queryKey: communityKeys.chats(),
    queryFn: fetchChats,
    staleTime: 3 * 60 * 1000,
  });
}

export function useChatMessages(chatId: string | null) {
  return useQuery({
    queryKey: communityKeys.messages(chatId || "none"),
    queryFn: () => fetchMessages(chatId!),
    enabled: !!chatId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to create chat");
      }

      const data = await response.json();
      return data.chat as { id: string; otherUser: User };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.chats() });
    },
  });
}

