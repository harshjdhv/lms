"use client"

import { useState } from "react"
import { TeacherAssignmentList } from "@/components/assignments/teacher-assignment-list"
import { CreateAssignmentSection } from "@/components/assignments/create-assignment-section"

interface Course {
    id: string
    title: string
}

export function TeacherDashboard({ courses }: { courses: Course[] }) {
    const [refresh, setRefresh] = useState(0)

    const handleCreated = () => {
        setRefresh(prev => prev + 1)
    }

    return (
        <div className="flex flex-col gap-8">
            <TeacherAssignmentList refreshTrigger={refresh} />
            <div id="create-section" className="scroll-mt-20">
                <CreateAssignmentSection courses={courses} onCreated={handleCreated} />
            </div>
        </div>
    )
}
