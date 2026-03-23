"use client"

import { MyCoursesView } from "@/components/courses/my-courses-view"
import { useUserStore } from "@/providers/user-store-provider"

export default function MyCoursesPage() {
    const role = useUserStore((state) => state.role)
    const isTeacher = role === "TEACHER"

    return <MyCoursesView isTeacher={isTeacher} />
}

