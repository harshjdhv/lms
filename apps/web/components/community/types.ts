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
    isOnline: boolean
    lastSeen: Date
}

export interface Message {
    id: string
    userId: string // "current" for current user, otherwise user id
    content: string
    timestamp: Date
}
