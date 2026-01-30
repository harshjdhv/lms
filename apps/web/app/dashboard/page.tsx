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

  // Prefetch Assignments
  await queryClient.prefetchQuery({
    queryKey: assignmentKeys.lists(),
    queryFn: async () => {
      // Safe helper to deep copy and ensure serialization compatibility (Dates -> Strings)
      const serialize = (data: any) => JSON.parse(JSON.stringify(data))

      // Auto-expire assignments
      await prisma.assignment.updateMany({
        where: {
          status: "ACTIVE",
          dueDate: { lt: new Date() },
        },
        data: { status: "STOPPED" },
      });

      if (dbUser.role === "TEACHER") {
        const assignments = await prisma.assignment.findMany({
          where: { course: { teacherId: dbUser.id } },
          include: {
            course: { select: { title: true } },
            _count: { select: { submissions: true } },
          },
          orderBy: { createdAt: "desc" },
        });
        return serialize(assignments);
      } else {
        const courseIds = dbUser.enrollments.map((e) => e.courseId);
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
        });
        return serialize(assignments);
      }
    }
  })

  // Prefetch Announcements
  await queryClient.prefetchQuery({
    queryKey: announcementKeys.lists(),
    queryFn: async () => {
      const serialize = (data: any) => JSON.parse(JSON.stringify(data))

      if (dbUser.role === "TEACHER") {
        const announcements = await prisma.announcement.findMany({
          where: { course: { teacherId: dbUser.id } },
          include: {
            course: { select: { title: true } },
          },
          orderBy: { createdAt: "desc" },
        });
        return serialize(announcements);
      } else {
        const courseIds = dbUser.enrollments.map((e) => e.courseId);
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const announcements = await prisma.announcement.findMany({
          where: {
            courseId: { in: courseIds },
            createdAt: { gte: oneWeekAgo },
          },
          include: {
            course: { select: { title: true } },
          },
          orderBy: { createdAt: "desc" },
        });
        return serialize(announcements);
      }
    }
  })

  const teacherCourses = dbUser.role === 'TEACHER'
    ? await prisma.course.findMany({ where: { teacherId: dbUser.id }, select: { id: true, title: true } })
    : []

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-1 flex-col gap-8 p-4 pt-4 overflow-y-auto w-full">
        {dbUser.role === 'TEACHER' ? (
          <TeacherDashboard courses={teacherCourses} teacherName={dbUser.name || 'Teacher'} />
        ) : (
          <StudentDashboard studentName={dbUser.name || 'Student'} />
        )}
      </div>
    </HydrationBoundary>
  )
}
