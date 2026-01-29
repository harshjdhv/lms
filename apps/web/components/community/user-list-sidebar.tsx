/**
 * @file user-list-sidebar.tsx
 * @description Sidebar component displaying list of users/chats with add user functionality
 * @module Apps/Web/Components/Community
 * @access Public
 */

"use client"

import { Chat } from "./types"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Plus, Users as UsersIcon } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

interface UserListSidebarProps {
    chats: Chat[]
    selectedChatId: string | null
    onSelectChat: (chatId: string) => void
    onAddUserClick: () => void
    loading?: boolean
}

export function UserListSidebar({
    chats,
    selectedChatId,
    onSelectChat,
    onAddUserClick,
    loading = false,
}: UserListSidebarProps) {
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    const formatTimestamp = (timestamp: string | Date) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return "just now"
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return date.toLocaleDateString()
    }

    const formatLastMessage = (content: string, maxLength: number = 50) => {
        if (content.length <= maxLength) return content
        return content.substring(0, maxLength) + "..."
    }

    return (
        <div className="flex flex-col w-80 border-r bg-muted/30 min-h-0 shrink-0">
            <div className="flex items-center justify-between p-4 border-b shrink-0">
                <div className="flex items-center gap-2">
                    <UsersIcon className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-semibold">Community</h2>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onAddUserClick}
                    className="h-8 w-8"
                    title="Add new user"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            <ScrollArea className="flex-1 min-h-0">
                <div className="p-2 space-y-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                            <UsersIcon className="h-12 w-12 text-muted-foreground mb-2 animate-pulse" />
                            <p className="text-sm text-muted-foreground">Loading chats...</p>
                        </div>
                    ) : chats.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                            <UsersIcon className="h-12 w-12 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground mb-4">
                                No chats yet. Start a conversation!
                            </p>
                            <Button onClick={onAddUserClick} size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                New Chat
                            </Button>
                        </div>
                    ) : (
                        chats.map((chat) => (
                            <button
                                key={chat.id}
                                onClick={() => onSelectChat(chat.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
                                    "hover:bg-accent hover:text-accent-foreground",
                                    selectedChatId === chat.id
                                        ? "bg-accent text-accent-foreground"
                                        : ""
                                )}
                            >
                                <div className="relative">
                                    <Avatar size="default">
                                        {chat.otherUser.avatar && (
                                            <AvatarImage src={chat.otherUser.avatar} alt={chat.otherUser.name} />
                                        )}
                                        <AvatarFallback>{getInitials(chat.otherUser.name)}</AvatarFallback>
                                    </Avatar>
                                    {chat.otherUser.isOnline && (
                                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium truncate">{chat.otherUser.name}</p>
                                        {chat.lastMessage && (
                                            <span className="text-xs text-muted-foreground shrink-0 ml-2">
                                                {formatTimestamp(chat.lastMessage.createdAt)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {chat.lastMessage ? (
                                            <span className="text-xs text-muted-foreground truncate">
                                                {formatLastMessage(chat.lastMessage.content)}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">
                                                No messages yet
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
