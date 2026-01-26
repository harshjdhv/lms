import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@workspace/database";

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

  const { title, content, imageUrl, courseId } = await req.json();

  if (!title || !courseId) {
    return new NextResponse("Missing title or courseId", { status: 400 });
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.teacherId !== dbUser.id) {
    return new NextResponse("Forbidden course access", { status: 403 });
  }

  const announcement = await prisma.announcement.create({
    data: {
      title,
      content,
      imageUrl,
      courseId,
    },
  });

  return NextResponse.json(announcement);
}

export async function GET() {
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
    // Teachers see all announcements for their courses, regardless of date?
    // Or maybe just valid ones? User said "annoucemnts disapepar after a week".
    // I will assume for teachers they might want to see history, but the user requirement implies they "disappear".
    // I'll stick to the 1 week rule for students. Teachers might want to see what they posted.
    // I'll return all for teachers for now, or maybe add a query param.
    // Let's return all for teachers so they can manage them (if we add delete later).

    // Actually, "annoucemnts disapepar after a week of being on teh annoucemtns page"
    // Usually teachers want to verify if it's there.
    // I'll allow teachers to see all, but maybe frontend can filter.

    const announcements = await prisma.announcement.findMany({
      where: { course: { teacherId: dbUser.id } },
      include: {
        course: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(announcements);
  } else {
    // Students see announcements from enrolled courses, created within last 7 days.
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
    return NextResponse.json(announcements);
  }
}
