"use client"

import { useState } from "react"
import { TeacherAssignmentList } from "@/components/assignments/teacher-assignment-list"
import { CreateAssignmentSection } from "@/components/assignments/create-assignment-section"

import { CreateAnnouncementSection } from "@/components/announcements/create-announcement-section"
import { TeacherAnnouncementList } from "@/components/announcements/teacher-announcement-list"

interface Course {
    id: string
    title: string
}

export function TeacherDashboard({ courses }: { courses: Course[] }) {
    const [refresh, setRefresh] = useState(0)
    const [refreshAnnouncements, setRefreshAnnouncements] = useState(0)

    const handleCreated = () => {
        setRefresh(prev => prev + 1)
    }

    const handleAnnouncementCreated = () => {
        setRefreshAnnouncements(prev => prev + 1)
    }

    return (
        <div className="flex flex-col gap-12">
            <section className="flex flex-col gap-8">
                <TeacherAssignmentList refreshTrigger={refresh} />
                <div id="create-assignment-section" className="scroll-mt-20">
                    <CreateAssignmentSection courses={courses} onCreated={handleCreated} />
                </div>
            </section>

            <section className="flex flex-col gap-8 pt-8 border-t">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Announcements</h2>
                </div>
                <TeacherAnnouncementList refreshTrigger={refreshAnnouncements} />
                <div id="create-announcement-section" className="scroll-mt-20">
                    <CreateAnnouncementSection courses={courses} onCreated={handleAnnouncementCreated} />
                </div>
            </section>
        </div>
    )
}
