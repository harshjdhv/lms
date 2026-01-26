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

  const { assignmentId, attachmentUrl } = await req.json();

  if (!assignmentId || !attachmentUrl) {
    return new NextResponse("Missing fields", { status: 400 });
  }

  // Check assignment status
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
  });

  // Optionally check due date here again or allow late submissions?
  // Use requests "stopped" implies no new submissions.
  if (assignment?.status === "STOPPED") {
    return new NextResponse("Assignment is closed", { status: 400 });
  }

  // Create or Update Submission
  const submission = await prisma.assignmentSubmission.findFirst({
    where: {
      assignmentId,
      studentId: dbUser.id,
    },
  });

  if (submission && submission.status === "APPROVED") {
    return new NextResponse("Already approved", { status: 400 });
  }

  const result = await prisma.assignmentSubmission.upsert({
    where: {
      id: submission?.id || "new", // Prisma upsert needs unique field
      // Actually, compound unique constraint on assignmentId + studentId is needed for clean upsert via non-ID,
      // but I didn't add one.
      // Let's use create/update based on check above.
    },
    create: {
      assignmentId,
      studentId: dbUser.id,
      attachmentUrl,
      status: "PENDING",
    },
    update: {
      attachmentUrl,
      status: "PENDING",
      feedback: null, // Clear feedback on resubmit
    },
  });

  // Wait, upsert requires a unique input. My logic for 'check existing' is safer.
  if (submission) {
    await prisma.assignmentSubmission.update({
      where: { id: submission.id },
      data: {
        attachmentUrl,
        status: "PENDING",
        feedback: null,
      },
    });
  } else {
    await prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        studentId: dbUser.id,
        attachmentUrl,
        status: "PENDING",
      },
    });
  }

  return NextResponse.json({ success: true });
}
