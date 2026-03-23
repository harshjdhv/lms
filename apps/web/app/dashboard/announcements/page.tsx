/**
 * @file dashboard/announcements/page.tsx
 * @description Student announcements page.
 * @module Apps/Web/Dashboard/Announcements
 * @access Private
 */

import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/get-current-user"
import { StudentAnnouncementsView } from "@/components/announcements/student-announcements-view"

export default async function AnnouncementsPage() {
    const user = await getCurrentUser()

    if (!user) {
        redirect("/auth")
    }

    if (user.role === "TEACHER") {
        redirect("/dashboard")
    }

    return <StudentAnnouncementsView />
}
