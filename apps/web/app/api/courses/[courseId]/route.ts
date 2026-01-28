import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@workspace/database";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { courseId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: {
        orderBy: { position: "asc" },
      },
      attachments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!course) return new NextResponse("Course not found", { status: 404 });

  return NextResponse.json(course);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { courseId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { title, description, isPublished, price } = await req.json();

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  });

  if (!dbUser || dbUser.role !== "TEACHER") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Verify ownership
  const existingCourse = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!existingCourse) {
    return new NextResponse("Not Found", { status: 404 });
  }

  if (existingCourse.teacherId !== dbUser.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const course = await prisma.course.update({
    where: { id: courseId },
    data: {
      title,
      description,
      isPublished,
      price,
    },
  });

  return NextResponse.json(course);
}
