/**
 * @file api/documents/submissions/[id]/route.ts
 * @description API endpoints for individual submission operations (review)
 * @module Apps/Web/API/Documents
 */

import { NextResponse } from "next/server";
import { prisma } from "@workspace/database";
import { getCurrentUser } from "@/lib/get-current-user";

const serialize = <T>(data: T): T => JSON.parse(JSON.stringify(data));

/**
 * PATCH /api/documents/submissions/[id]
 * Review a submission (teacher only)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "TEACHER") {
      return NextResponse.json(
        { message: "Only teachers can review submissions" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { status, feedback } = body;

    if (!status) {
      return NextResponse.json(
        { message: "Status is required" },
        { status: 400 },
      );
    }

    // Verify the submission belongs to a requirement created by this teacher
    const submission = await prisma.documentSubmission.findFirst({
      where: {
        id,
        requirement: { mentorId: user.id },
      },
    });

    if (!submission) {
      return NextResponse.json(
        { message: "Submission not found" },
        { status: 404 },
      );
    }

    const updated = await prisma.documentSubmission.update({
      where: { id },
      data: {
        status,
        feedback: feedback || null,
        reviewedAt: new Date(),
      },
      include: {
        requirement: {
          select: { id: true, title: true },
        },
        student: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(serialize(updated));
  } catch (error) {
    console.error("[SUBMISSION_PATCH]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
