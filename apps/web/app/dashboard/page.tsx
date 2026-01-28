/**
 * @file dashboard/page.tsx
 * @description Dashboard page.
 * @module Apps/Web/Dashboard
 * @access Private
 */

import { redirect } from "next/navigation"
import { prisma } from "@workspace/database"
import { getCurrentUser } from "@/lib/get-current-user"

import { AssignmentFeed } from "@/components/assignments/assignment-feed"
import { TeacherDashboard } from "@/components/assignments/teacher-dashboard"
import { StudentCourseCatalog } from "@/components/courses/student-course-catalog"
import { StudentAnnouncementFeed } from "@/components/announcements/student-announcement-feed"

export default async function Page() {
  const dbUser = await getCurrentUser()

  if (!dbUser) {
    redirect("/auth")
  }

  // Redirect to onboarding if not completed
  if (!dbUser.hasCompletedOnboarding) {
    redirect("/onboarding")
  }

  const teacherCourses = dbUser.role === 'TEACHER'
    ? await prisma.course.findMany({ where: { teacherId: dbUser.id }, select: { id: true, title: true } })
    : []

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 pt-4 overflow-y-auto w-full">
      {dbUser.role === 'TEACHER' ? (
        <TeacherDashboard courses={teacherCourses} />
      ) : (
        <div className="flex flex-1 flex-col gap-6 w-full h-full animate-in fade-in-50 duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/60 bg-clip-text">
                Welcome back, {dbUser.name?.split(' ')[0] || 'Student'}
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage your assignments and stay updated with your courses.
              </p>
            </div>
            <div className="w-full md:w-60">
              <StudentCourseCatalog />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-4">
              <section className="flex flex-col gap-4 h-full">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold tracking-tight">Active Assignments</h2>
                </div>
                <AssignmentFeed />
              </section>
            </div>

            <div className="space-y-6">
              <section className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold tracking-tight">Recent Announcements</h2>
                <StudentAnnouncementFeed />
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
