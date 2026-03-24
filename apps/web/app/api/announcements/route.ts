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

  const { title, content, imageUrl, courseId, semester } = await req.json();

  if (!title || (!courseId && !semester)) {
    return new NextResponse("Missing title or target", { status: 400 });
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

  const announcement = await prisma.announcement.create({
    data: {
      title,
      content,
      imageUrl,
      courseId: targetCourse.id,
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
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const announcements = await prisma.announcement.findMany({
      where: {
        ...(dbUser.semester
          ? { course: { semester: dbUser.semester, isPublished: true } }
          : { courseId: { in: dbUser.enrollments.map((e) => e.courseId) } }),
        createdAt: { gte: oneWeekAgo },
      },
      include: {
        course: { select: { title: true, semester: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(announcements);
  }
}
