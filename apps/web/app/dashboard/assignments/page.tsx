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

        return <AssignmentManager courses={courses} />
    }

    return <StudentAssignmentsView />
}
