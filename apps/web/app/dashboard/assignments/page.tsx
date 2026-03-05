/**
 * @file dashboard/assignments/page.tsx
 * @description Assignments page.
 * @module Apps/Web/Dashboard/Assignments
 * @access Private
 */

import { redirect } from "next/navigation"
import { prisma } from "@workspace/database"
import { getCurrentUser } from "@/lib/get-current-user"
import AssignmentManager from "@/components/assignments/assignment-manager"
import { StudentAssignmentsView } from "@/components/assignments/student-assignments-view"

export default async function AssignmentsPage() {
    const user = await getCurrentUser()

    if (!user) {
        redirect("/auth")
    }

    if (user.role === "TEACHER") {
        const courses = await prisma.course.findMany({
            where: { teacherId: user.id },
            select: { id: true, title: true },
        })

        return (
            <div className="p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight pb-1.5">Assignments</h1>
                    <p className="text-muted-foreground pb-1.5">Manage existing assignments or create new ones for your students.</p>
                </div>
                <AssignmentManager courses={courses} />
            </div>
        )
    }

    return <StudentAssignmentsView />
}
