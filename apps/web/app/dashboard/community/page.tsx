/**
 * @file page.tsx
 * @description Community page with Discord-like interface for user interactions
 * @module Apps/Web/Dashboard/Community
 * @access Public
 */

"use client"

import { useState, useMemo } from "react"
import { UserListSidebar } from "@/components/community/user-list-sidebar"
import { ChatInterface } from "@/components/community/chat-interface"
import { AddUserDialog } from "@/components/community/add-user-dialog"
import { Message, User } from "@/components/community/types"

// Dummy data for users and messages
const initialUsers: User[] = [
    {
        id: "1",
        name: "Alice Johnson",
        email: "alice.johnson@example.com",
        avatar: null,
        isOnline: true,
        lastSeen: new Date(),
    },
    {
        id: "2",
        name: "Bob Smith",
        email: "bob.smith@example.com",
        avatar: null,
        isOnline: true,
        lastSeen: new Date(),
    },
    {
        id: "3",
        name: "Charlie Brown",
        email: "charlie.brown@example.com",
        avatar: null,
        isOnline: false,
        lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
    },
    {
        id: "4",
        name: "Diana Prince",
        email: "diana.prince@example.com",
        avatar: null,
        isOnline: true,
        lastSeen: new Date(),
    },
    {
        id: "5",
        name: "Eve Wilson",
        email: "eve.wilson@example.com",
        avatar: null,
        isOnline: false,
        lastSeen: new Date(Date.now() - 7200000), // 2 hours ago
    },
]

const initialMessages: Record<string, Message[]> = {
    "1": [
        {
            id: "m1",
            userId: "1",
            content: "Hey! How's the project going?",
            timestamp: new Date(Date.now() - 86400000), // 1 day ago
        },
        {
            id: "m2",
            userId: "current",
            content: "It's going well! Just finished the first milestone.",
            timestamp: new Date(Date.now() - 82800000), // 23 hours ago
        },
        {
            id: "m3",
            userId: "1",
            content: "That's awesome! Can you share the details?",
            timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        },
    ],
    "2": [
        {
            id: "m4",
            userId: "2",
            content: "Did you see the new assignment?",
            timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        },
        {
            id: "m5",
            userId: "current",
            content: "Yes! It looks challenging but interesting.",
            timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        },
    ],
    "3": [
        {
            id: "m6",
            userId: "3",
            content: "Thanks for helping me with the code yesterday!",
            timestamp: new Date(Date.now() - 172800000), // 2 days ago
        },
        {
            id: "m7",
            userId: "current",
            content: "No problem! Happy to help anytime.",
            timestamp: new Date(Date.now() - 172440000), // 2 days ago
        },
    ],
    "4": [
        {
            id: "m8",
            userId: "4",
            content: "Are we still meeting tomorrow?",
            timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        },
    ],
    "5": [],
}

// Stable empty array constant to prevent creating new array references
const EMPTY_MESSAGES: Message[] = []

export default function CommunityPage() {
    const [users, setUsers] = useState<User[]>(initialUsers)
    const [messages, setMessages] = useState<Record<string, Message[]>>(initialMessages)
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
    const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)

    const handleAddUser = (email: string, name: string) => {
        const newUser: User = {
            id: Date.now().toString(),
            name,
            email,
            avatar: null,
            isOnline: false,
            lastSeen: new Date(),
        }
        setUsers([...users, newUser])
        setMessages({ ...messages, [newUser.id]: [] })
        setIsAddUserDialogOpen(false)
    }

    const handleSendMessage = (content: string) => {
        if (!selectedUserId) return

        const newMessage: Message = {
            id: `m${Date.now()}`,
            userId: "current",
            content,
            timestamp: new Date(),
        }

        setMessages({
            ...messages,
            [selectedUserId]: [...(messages[selectedUserId] || []), newMessage],
        })
    }

    const selectedUser = useMemo(
        () => (selectedUserId ? users.find((u) => u.id === selectedUserId) : null),
        [users, selectedUserId]
    )

    // Memoize messages array to prevent creating new array reference on each render
    const selectedMessages = useMemo(
        () => (selectedUserId ? messages[selectedUserId] || EMPTY_MESSAGES : EMPTY_MESSAGES),
        [messages, selectedUserId]
    )

    return (
        <div className="flex h-[calc(100vh-4rem)] min-h-0 overflow-hidden bg-background">
            <UserListSidebar
                users={users}
                selectedUserId={selectedUserId}
                onSelectUser={setSelectedUserId}
                onAddUserClick={() => setIsAddUserDialogOpen(true)}
            />
            <ChatInterface
                user={selectedUser}
                messages={selectedMessages}
                onSendMessage={handleSendMessage}
            />
            <AddUserDialog
                open={isAddUserDialogOpen}
                onOpenChange={setIsAddUserDialogOpen}
                onAddUser={handleAddUser}
            />
        </div>
    )
}
