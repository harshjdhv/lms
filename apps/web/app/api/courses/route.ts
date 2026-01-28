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

  const { title, description, semester } = await req.json();

  if (!title) {
    return new NextResponse("Title is required", { status: 400 });
  }

  const course = await prisma.course.create({
    data: {
      title,
      description,
      teacherId: dbUser.id,
      isPublished: true, // Auto-publish for now
      semester: semester || "SEM-7", // Default fallback
    },
  });

  return NextResponse.json(course);
}

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
  if (dbUser.role === "TEACHER") {
    courses = await prisma.course.findMany({
      where: { teacherId: dbUser.id },
      orderBy: { createdAt: "desc" },
    });
  } else {
    // For students, return all published courses for now
    // TODO: Filter by enrollment if needed, or semester
    courses = await prisma.course.findMany({
      where: { isPublished: true },
      include: {
        teacher: {
          select: { name: true },
        },
        chapters: {
          where: { isPublished: true },
          select: { id: true }, // Count chapters
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return NextResponse.json(courses);
}
