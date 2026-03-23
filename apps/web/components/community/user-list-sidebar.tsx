"use client"

import { Chat } from "./types"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Plus, MessageSquare } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

interface UserListSidebarProps {
    chats: Chat[]
    selectedChatId: string | null
    onSelectChat: (chatId: string) => void
    onAddUserClick: () => void
    loading?: boolean
    mobileHidden?: boolean
}

export function UserListSidebar({
    chats,
    selectedChatId,
    onSelectChat,
    onAddUserClick,
    loading = false,
    mobileHidden = false,
}: UserListSidebarProps) {
    const getInitials = (name: string) =>
        name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

    const formatTimestamp = (timestamp: string | Date) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return "now"
        if (diffMins < 60) return `${diffMins}m`
        if (diffHours < 24) return `${diffHours}h`
        if (diffDays < 7) return `${diffDays}d`
        return date.toLocaleDateString()
    }

    return (
        <div className={cn("flex flex-col w-full md:w-72 min-h-0 shrink-0", mobileHidden && "hidden md:flex")}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
                <span className="text-sm font-semibold tracking-tight">Direct Messages</span>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onAddUserClick}
                    className="h-7 w-7 rounded-none"
                    title="New conversation"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            <ScrollArea className="flex-1 min-h-0">
                {loading ? (
                    <div className="divide-y divide-border">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3">
                                <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                                    <div className="h-2.5 w-36 bg-muted/60 animate-pulse rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : chats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-6">
                        <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
                        <div>
                            <p className="text-sm font-medium">No conversations yet</p>
                            <p className="text-xs text-muted-foreground mt-1">Start a conversation with a peer or instructor.</p>
                        </div>
                        <Button onClick={onAddUserClick} size="sm" className="rounded-none gap-2">
                            <Plus className="h-4 w-4" />
                            New Chat
                        </Button>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {chats.map((chat) => (
                            <button
                                key={chat.id}
                                onClick={() => onSelectChat(chat.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-l-2",
                                    selectedChatId === chat.id
                                        ? "bg-muted/50 border-l-foreground"
                                        : "border-l-transparent hover:bg-muted/30"
                                )}
                            >
                                <div className="relative shrink-0">
                                    <Avatar className="h-8 w-8 border border-border">
                                        {chat.otherUser.avatar && (
                                            <AvatarImage src={chat.otherUser.avatar} alt={chat.otherUser.name} />
                                        )}
                                        <AvatarFallback className="text-xs">{getInitials(chat.otherUser.name)}</AvatarFallback>
                                    </Avatar>
                                    {chat.otherUser.isOnline && (
                                        <div className="absolute bottom-0 right-0 h-2 w-2 bg-emerald-500 border-2 border-background rounded-full" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-medium truncate">{chat.otherUser.name}</p>
                                        {chat.lastMessage && (
                                            <span className="text-[10px] text-muted-foreground shrink-0">
                                                {formatTimestamp(chat.lastMessage.createdAt)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                        {chat.lastMessage
                                            ? chat.lastMessage.content.length > 40
                                                ? chat.lastMessage.content.slice(0, 40) + "…"
                                                : chat.lastMessage.content
                                            : <span className="italic">No messages yet</span>
                                        }
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    )
}
