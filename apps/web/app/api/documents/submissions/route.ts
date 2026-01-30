/**
 * @file api/documents/submissions/route.ts
 * @description API endpoints for document submissions
 * @module Apps/Web/API/Documents
 */

import { NextResponse } from "next/server";
import { prisma } from "@workspace/database";
import { getCurrentUser } from "@/lib/get-current-user";

const serialize = <T>(data: T): T => JSON.parse(JSON.stringify(data));

/**
 * GET /api/documents/submissions
 * Get document submissions based on user role
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.role === "TEACHER") {
      // Get all submissions for requirements created by this teacher
      const submissions = await prisma.documentSubmission.findMany({
        where: {
          requirement: { mentorId: user.id },
        },
        include: {
          requirement: {
            select: { id: true, title: true, category: true, dueDate: true },
          },
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              studentId: true,
            },
          },
        },
        orderBy: { submittedAt: "desc" },
      });

      return NextResponse.json(serialize(submissions));
    } else {
      // Get student's own submissions
      const submissions = await prisma.documentSubmission.findMany({
        where: { studentId: user.id },
        include: {
          requirement: {
            select: { id: true, title: true, category: true, dueDate: true },
          },
        },
        orderBy: { submittedAt: "desc" },
      });

      return NextResponse.json(serialize(submissions));
    }
  } catch (error) {
    console.error("[SUBMISSIONS_GET]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/documents/submissions
 * Submit a document (student only)
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "STUDENT") {
      return NextResponse.json(
        { message: "Only students can submit documents" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { requirementId, fileUrl, fileName, fileSize } = body;

    if (!requirementId || !fileUrl || !fileName) {
      return NextResponse.json(
        { message: "Requirement ID, file URL, and file name are required" },
        { status: 400 },
      );
    }

    // Verify requirement exists and student has a mentor who created it
    const mentorship = await prisma.mentorship.findFirst({
      where: { menteeId: user.id, status: "ACTIVE" },
    });

    if (!mentorship) {
      return NextResponse.json(
        { message: "You must have an assigned mentor to submit documents" },
        { status: 403 },
      );
    }

    const requirement = await prisma.documentRequirement.findFirst({
      where: { id: requirementId, mentorId: mentorship.mentorId },
    });

    if (!requirement) {
      return NextResponse.json(
        { message: "Requirement not found or not assigned to you" },
        { status: 404 },
      );
    }

    // Check if already submitted
    const existing = await prisma.documentSubmission.findUnique({
      where: {
        requirementId_studentId: {
          requirementId,
          studentId: user.id,
        },
      },
    });

    if (existing) {
      // Update existing submission
      const updated = await prisma.documentSubmission.update({
        where: { id: existing.id },
        data: {
          fileUrl,
          fileName,
          fileSize: fileSize || null,
          status: "PENDING",
          feedback: null,
          submittedAt: new Date(),
          reviewedAt: null,
        },
      });

      return NextResponse.json(serialize(updated));
    }

    // Create new submission
    const submission = await prisma.documentSubmission.create({
      data: {
        requirementId,
        studentId: user.id,
        fileUrl,
        fileName,
        fileSize: fileSize || null,
      },
    });

    return NextResponse.json(serialize(submission), { status: 201 });
  } catch (error) {
    console.error("[SUBMISSIONS_POST]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
