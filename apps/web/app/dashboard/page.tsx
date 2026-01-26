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
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </div>
          {dbUser.role === 'STUDENT' && <div className="w-full max-w-[200px]"><StudentCourseCatalog /></div>}
        </header>

        <div className="flex flex-1 flex-col gap-8 p-6 pt-6">
          {dbUser.role === 'TEACHER' ? (
            <TeacherDashboard courses={teacherCourses} />
          ) : (
            <>
              <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center text-muted-foreground">
                  Stats Placeholder
                </div>
                <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center text-muted-foreground">
                  Recent Activity
                </div>
                <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center text-muted-foreground">
                  Upcoming
                </div>
              </div>
              <div className="flex-1 rounded-xl md:min-h-min">
                <AssignmentFeed />
              </div>
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
