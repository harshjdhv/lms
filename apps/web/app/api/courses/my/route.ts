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
  });

  if (!dbUser) return new NextResponse("User not found", { status: 404 });

  let courses;
  const isTeacher = dbUser.role === "TEACHER";

  if (isTeacher) {
    courses = await prisma.course.findMany({
      where: { teacherId: dbUser.id },
      include: {
        _count: {
          select: { chapters: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } else {
    // Fetch enrolled courses for students
    courses = await prisma.course.findMany({
      where: {
        OR: [
          {
            enrollments: {
              some: {
                userId: dbUser.id,
              },
            },
          },
          ...(dbUser.semester
            ? [
                {
                  semester: dbUser.semester,
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
  }

  return NextResponse.json(courses);
}
