/**
 * @file dashboard/page.tsx
 * @description Dashboard page.
 * @module Apps/Web/Dashboard
 * @access Private
 */

import { redirect } from "next/navigation"
import { prisma } from "@workspace/database"
import { getCurrentUser } from "@/lib/get-current-user"
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { assignmentKeys } from "@/hooks/queries/use-assignments"
import { announcementKeys } from "@/hooks/queries/use-announcements"
import { getAnnouncementsForUser, getAssignmentsForUser } from "@/lib/dashboard-data"

import { TeacherDashboard } from "@/components/assignments/teacher-dashboard"
import { StudentDashboard } from "@/components/dashboard/student-dashboard"

export default async function Page() {
  const authUser = await getCurrentUser()

  if (!authUser) {
    redirect("/auth")
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: { enrollments: true },
  })

  if (!dbUser) {
    redirect("/auth")
  }

  // Redirect to onboarding if not completed
  if (!dbUser.hasCompletedOnboarding) {
    redirect("/onboarding")
  }

  const queryClient = new QueryClient()
  const prefetchAssignments = queryClient.prefetchQuery({
    queryKey: assignmentKeys.lists(),
    queryFn: () => getAssignmentsForUser(dbUser),
  })

  const prefetchAnnouncements = queryClient.prefetchQuery({
    queryKey: announcementKeys.lists(),
    queryFn: () => getAnnouncementsForUser(dbUser),
  })

  const teacherCoursesPromise =
    dbUser.role === "TEACHER"
      ? prisma.course.findMany({
          where: { teacherId: dbUser.id },
          select: { id: true, title: true },
        })
      : Promise.resolve([])

  const [, , teacherCourses] = await Promise.all([
    prefetchAssignments,
    prefetchAnnouncements,
    teacherCoursesPromise,
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-1 w-full min-w-0 flex-col">
        {dbUser.role === 'TEACHER' ? (
          <TeacherDashboard courses={teacherCourses} teacherName={dbUser.name || 'Teacher'} />
        ) : (
          <StudentDashboard studentName={dbUser.name || 'Student'} />
        )}
      </div>
    </HydrationBoundary>
  )
}
