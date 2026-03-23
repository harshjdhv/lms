"use client"

import { TeacherMentorshipView } from "@/components/mentorship/teacher-mentorship-view"
import { StudentMentorshipView } from "@/components/mentorship/student-mentorship-view"
import { useUserStore } from "@/providers/user-store-provider"

export default function MentorshipPage() {
    const role = useUserStore((state) => state.role)
    const name = useUserStore((state) => state.name || (role === "TEACHER" ? "Teacher" : "Student"))

    return (
        <div className="flex w-full min-w-0 flex-col animate-in fade-in-50 duration-500">
            {role === "TEACHER" ? (
                <TeacherMentorshipView userName={name} />
            ) : (
                <StudentMentorshipView userName={name} />
            )}
        </div>
    )
}

