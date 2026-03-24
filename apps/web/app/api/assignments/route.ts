import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@workspace/database";

// const prisma = new PrismaClient();

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  });
  if (!dbUser || dbUser.role !== "TEACHER") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { title, content, courseId, semester, attachmentUrl, dueDate } = await req.json();

  if (!title || !content || (!courseId && !semester)) {
    return new NextResponse("Missing fields", { status: 400 });
  }

  const targetCourse = courseId
    ? await prisma.course.findFirst({
        where: { id: courseId, teacherId: dbUser.id },
        select: { id: true },
      })
    : await prisma.course.findFirst({
        where: { teacherId: dbUser.id, semester },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });

  if (!targetCourse) {
    return new NextResponse("No matching courses found", { status: 404 });
  }

  const assignment = await prisma.assignment.create({
    data: {
      title,
      content,
      courseId: targetCourse.id,
      attachmentUrl,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: "ACTIVE",
    },
  });

  return NextResponse.json(assignment);
}

export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: { enrollments: true },
  });

  if (!dbUser) return new NextResponse("User not found", { status: 404 });

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

  if (dbUser.role === "TEACHER") {
    const assignments = await prisma.assignment.findMany({
      where: { course: { teacherId: dbUser.id } },
      include: {
        course: { select: { title: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(assignments.map(withComputedStatus));
  } else {
    const assignments = await prisma.assignment.findMany({
      where: {
        ...(dbUser.semester
          ? { course: { semester: dbUser.semester, isPublished: true } }
          : { courseId: { in: dbUser.enrollments.map((e) => e.courseId) } }),
      },
      include: {
        course: { select: { title: true, semester: true } },
        submissions: {
          where: { studentId: dbUser.id },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(assignments.map(withComputedStatus));
  }
}
