"use client"

import { useUserStore } from "@/providers/user-store-provider"
import AssignmentManager from "@/components/assignments/assignment-manager"
import { StudentAssignmentsView } from "@/components/assignments/student-assignments-view"

export default function AssignmentsPage() {
    const role = useUserStore((state) => state.role)

    if (role === "TEACHER") {
        return <AssignmentManager />
    }

    return <StudentAssignmentsView />
}

