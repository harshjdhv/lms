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
  if (!dbUser) return new NextResponse("User not found", { status: 404 });

  const { courseId } = await req.json();

  if (!courseId) return new NextResponse("Course ID required", { status: 400 });

  // Check if already enrolled
  const existing = await prisma.enrollment.findFirst({
    where: { userId: dbUser.id, courseId },
  });

  if (existing) {
    return new NextResponse("Already enrolled", { status: 400 });
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      userId: dbUser.id,
      courseId,
    },
  });

  return NextResponse.json(enrollment);
}
