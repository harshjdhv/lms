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

interface AddUserDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAddUser: (email: string, name: string) => void
}

export function AddUserDialog({ open, onOpenChange, onAddUser }: AddUserDialogProps) {
    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)

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

        setLoading(true)

        // Simulate API call
        setTimeout(() => {
            const userName = name.trim() || email.split("@")[0]
            onAddUser(email.trim(), userName)
            setEmail("")
            setName("")
            setLoading(false)
            toast.success(`Added ${userName} to your community`)
        }, 500)
    }

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setEmail("")
            setName("")
        }
        onOpenChange(newOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                        Add a new user to your community by entering their email address.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@example.com"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Name (Optional)</Label>
                        <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Display name"
                            disabled={loading}
                        />
                        <p className="text-xs text-muted-foreground">
                            If not provided, the name will be derived from the email.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Adding..." : "Add User"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
