import { prisma } from "@workspace/database";
import type { Enrollment, User } from "@workspace/database";

import { serializeForHydration } from "@/lib/serialize";

type UserWithOptionalEnrollments = User & { enrollments?: Pick<Enrollment, "courseId">[] };

export async function getAssignmentsForUser(user: UserWithOptionalEnrollments) {
  const now = new Date();
  const withComputedStatus = <T extends { status: string; dueDate: Date | null }>(
    assignment: T,
  ) => ({
    ...assignment,
    status:
      assignment.status === "ACTIVE" &&
      assignment.dueDate &&
      assignment.dueDate < now
        ? "STOPPED"
        : assignment.status,
  });

  if (user.role === "TEACHER") {
    const assignments = await prisma.assignment.findMany({
      where: { course: { teacherId: user.id } },
      include: {
        course: { select: { title: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return serializeForHydration(assignments.map(withComputedStatus));
  }

  const courseIds = (user.enrollments ?? []).map((enrollment) => enrollment.courseId);
  const assignments = await prisma.assignment.findMany({
    where: {
      courseId: { in: courseIds },
    },
    include: {
      course: { select: { title: true } },
      submissions: {
        where: { studentId: user.id },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return serializeForHydration(assignments.map(withComputedStatus));
}

export async function getAnnouncementsForUser(user: UserWithOptionalEnrollments) {
  if (user.role === "TEACHER") {
    const announcements = await prisma.announcement.findMany({
      where: { course: { teacherId: user.id } },
      include: {
        course: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return serializeForHydration(announcements);
  }

  const courseIds = (user.enrollments ?? []).map((enrollment) => enrollment.courseId);
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

  return serializeForHydration(announcements);
}

export async function getMyCoursesForUser(user: User) {
  if (user.role === "TEACHER") {
    const courses = await prisma.course.findMany({
      where: { teacherId: user.id },
      include: {
        _count: {
          select: { chapters: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return serializeForHydration(courses);
  }

  const courses = await prisma.course.findMany({
    where: {
      OR: [
        {
          enrollments: {
            some: {
              userId: user.id,
            },
          },
        },
        ...(user.semester
          ? [
              {
                semester: user.semester,
                isPublished: true,
              },
            ]
          : []),
      ],
    },
    include: {
      teacher: { select: { name: true } },
      _count: { select: { chapters: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return serializeForHydration(courses);
}

export async function getMentorshipDataForUser(user: User) {
  if (user.role === "TEACHER") {
    const [mentees, requirements, submissions, folders] = await Promise.all([
      prisma.mentorship.findMany({
        where: { mentorId: user.id },
        include: {
          mentee: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              studentId: true,
              grade: true,
              semester: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.documentRequirement.findMany({
        where: { mentorId: user.id },
        include: {
          _count: { select: { submissions: true } },
          folder: { select: { id: true, name: true, color: true, icon: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.documentSubmission.findMany({
        where: {
          requirement: { mentorId: user.id },
        },
        include: {
          requirement: {
            select: { id: true, title: true, category: true, folderId: true },
          },
          student: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
        orderBy: { submittedAt: "desc" },
      }),
      prisma.documentFolder.findMany({
        where: { mentorId: user.id },
        include: {
          _count: { select: { requirements: true } },
        },
        orderBy: { position: "asc" },
      }),
    ]);

    const activeMentees = mentees.filter((mentee) => mentee.status === "ACTIVE").length;
    const pendingDocuments = submissions.filter(
      (submission) => submission.status === "PENDING",
    ).length;
    const completedDocuments = submissions.filter(
      (submission) => submission.status === "APPROVED",
    ).length;

    return serializeForHydration({
      mentor: null,
      mentees,
      requirements,
      submissions,
      folders,
      stats: {
        totalMentees: mentees.length,
        activeMentees,
        pendingDocuments,
        completedDocuments,
      },
    });
  }

  const mentorship = await prisma.mentorship.findFirst({
    where: { menteeId: user.id, status: "ACTIVE" },
    include: {
      mentor: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          expertise: true,
          title: true,
        },
      },
    },
  });

  const [requirements, submissions, folders] = await Promise.all([
    mentorship
      ? prisma.documentRequirement.findMany({
          where: { mentorId: mentorship.mentorId },
          include: {
            folder: { select: { id: true, name: true, color: true, icon: true } },
          },
          orderBy: [{ isRequired: "desc" }, { dueDate: "asc" }],
        })
      : Promise.resolve([]),
    prisma.documentSubmission.findMany({
      where: { studentId: user.id },
      include: {
        requirement: {
          select: { id: true, title: true, category: true, dueDate: true, folderId: true },
        },
      },
      orderBy: { submittedAt: "desc" },
    }),
    mentorship
      ? prisma.documentFolder.findMany({
          where: { mentorId: mentorship.mentorId },
          include: {
            _count: { select: { requirements: true } },
          },
          orderBy: { position: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const pendingDocuments = submissions.filter(
    (submission) => submission.status === "PENDING",
  ).length;
  const completedDocuments = submissions.filter(
    (submission) => submission.status === "APPROVED",
  ).length;
  const totalRequired = requirements.filter((requirement) => requirement.isRequired).length;

  return serializeForHydration({
    mentor: mentorship?.mentor || null,
    mentees: [],
    requirements,
    submissions,
    folders,
    stats: {
      totalMentees: 0,
      activeMentees: 0,
      pendingDocuments,
      completedDocuments,
      totalRequired,
    },
  });
}
