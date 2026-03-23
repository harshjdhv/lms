"use client";

import { useState, useRef, useEffect } from "react";
import { User, Message } from "./types";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Textarea } from "@workspace/ui/components/textarea";
import { Send, MessageSquare, Loader2, ArrowLeft } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { useUserStore } from "@/providers/user-store-provider";

interface ChatInterfaceProps {
    user: User | null | undefined;
    chatId: string | null;
    messages: Message[];
    onSendMessage: (content: string) => void;
    loading?: boolean;
    sending?: boolean;
    onBack?: () => void;
}

const HATCH = {
    backgroundImage: "repeating-linear-gradient(45deg, var(--color-border) 0, var(--color-border) 1px, transparent 0, transparent 50%)",
    backgroundSize: "6px 6px",
};

export function ChatInterface({
    user,
    chatId,
    messages,
    onSendMessage,
    loading = false,
    sending = false,
    onBack,
}: ChatInterfaceProps) {
    const [input, setInput] = useState("");
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const currentUserId = useUserStore((state) => state.id || "");
    const currentUserName = useUserStore((state) => state.name || "User");
    const currentUserImage = useUserStore((state) => state.image);

    useEffect(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('[data-slot="scroll-area-viewport"]');
            if (viewport) viewport.scrollTop = viewport.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !user || !chatId || sending) return;
        const messageContent = input.trim();
        setInput("");
        await onSendMessage(messageContent);
    };

    const formatTimestamp = (timestamp: string | Date) => {
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const isYesterday = date.toDateString() === new Date(now.getTime() - 86400000).toDateString();

        if (isToday) return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
        if (isYesterday) return `Yesterday ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
        return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    };

    const getInitials = (name: string) =>
        name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

    if (!user) {
        return (
            <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-background gap-4 text-center px-6" style={HATCH}>
                <div className="bg-background border border-border p-4">
                    <MessageSquare className="h-7 w-7 text-muted-foreground" />
                </div>
                <div className="bg-background px-4 py-2 border border-border">
                    <p className="text-sm font-medium">Select a conversation</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Choose a chat from the sidebar</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-background">
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0">
                {onBack && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="md:hidden h-8 w-8 rounded-none shrink-0 -ml-1"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                )}
                <div className="relative shrink-0">
                    <Avatar className="h-8 w-8 border border-border">
                        {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                        <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    {user.isOnline && (
                        <div className="absolute bottom-0 right-0 h-2 w-2 bg-emerald-500 border-2 border-background rounded-full" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                        {user.isOnline ? "Online" : user.lastSeen ? `Last seen ${formatTimestamp(user.lastSeen)}` : "Offline"}
                    </p>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 min-h-0">
                <div className="px-5 py-4 space-y-3">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                            <p className="text-xs text-muted-foreground">Loading messages...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                            <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
                            <p className="text-sm font-medium">No messages yet</p>
                            <p className="text-xs text-muted-foreground">Start the conversation below.</p>
                        </div>
                    ) : (
                        messages.map((message) => {
                            const isCurrentUser = message.senderId === currentUserId;
                            const name = isCurrentUser ? currentUserName : message.sender.name;
                            const avatar = isCurrentUser ? currentUserImage : message.sender.avatar;

                            return (
                                <div
                                    key={message.id}
                                    className={cn("flex gap-2.5 items-end", isCurrentUser ? "flex-row-reverse" : "flex-row")}
                                >
                                    <Avatar className="h-6 w-6 shrink-0 border border-border mb-0.5">
                                        {avatar && <AvatarImage src={avatar} alt={name} />}
                                        <AvatarFallback className="text-[10px]">{getInitials(name || "U")}</AvatarFallback>
                                    </Avatar>
                                    <div className={cn("flex flex-col gap-1 max-w-[68%]", isCurrentUser ? "items-end" : "items-start")}>
                                        <div
                                            className={cn(
                                                "rounded-lg px-4 py-2 text-sm",
                                                isCurrentUser
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted"
                                            )}
                                        >
                                            <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground px-0.5">
                                            {formatTimestamp(message.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t p-4 shrink-0 bg-background">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Message ${user.name}...`}
                        className="min-h-[60px] max-h-[120px] resize-none"
                        disabled={sending || !chatId}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey && !sending) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!input.trim() || sending || !chatId}
                        className="shrink-0"
                    >
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            </div>
        </div>
    );
}
