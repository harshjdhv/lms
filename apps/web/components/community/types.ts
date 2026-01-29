/**
 * @file types.ts
 * @description Type definitions for community features
 * @module Apps/Web/Components/Community
 * @access Public
 */

export interface User {
    id: string
    name: string
    email: string
    avatar: string | null
    isOnline?: boolean
    lastSeen?: Date
}

export interface Message {
    id: string
    chatId: string
    senderId: string
    content: string
    createdAt: string | Date
    sender: {
        id: string
        name: string
        email: string
        avatar: string | null
    }
}

export interface Chat {
    id: string
    otherUser: User
    lastMessage: {
        id: string
        content: string
        senderId: string
        createdAt: string | Date
    } | null
    updatedAt: string | Date
    createdAt: string | Date
}
