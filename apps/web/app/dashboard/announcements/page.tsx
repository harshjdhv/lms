"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { StudentAnnouncementsView } from "@/components/announcements/student-announcements-view"
import { useUserStore } from "@/providers/user-store-provider"

export default function AnnouncementsPage() {
    const router = useRouter()
    const role = useUserStore((state) => state.role)

    useEffect(() => {
        if (role === "TEACHER") {
            router.replace("/dashboard")
        }
    }, [role, router])

    if (role === "TEACHER") {
        return null
    }

    return <StudentAnnouncementsView />
}

