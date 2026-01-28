import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@workspace/database";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { courseId } = await params;
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

  const { title } = await req.json();

  // Verify ownership
  const courseOwner = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    select: { teacherId: true },
  });

  if (!courseOwner || courseOwner.teacherId !== dbUser.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Find the last chapter to determine position
  const lastChapter = await prisma.chapter.findFirst({
    where: { courseId },
    orderBy: { position: "desc" },
  });

  const newPosition = lastChapter ? lastChapter.position + 1 : 1;

  const chapter = await prisma.chapter.create({
    data: {
      title,
      courseId,
      position: newPosition,
      isPublished: true, // Auto-publish for easier DX, can be toggled later
    },
  });

  return NextResponse.json(chapter);
}
