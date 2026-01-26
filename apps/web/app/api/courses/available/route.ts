import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@workspace/database";

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

  const enrolledIds = dbUser.enrollments.map((e) => e.courseId);

  // Fetch published courses user is NOT enrolled in
  const courses = await prisma.course.findMany({
    where: {
      isPublished: true,
      id: { notIn: enrolledIds },
    },
    include: {
      teacher: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(courses);
}
