/**
 * @file user-list-sidebar.tsx
 * @description Sidebar component displaying list of users/chats with add user functionality
 * @module Apps/Web/Components/Community
 * @access Public
 */

"use client"

import { User } from "./types"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Plus, Users as UsersIcon } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

interface UserListSidebarProps {
    users: User[]
    selectedUserId: string | null
    onSelectUser: (userId: string) => void
    onAddUserClick: () => void
}

export function UserListSidebar({
    users,
    selectedUserId,
    onSelectUser,
    onAddUserClick,
}: UserListSidebarProps) {
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    const formatLastSeen = (lastSeen: Date) => {
        const now = new Date()
        const diffMs = now.getTime() - lastSeen.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return "just now"
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return lastSeen.toLocaleDateString()
    }

    return (
        <div className="flex flex-col w-80 border-r bg-muted/30">
            <div className="flex items-center justify-between p-4 border-b">
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
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                            <UsersIcon className="h-12 w-12 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground mb-4">
                                No users yet. Add someone to get started!
                            </p>
                            <Button onClick={onAddUserClick} size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add User
                            </Button>
                        </div>
                    ) : (
                        users.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => onSelectUser(user.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
                                    "hover:bg-accent hover:text-accent-foreground",
                                    selectedUserId === user.id
                                        ? "bg-accent text-accent-foreground"
                                        : ""
                                )}
                            >
                                <div className="relative">
                                    <Avatar size="default">
                                        {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                    </Avatar>
                                    {user.isOnline && (
                                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium truncate">{user.name}</p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {user.isOnline ? (
                                            <span className="text-xs text-green-600 dark:text-green-400">
                                                Online
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                {formatLastSeen(user.lastSeen)}
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
