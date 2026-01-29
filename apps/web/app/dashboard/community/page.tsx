/**
 * @file page.tsx
 * @description Community page with Discord-like interface for user interactions
 * @module Apps/Web/Dashboard/Community
 * @access Public
 */

"use client"

import { useState, useMemo, useEffect } from "react"
import { UserListSidebar } from "@/components/community/user-list-sidebar"
import { ChatInterface } from "@/components/community/chat-interface"
import { AddUserDialog } from "@/components/community/add-user-dialog"
import { Message, Chat } from "@/components/community/types"
import { useChatRealtime } from "@/hooks/use-chat-realtime"
import { toast } from "sonner"
import { useUserStore } from "@/providers/user-store-provider"

// Stable empty array constant to prevent creating new array references
const EMPTY_MESSAGES: Message[] = []

export default function CommunityPage() {
    const [chats, setChats] = useState<Chat[]>([])
    const [messages, setMessages] = useState<Record<string, Message[]>>({})
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
    const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
    const [loadingChats, setLoadingChats] = useState(true)
    const [loadingMessages, setLoadingMessages] = useState<Record<string, boolean>>({})
    const [sendingMessages, setSendingMessages] = useState<Record<string, boolean>>({})

    const currentUserId = useUserStore((state) => state.id)
    const currentUserName = useUserStore((state) => state.name || "You")
    const currentUserEmail = useUserStore((state) => state.email || "")
    const currentUserImage = useUserStore((state) => state.image)

    // Subscribe to Realtime updates for selected chat
    const { newMessage, clearNewMessage } = useChatRealtime(selectedChatId)
    
    // Memoize selected chat for quick sender lookup
    const selectedChat = useMemo(() => {
        if (!selectedChatId) return null
        return chats.find((c) => c.id === selectedChatId) ?? null
    }, [selectedChatId, chats])

    // Fetch chats on mount
    useEffect(() => {
        const fetchChats = async () => {
            try {
                setLoadingChats(true)
                const response = await fetch("/api/chat")
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}))
                    throw new Error(errorData.error || "Failed to fetch chats")
                }
                const data = await response.json()
                setChats(data.chats || [])
            } catch (error: any) {
                console.error("Fetch chats error:", error)
                toast.error(error.message || "Failed to load chats")
            } finally {
                setLoadingChats(false)
            }
        }

        fetchChats()
    }, [])

    // Fetch messages when a chat is selected
    useEffect(() => {
        if (!selectedChatId) {
            return
        }

        const fetchMessages = async () => {
            // Don't refetch if we already have messages for this chat
            if (messages[selectedChatId]) {
                return
            }

            try {
                setLoadingMessages((prev) => ({ ...prev, [selectedChatId]: true }))
                const response = await fetch(`/api/chat/${selectedChatId}/messages`)
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}))
                    throw new Error(errorData.error || "Failed to fetch messages")
                }
                const data = await response.json()
                setMessages((prev) => ({
                    ...prev,
                    [selectedChatId]: data.messages || [],
                }))
            } catch (error: any) {
                console.error("Fetch messages error:", error)
                toast.error(error.message || "Failed to load messages")
            } finally {
                setLoadingMessages((prev) => ({ ...prev, [selectedChatId]: false }))
            }
        }

        fetchMessages()
        // Only depend on selectedChatId, not messages to avoid infinite loops
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedChatId])

    // Handle new messages from Realtime - display immediately for instant updates
    useEffect(() => {
        if (!newMessage || !selectedChatId || !newMessage.id) {
            return
        }

        // Skip if this is an optimistic message (temp ID)
        if (newMessage.id.startsWith("temp-")) {
            clearNewMessage()
            return
        }

        const messageId = newMessage.id
        const messageSenderId = newMessage.senderId

        // Get sender info from the selected chat (we already have this data)
        const senderInfo = selectedChat?.otherUser?.id === messageSenderId 
            ? selectedChat.otherUser 
            : {
                id: currentUserId,
                name: currentUserName,
                email: currentUserEmail,
                avatar: currentUserImage,
            }

        // Create message object immediately from Realtime payload
        const realtimeMessage: Message = {
            id: messageId,
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

        // Add message immediately - no API call needed!
        setMessages((prev) => {
            const existingMessages = prev[selectedChatId] || []
            
            // Remove optimistic messages from the same sender with same content
            const filteredMessages = existingMessages.filter((m) => {
                if (m.id.startsWith("temp-") && 
                    m.senderId === messageSenderId &&
                    m.content === newMessage.content) {
                    return false
                }
                return true
            })
            
            // Check if message already exists
            const messageExists = filteredMessages.some((m) => m.id === messageId)
            if (messageExists) {
                return {
                    ...prev,
                    [selectedChatId]: filteredMessages,
                }
            }
            
            return {
                ...prev,
                [selectedChatId]: [...filteredMessages, realtimeMessage],
            }
        })

        // Update chat's last message immediately
        setChats((prev) =>
            prev.map((chat) =>
                chat.id === selectedChatId
                    ? {
                          ...chat,
                          lastMessage: {
                              id: messageId,
                              content: newMessage.content,
                              senderId: messageSenderId,
                              createdAt: newMessage.createdAt,
                          },
                          updatedAt: newMessage.createdAt,
                      }
                    : chat
            )
        )

        clearNewMessage()
    }, [newMessage?.id, selectedChatId, selectedChat, currentUserId, currentUserName, currentUserEmail, currentUserImage, clearNewMessage])

    const handleChatCreated = (chat: { id: string; otherUser: any }) => {
        // Add new chat to the list
        const newChat: Chat = {
            id: chat.id,
            otherUser: chat.otherUser,
            lastMessage: null,
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
        }
        setChats((prev) => [newChat, ...prev])
        setSelectedChatId(chat.id)
        setIsAddUserDialogOpen(false)
    }

    const handleSendMessage = async (content: string) => {
        if (!selectedChatId || !currentUserId) return

        // Create optimistic message immediately for instant UI feedback
        const tempId = `temp-${Date.now()}-${Math.random()}`
        const optimisticMessage: Message = {
            id: tempId,
            chatId: selectedChatId,
            senderId: currentUserId,
            content: content.trim(),
            createdAt: new Date().toISOString(),
            sender: {
                id: currentUserId,
                name: currentUserName,
                email: currentUserEmail,
                avatar: currentUserImage,
            },
        }

        // Add optimistic message immediately
        setMessages((prev) => {
            const existingMessages = prev[selectedChatId] || []
            return {
                ...prev,
                [selectedChatId]: [...existingMessages, optimisticMessage],
            }
        })

        // Update chat's last message optimistically
        setChats((prev) =>
            prev.map((chat) =>
                chat.id === selectedChatId
                    ? {
                          ...chat,
                          lastMessage: {
                              id: tempId,
                              content: content.trim(),
                              senderId: currentUserId,
                              createdAt: optimisticMessage.createdAt,
                          },
                          updatedAt: optimisticMessage.createdAt,
                      }
                    : chat
            )
        )

        setSendingMessages((prev) => ({ ...prev, [selectedChatId]: true }))

        try {
            const response = await fetch(`/api/chat/${selectedChatId}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to send message")
            }

            const data = await response.json()

            // Replace optimistic message with real message from server
            setMessages((prev) => {
                const existingMessages = prev[selectedChatId] || []
                // Remove optimistic message and add real one
                const filteredMessages = existingMessages.filter((m) => m.id !== tempId)
                // Check if real message already exists (might have come via Realtime)
                const messageExists = filteredMessages.some((m) => m.id === data.message.id)
                if (messageExists) {
                    return {
                        ...prev,
                        [selectedChatId]: filteredMessages,
                    }
                }
                return {
                    ...prev,
                    [selectedChatId]: [...filteredMessages, data.message],
                }
            })

            // Update chat's last message with real data
            setChats((prev) =>
                prev.map((chat) =>
                    chat.id === selectedChatId
                        ? {
                              ...chat,
                              lastMessage: {
                                  id: data.message.id,
                                  content: data.message.content,
                                  senderId: data.message.senderId,
                                  createdAt: data.message.createdAt,
                              },
                              updatedAt: data.message.createdAt,
                          }
                        : chat
                )
            )
        } catch (error: any) {
            console.error("Send message error:", error)
            
            // Remove optimistic message on error
            setMessages((prev) => {
                const existingMessages = prev[selectedChatId] || []
                return {
                    ...prev,
                    [selectedChatId]: existingMessages.filter((m) => m.id !== tempId),
                }
            })

            // Revert chat's last message
            setChats((prev) =>
                prev.map((chat) => {
                    if (chat.id === selectedChatId) {
                        const previousMessages = messages[selectedChatId] || []
                        const lastRealMessage = previousMessages
                            .filter((m) => !m.id.startsWith("temp-"))
                            .slice(-1)[0]
                        return {
                            ...chat,
                            lastMessage: lastRealMessage
                                ? {
                                      id: lastRealMessage.id,
                                      content: lastRealMessage.content,
                                      senderId: lastRealMessage.senderId,
                                      createdAt: lastRealMessage.createdAt,
                                  }
                                : null,
                            updatedAt: lastRealMessage?.createdAt || chat.updatedAt,
                        }
                    }
                    return chat
                })
            )

            toast.error(error.message || "Failed to send message")
        } finally {
            setSendingMessages((prev) => ({ ...prev, [selectedChatId]: false }))
        }
    }

    // Get the messages for the selected chat - use a stable reference
    const chatMessages = selectedChatId ? messages[selectedChatId] : undefined
    
    // Memoize messages array - only recreate when the actual messages change
    // Use the first and last message IDs as stable identifiers
    const selectedMessages = useMemo(() => {
        if (!chatMessages) return EMPTY_MESSAGES
        return chatMessages
    }, [chatMessages, chatMessages?.length, chatMessages?.[0]?.id, chatMessages?.[chatMessages.length - 1]?.id])
    
    // Memoize otherUser - only recreate when the user ID changes
    const selectedOtherUser = useMemo(() => {
        return selectedChat?.otherUser ?? null
    }, [selectedChat?.otherUser?.id])

    return (
        <div className="flex h-[calc(100vh-4rem)] min-h-0 overflow-hidden bg-background">
            <UserListSidebar
                chats={chats}
                selectedChatId={selectedChatId}
                onSelectChat={setSelectedChatId}
                onAddUserClick={() => setIsAddUserDialogOpen(true)}
                loading={loadingChats}
            />
            <ChatInterface
                user={selectedOtherUser}
                chatId={selectedChatId}
                messages={selectedMessages}
                onSendMessage={handleSendMessage}
                loading={selectedChatId ? loadingMessages[selectedChatId] ?? false : false}
                sending={selectedChatId ? sendingMessages[selectedChatId] ?? false : false}
            />
            <AddUserDialog
                open={isAddUserDialogOpen}
                onOpenChange={setIsAddUserDialogOpen}
                onChatCreated={handleChatCreated}
            />
        </div>
    )
}
