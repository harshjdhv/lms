/**
 * @file dashboard/page.tsx
 * @description Dashboard page using the sidebar-08 layout.
 * @module Apps/Web/Dashboard
 * @access Private
 */

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@workspace/database"
import { AppSidebar } from "@/components/app-sidebar"

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"

import { AssignmentFeed } from "@/components/assignments/assignment-feed"
import { TeacherDashboard } from "@/components/assignments/teacher-dashboard"
import { StudentCourseCatalog } from "@/components/courses/student-course-catalog"
import { StudentAnnouncementFeed } from "@/components/announcements/student-announcement-feed"

// const prisma = new PrismaClient()

export default async function Page() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  // Get user from database
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  })

  // Redirect to onboarding if not completed
  if (!dbUser || !dbUser.hasCompletedOnboarding) {
    redirect("/onboarding")
  }

  const teacherCourses = dbUser.role === 'TEACHER'
    ? await prisma.course.findMany({ where: { teacherId: dbUser.id }, select: { id: true, title: true } })
    : []

  return (
    <SidebarProvider>
      <AppSidebar user={dbUser} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-background z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </div>
          {dbUser.role === 'STUDENT' && <div className="w-full max-w-[200px]"><StudentCourseCatalog /></div>}
        </header>

        <div className="flex flex-1 flex-col gap-8 p-4 pt-4 overflow-y-auto">
          {dbUser.role === 'TEACHER' ? (
            <TeacherDashboard courses={teacherCourses} />
          ) : (
            <div className="flex flex-col gap-8 w-full">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back, {dbUser.name?.split(' ')[0] || 'Student'}! Here&apos;s what&apos;s happening today.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="tracking-tight text-sm font-medium">Enrolled Courses</h3>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold">4</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    +1 from last month
                  </p>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="tracking-tight text-sm font-medium">Assignments Due</h3>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <path d="M2 10h20" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold">1</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Due within 24 hours
                  </p>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="tracking-tight text-sm font-medium">Average Grade</h3>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold">92%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    +4% from last semester
                  </p>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="tracking-tight text-sm font-medium">Attendance</h3>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <line x1="20" x2="20" y1="8" y2="14" />
                      <line x1="23" x2="17" y1="11" y2="11" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold">98%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Excellent standing
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <StudentAnnouncementFeed />

                <section className="space-y-4">
                  <h2 className="text-xl font-semibold tracking-tight">Active Assignments</h2>
                  <AssignmentFeed />
                </section>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
