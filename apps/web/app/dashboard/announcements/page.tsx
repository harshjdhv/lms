import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query"
import { StudentAnnouncementsView } from "@/components/announcements/student-announcements-view"
import { getCurrentUser } from "@/lib/get-current-user"
import { prisma } from "@workspace/database"
import { redirect } from "next/navigation"
import { announcementKeys } from "@/hooks/queries/use-announcements"
import { getAnnouncementsForUser } from "@/lib/dashboard-data"

export default async function AnnouncementsPage() {
    const user = await getCurrentUser()

    if (!user) {
        redirect("/auth")
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { enrollments: true },
    })

    if (!dbUser) {
        redirect("/auth")
    }

    if (dbUser.role === "TEACHER") {
        redirect("/dashboard")
    }

    const queryClient = new QueryClient()
    await queryClient.prefetchQuery({
        queryKey: announcementKeys.lists(),
        queryFn: () => getAnnouncementsForUser(dbUser),
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <StudentAnnouncementsView />
        </HydrationBoundary>
    )
}
