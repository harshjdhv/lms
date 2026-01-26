import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@workspace/database";

export async function GET(
  req: Request,
  props: { params: Promise<{ assignmentId: string }> },
) {
  const params = await props.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  });

  if (!dbUser || dbUser.role !== "TEACHER")
    return new NextResponse("Forbidden", { status: 403 });

  // verify assignment belongs to teacher
  const assignment = await prisma.assignment.findUnique({
    where: { id: params.assignmentId },
    include: { course: true },
  });

  if (!assignment || assignment.course.teacherId !== dbUser.id) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const submissions = await prisma.assignmentSubmission.findMany({
    where: { assignmentId: params.assignmentId },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(submissions);
}
