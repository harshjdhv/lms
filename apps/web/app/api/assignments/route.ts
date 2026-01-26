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

  const { title, content, courseId, attachmentUrl } = await req.json();

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

  if (dbUser.role === "TEACHER") {
    const assignments = await prisma.assignment.findMany({
      where: { course: { teacherId: dbUser.id } },
      include: { course: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(assignments);
  } else {
    const courseIds = dbUser.enrollments.map((e) => e.courseId);
    const assignments = await prisma.assignment.findMany({
      where: {
        courseId: { in: courseIds },
        status: "ACTIVE", // Only show active assignments to students
      },
      include: { course: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(assignments);
  }
}
