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

  const { title, description, semester } = await req.json();

  if (!title) {
    return new NextResponse("Title is required", { status: 400 });
  }

  const course = await prisma.course.create({
    data: {
      title,
      description,
      teacherId: dbUser.id,
      isPublished: true, // Auto-publish for now,
      semester: semester || "SEM-7", // Default fallback
    },
  });

  return NextResponse.json(course);
}
