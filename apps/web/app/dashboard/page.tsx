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

  const serialize = (data: any) => JSON.parse(JSON.stringify(data))
  const prefetchAssignments = queryClient.prefetchQuery({
    queryKey: assignmentKeys.lists(),
    queryFn: async () => {
      if (dbUser.role === "TEACHER") {
        const assignments = await prisma.assignment.findMany({
          where: { course: { teacherId: dbUser.id } },
          include: {
            course: { select: { title: true } },
            _count: { select: { submissions: true } },
          },
          orderBy: { createdAt: "desc" },
        })
        return serialize(assignments)
      }

      const courseIds = dbUser.enrollments.map((e) => e.courseId)
      const assignments = await prisma.assignment.findMany({
        where: {
          courseId: { in: courseIds },
        },
        include: {
          course: { select: { title: true } },
          submissions: {
            where: { studentId: dbUser.id },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
      })
      return serialize(assignments)
    },
  })

  const prefetchAnnouncements = queryClient.prefetchQuery({
    queryKey: announcementKeys.lists(),
    queryFn: async () => {
      if (dbUser.role === "TEACHER") {
        const announcements = await prisma.announcement.findMany({
          where: { course: { teacherId: dbUser.id } },
          include: {
            course: { select: { title: true } },
          },
          orderBy: { createdAt: "desc" },
        })
        return serialize(announcements)
      }

      const courseIds = dbUser.enrollments.map((e) => e.courseId)
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      const announcements = await prisma.announcement.findMany({
        where: {
          courseId: { in: courseIds },
          createdAt: { gte: oneWeekAgo },
        },
        include: {
          course: { select: { title: true } },
        },
        orderBy: { createdAt: "desc" },
      })
      return serialize(announcements)
    },
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
