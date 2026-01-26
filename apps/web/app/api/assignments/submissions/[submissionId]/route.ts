import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@workspace/database";

export async function PATCH(
  req: Request,
  props: { params: Promise<{ submissionId: string }> },
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

  const { status, feedback } = await req.json();

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return new NextResponse("Invalid status", { status: 400 });
  }

  // Verify ownership via nested query
  const submission = await prisma.assignmentSubmission.findUnique({
    where: { id: params.submissionId },
    include: { assignment: { include: { course: true } } },
  });

  if (!submission || submission.assignment.course.teacherId !== dbUser.id) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const updated = await prisma.assignmentSubmission.update({
    where: { id: params.submissionId },
    data: {
      status,
      feedback,
    },
  });

  return NextResponse.json(updated);
}
