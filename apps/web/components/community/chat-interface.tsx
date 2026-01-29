/**
 * @file chat-interface.tsx
 * @description Chat interface component displaying messages and input for sending new messages
 * @module Apps/Web/Components/Community
 * @access Public
 */

"use client"

import { useState, useRef, useEffect } from "react"
import { User, Message } from "./types"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Textarea } from "@workspace/ui/components/textarea"
import { Send, MessageSquare } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { useUserStore } from "@/providers/user-store-provider"

interface ChatInterfaceProps {
    user: User | null | undefined
    messages: Message[]
    onSendMessage: (content: string) => void
}

export function ChatInterface({ user, messages, onSendMessage }: ChatInterfaceProps) {
    const [input, setInput] = useState("")
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    // Select individual values to avoid creating new object references on each render
    const currentUserName = useUserStore((state) => state.name || "User")
    const currentUserImage = useUserStore((state) => state.image)

    useEffect(() => {
        // Scroll to bottom when messages change
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('[data-slot="scroll-area-viewport"]')
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight
            }
        }
    }, [messages])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || !user) return

        onSendMessage(input.trim())
        setInput("")
    }

    const formatTimestamp = (timestamp: Date) => {
        const date = new Date(timestamp)
        const now = new Date()
        const isToday = date.toDateString() === now.toDateString()
        const isYesterday =
            date.toDateString() === new Date(now.getTime() - 86400000).toDateString()

        if (isToday) {
            return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
        } else if (isYesterday) {
            return `Yesterday ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
        } else {
            return date.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
            })
        }
    }

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    if (!user) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                        <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                        <p className="text-sm text-muted-foreground">
                            Choose a user from the sidebar to start chatting
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col flex-1 bg-background">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b">
                <Avatar size="default">
                    {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <h3 className="text-base font-semibold">{user.name}</h3>
                    <div className="flex items-center gap-2">
                        {user.isOnline ? (
                            <>
                                <div className="h-2 w-2 bg-green-500 rounded-full" />
                                <span className="text-xs text-muted-foreground">Online</span>
                            </>
                        ) : (
                            <span className="text-xs text-muted-foreground">
                                Last seen {formatTimestamp(user.lastSeen)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                            <h4 className="text-sm font-semibold mb-2">No messages yet</h4>
                            <p className="text-sm text-muted-foreground">
                                Start the conversation by sending a message!
                            </p>
                        </div>
                    ) : (
                        messages.map((message) => {
                            const isCurrentUser = message.userId === "current"
                            const messageUserName = isCurrentUser ? currentUserName : user.name
                            const messageUserImage = isCurrentUser ? currentUserImage : user.avatar

                            return (
                                <div
                                    key={message.id}
                                    className={cn(
                                        "flex gap-3",
                                        isCurrentUser ? "flex-row-reverse" : "flex-row"
                                    )}
                                >
                                    <Avatar size="sm" className="shrink-0">
                                        {messageUserImage && (
                                            <AvatarImage src={messageUserImage} alt={messageUserName} />
                                        )}
                                        <AvatarFallback>
                                            {getInitials(messageUserName || "U")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div
                                        className={cn(
                                            "flex flex-col gap-1 max-w-[70%]",
                                            isCurrentUser ? "items-end" : "items-start"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "rounded-lg px-4 py-2 text-sm",
                                                isCurrentUser
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted"
                                            )}
                                        >
                                            <p className="whitespace-pre-wrap break-words">{message.content}</p>
                                        </div>
                                        <span className="text-xs text-muted-foreground px-1">
                                            {formatTimestamp(message.timestamp)}
                                        </span>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t p-4">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Message ${user.name}...`}
                        className="min-h-[60px] max-h-[120px] resize-none"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                handleSubmit(e)
                            }
                        }}
                    />
                    <Button type="submit" size="icon" disabled={!input.trim()} className="shrink-0">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    )
}
