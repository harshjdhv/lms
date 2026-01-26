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

  const { title, content, courseId, attachmentUrl, dueDate } = await req.json();

  if (!title || !content || !courseId) {
    return new NextResponse("Missing fields", { status: 400 });
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.teacherId !== dbUser.id) {
    return new NextResponse("Forbidden course access", { status: 403 });
  }

  const assignment = await prisma.assignment.create({
    data: {
      title,
      content,
      courseId,
      attachmentUrl,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: dueDate ? "ACTIVE" : "ACTIVE",
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
    return NextResponse.json(assignments);
  } else {
    // For students, show all assignments (Active, Stopped) so they can see history
    // But maybe filter out "REVIEW" if that was a thing (not using it much yet)
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
    return NextResponse.json(assignments);
  }
}
