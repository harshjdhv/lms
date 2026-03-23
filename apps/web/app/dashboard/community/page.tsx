/**
 * @file page.tsx
 * @description Community page with Discord-like interface for user interactions
 * @module Apps/Web/Dashboard/Community
 * @access Public
 */

"use client"

import { useState, useMemo, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { UserListSidebar } from "@/components/community/user-list-sidebar"
import { ChatInterface } from "@/components/community/chat-interface"
import { AddUserDialog } from "@/components/community/add-user-dialog"
import { Message } from "@/components/community/types"
import { useChatRealtime } from "@/hooks/use-chat-realtime"
import { communityKeys, useChatMessages, useChats } from "@/hooks/queries/use-community"
import { useUserStore } from "@/providers/user-store-provider"

const EMPTY_MESSAGES: Message[] = []

export default function CommunityPage() {
    const queryClient = useQueryClient()

    const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
    const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
    const [sendingChatId, setSendingChatId] = useState<string | null>(null)

    const currentUserId = useUserStore((state) => state.id)
    const currentUserName = useUserStore((state) => state.name || "You")
    const currentUserEmail = useUserStore((state) => state.email || "")
    const currentUserImage = useUserStore((state) => state.image)

    const { data: chats = [], isLoading: loadingChats } = useChats()
    const { data: chatMessages, isLoading: loadingSelectedMessages } = useChatMessages(selectedChatId)

    const { newMessage, clearNewMessage } = useChatRealtime(selectedChatId)

    const selectedChat = useMemo(() => {
        if (!selectedChatId) return null
        return chats.find((chat) => chat.id === selectedChatId) ?? null
    }, [chats, selectedChatId])

    const selectedMessages = useMemo(() => {
        if (!chatMessages) return EMPTY_MESSAGES
        return chatMessages
    }, [chatMessages])

    useEffect(() => {
        if (!selectedChatId || !newMessage || !newMessage.id) return

        if (newMessage.id.startsWith("temp-")) {
            clearNewMessage()
            return
        }

        const messageSenderId = newMessage.senderId
        const senderInfo = selectedChat?.otherUser?.id === messageSenderId
            ? selectedChat.otherUser
            : {
                id: currentUserId,
                name: currentUserName,
                email: currentUserEmail,
                avatar: currentUserImage,
            }

        const realtimeMessage: Message = {
            id: newMessage.id,
            chatId: selectedChatId,
            senderId: messageSenderId,
            content: newMessage.content,
            createdAt: newMessage.createdAt,
            sender: {
                id: senderInfo.id,
                name: senderInfo.name || senderInfo.email,
                email: senderInfo.email,
                avatar: senderInfo.avatar,
            },
        }

        queryClient.setQueryData(
            communityKeys.messages(selectedChatId),
            (prev: Message[] | undefined) => {
                const existing = prev || []
                const withoutTemp = existing.filter(
                    (message) =>
                        !(
                            message.id.startsWith("temp-") &&
                            message.senderId === messageSenderId &&
                            message.content === newMessage.content
                        ),
                )

                if (withoutTemp.some((message) => message.id === newMessage.id)) {
                    return withoutTemp
                }

                return [...withoutTemp, realtimeMessage]
            },
        )

        queryClient.setQueryData(communityKeys.chats(), (prev: any[] | undefined) => {
            const existing = prev || []
            return existing.map((chat) =>
                chat.id === selectedChatId
                    ? {
                        ...chat,
                        lastMessage: {
                            id: newMessage.id,
                            content: newMessage.content,
                            senderId: messageSenderId,
                            createdAt: newMessage.createdAt,
                        },
                        updatedAt: newMessage.createdAt,
                    }
                    : chat,
            )
        })

        clearNewMessage()
    }, [
        clearNewMessage,
        currentUserEmail,
        currentUserId,
        currentUserImage,
        currentUserName,
        newMessage,
        queryClient,
        selectedChat,
        selectedChatId,
    ])

    const handleChatCreated = (chat: { id: string }) => {
        queryClient.invalidateQueries({ queryKey: communityKeys.chats() })
        setSelectedChatId(chat.id)
        setIsAddUserDialogOpen(false)
    }

    const handleSendMessage = async (content: string) => {
        if (!selectedChatId || !currentUserId) return

        const trimmed = content.trim()
        if (!trimmed) return

        const tempId = `temp-${Date.now()}-${Math.random()}`
        const optimisticMessage: Message = {
            id: tempId,
            chatId: selectedChatId,
            senderId: currentUserId,
            content: trimmed,
            createdAt: new Date().toISOString(),
            sender: {
                id: currentUserId,
                name: currentUserName,
                email: currentUserEmail,
                avatar: currentUserImage,
            },
        }

        queryClient.setQueryData(
            communityKeys.messages(selectedChatId),
            (prev: Message[] | undefined) => [...(prev || []), optimisticMessage],
        )

        queryClient.setQueryData(communityKeys.chats(), (prev: any[] | undefined) => {
            const existing = prev || []
            return existing.map((chat) =>
                chat.id === selectedChatId
                    ? {
                        ...chat,
                        lastMessage: {
                            id: tempId,
                            content: trimmed,
                            senderId: currentUserId,
                            createdAt: optimisticMessage.createdAt,
                        },
                        updatedAt: optimisticMessage.createdAt,
                    }
                    : chat,
            )
        })

        setSendingChatId(selectedChatId)

        try {
            const response = await fetch(`/api/chat/${selectedChatId}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content: trimmed }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || "Failed to send message")
            }

            const data = await response.json()
            const realMessage = data.message as Message

            queryClient.setQueryData(
                communityKeys.messages(selectedChatId),
                (prev: Message[] | undefined) => {
                    const existing = (prev || []).filter((message) => message.id !== tempId)
                    if (existing.some((message) => message.id === realMessage.id)) {
                        return existing
                    }
                    return [...existing, realMessage]
                },
            )

            queryClient.setQueryData(communityKeys.chats(), (prev: any[] | undefined) => {
                const existing = prev || []
                return existing.map((chat) =>
                    chat.id === selectedChatId
                        ? {
                            ...chat,
                            lastMessage: {
                                id: realMessage.id,
                                content: realMessage.content,
                                senderId: realMessage.senderId,
                                createdAt: realMessage.createdAt,
                            },
                            updatedAt: realMessage.createdAt,
                        }
                        : chat,
                )
            })
        } catch (error: any) {
            queryClient.setQueryData(
                communityKeys.messages(selectedChatId),
                (prev: Message[] | undefined) => (prev || []).filter((message) => message.id !== tempId),
            )
            queryClient.invalidateQueries({ queryKey: communityKeys.chats() })
            toast.error(error.message || "Failed to send message")
        } finally {
            setSendingChatId(null)
        }
    }

    const loadingMessages = selectedChatId ? loadingSelectedMessages : false
    const isSending = selectedChatId ? sendingChatId === selectedChatId : false

    return (
        <div className="flex w-full min-w-0 flex-col overflow-hidden h-[calc(100svh-4rem)]">
            <div className="flex min-h-0 flex-1 divide-x divide-border overflow-hidden">
                <UserListSidebar
                    chats={chats}
                    selectedChatId={selectedChatId}
                    onSelectChat={setSelectedChatId}
                    onAddUserClick={() => setIsAddUserDialogOpen(true)}
                    loading={loadingChats}
                    mobileHidden={!!selectedChatId}
                />
                <ChatInterface
                    user={selectedChat?.otherUser ?? null}
                    chatId={selectedChatId}
                    messages={selectedMessages}
                    onSendMessage={handleSendMessage}
                    loading={loadingMessages}
                    sending={isSending}
                    onBack={() => setSelectedChatId(null)}
                />
            </div>
            <AddUserDialog
                open={isAddUserDialogOpen}
                onOpenChange={setIsAddUserDialogOpen}
                onChatCreated={handleChatCreated}
            />
        </div>
    )
}

