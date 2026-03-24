import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query"
import AssignmentManager from "@/components/assignments/assignment-manager"
import { StudentAssignmentsView } from "@/components/assignments/student-assignments-view"
import { getCurrentUser } from "@/lib/get-current-user"
import { prisma } from "@workspace/database"
import { redirect } from "next/navigation"
import { assignmentKeys } from "@/hooks/queries/use-assignments"
import { getAssignmentsForUser } from "@/lib/dashboard-data"

export default async function AssignmentsPage() {
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

    const queryClient = new QueryClient()
    await queryClient.prefetchQuery({
        queryKey: assignmentKeys.lists(),
        queryFn: () => getAssignmentsForUser(dbUser),
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            {dbUser.role === "TEACHER" ? (
                <AssignmentManager />
            ) : (
                <StudentAssignmentsView />
            )}
        </HydrationBoundary>
    )
}
