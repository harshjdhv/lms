import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@workspace/database";

export async function PUT(
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

  const { list } = await req.json(); // list: { id: string, position: number }[]

  if (!list || !Array.isArray(list)) {
    return new NextResponse("Invalid list", { status: 400 });
  }

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

  // Update positions in a transaction
  await prisma.$transaction(
    list.map((item) =>
      prisma.chapter.update({
        where: { id: item.id },
        data: { position: item.position },
      }),
    ),
  );

  return new NextResponse("Success", { status: 200 });
}
