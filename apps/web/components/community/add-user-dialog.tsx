/**
 * @file add-user-dialog.tsx
 * @description Dialog component for adding new users to the community via email
 * @module Apps/Web/Components/Community
 * @access Public
 */

"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { toast } from "sonner"
import { User } from "./types"

interface AddUserDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onChatCreated: (chat: { id: string; otherUser: User }) => void
}

export function AddUserDialog({ open, onOpenChange, onChatCreated }: AddUserDialogProps) {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [searchResults, setSearchResults] = useState<User[]>([])
    const [searching, setSearching] = useState(false)

    const handleSearch = async (searchQuery: string) => {
        if (!searchQuery.trim() || searchQuery.length < 2) {
            setSearchResults([])
            return
        }

        setSearching(true)
        try {
            const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
            if (!response.ok) {
                throw new Error("Failed to search users")
            }
            const data = await response.json()
            setSearchResults(data.users || [])
        } catch (error) {
            console.error("Search error:", error)
            toast.error("Failed to search users")
            setSearchResults([])
        } finally {
            setSearching(false)
        }
    }

    const handleSelectUser = async (user: User) => {
        setLoading(true)
        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId: user.id }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to create chat")
            }

            const data = await response.json()
            onChatCreated(data.chat)
            setEmail("")
            setSearchResults([])
            onOpenChange(false)
            toast.success(`Started chat with ${user.name}`)
        } catch (error: any) {
            console.error("Create chat error:", error)
            toast.error(error.message || "Failed to create chat")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!email.trim()) {
            toast.error("Email is required")
            return
        }

        if (!email.includes("@")) {
            toast.error("Please enter a valid email address")
            return
        }

        await handleSearch(email.trim())
    }

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setEmail("")
            setSearchResults([])
        }
        onOpenChange(newOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Start New Chat</DialogTitle>
                    <DialogDescription>
                        Search for a user by email or name to start a new conversation.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Search by Email or Name</Label>
                        <Input
                            id="email"
                            type="text"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value)
                                handleSearch(e.target.value)
                            }}
                            placeholder="user@example.com or name"
                            disabled={loading}
                        />
                    </div>
                    {searching && (
                        <p className="text-sm text-muted-foreground">Searching...</p>
                    )}
                    {searchResults.length > 0 && (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            <Label>Select a user:</Label>
                            <div className="space-y-1">
                                {searchResults.map((user) => (
                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => handleSelectUser(user)}
                                        disabled={loading}
                                        className="w-full text-left p-3 rounded-lg border hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="font-medium">{user.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {user.email}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {!searching && searchResults.length === 0 && email.length >= 2 && (
                        <p className="text-sm text-muted-foreground">No users found</p>
                    )}
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
