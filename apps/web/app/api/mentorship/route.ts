/**
 * @file api/mentorship/route.ts
 * @description API endpoints for mentorship system - get mentorship data and add mentees
 * @module Apps/Web/API/Mentorship
 */

import { NextResponse } from "next/server";
import { prisma } from "@workspace/database";
import { getCurrentUser } from "@/lib/get-current-user";

// Helper for serialization
const serialize = <T>(data: T): T => JSON.parse(JSON.stringify(data));

/**
 * GET /api/mentorship
 * Returns mentorship data based on user role:
 * - Teachers: list of mentees, requirements they created, all submissions
 * - Students: their mentor info, requirements from mentor, their submissions
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.role === "TEACHER") {
      // Get all mentees under this teacher
      const mentees = await prisma.mentorship.findMany({
        where: { mentorId: user.id },
        include: {
          mentee: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              studentId: true,
              grade: true,
              semester: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Get document requirements created by this teacher
      const requirements = await prisma.documentRequirement.findMany({
        where: { mentorId: user.id },
        include: {
          _count: { select: { submissions: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      // Get all submissions for their requirements
      const submissions = await prisma.documentSubmission.findMany({
        where: {
          requirement: { mentorId: user.id },
        },
        include: {
          requirement: {
            select: { id: true, title: true, category: true },
          },
          student: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
        orderBy: { submittedAt: "desc" },
      });

      // Calculate stats
      const activeMentees = mentees.filter((m) => m.status === "ACTIVE").length;
      const pendingDocuments = submissions.filter(
        (s) => s.status === "PENDING",
      ).length;
      const completedDocuments = submissions.filter(
        (s) => s.status === "APPROVED",
      ).length;

      return NextResponse.json(
        serialize({
          mentor: null,
          mentees,
          requirements,
          submissions,
          stats: {
            totalMentees: mentees.length,
            activeMentees,
            pendingDocuments,
            completedDocuments,
          },
        }),
      );
    } else {
      // Student view
      // Get their mentor
      const mentorship = await prisma.mentorship.findFirst({
        where: { menteeId: user.id, status: "ACTIVE" },
        include: {
          mentor: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              expertise: true,
              title: true,
            },
          },
        },
      });

      // Get requirements from their mentor
      const requirements = mentorship
        ? await prisma.documentRequirement.findMany({
            where: { mentorId: mentorship.mentorId },
            orderBy: [{ isRequired: "desc" }, { dueDate: "asc" }],
          })
        : [];

      // Get their submissions
      const submissions = await prisma.documentSubmission.findMany({
        where: { studentId: user.id },
        include: {
          requirement: {
            select: { id: true, title: true, category: true, dueDate: true },
          },
        },
        orderBy: { submittedAt: "desc" },
      });

      // Calculate stats
      const pendingDocuments = submissions.filter(
        (s) => s.status === "PENDING",
      ).length;
      const completedDocuments = submissions.filter(
        (s) => s.status === "APPROVED",
      ).length;
      const totalRequired = requirements.filter((r) => r.isRequired).length;

      return NextResponse.json(
        serialize({
          mentor: mentorship?.mentor || null,
          mentees: [],
          requirements,
          submissions,
          stats: {
            totalMentees: 0,
            activeMentees: 0,
            pendingDocuments,
            completedDocuments,
            totalRequired,
          },
        }),
      );
    }
  } catch (error) {
    console.error("[MENTORSHIP_GET]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/mentorship
 * Add a new mentee (teacher only)
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "TEACHER") {
      return NextResponse.json(
        { message: "Only teachers can add mentees" },
        { status: 403 },
      );
    }

    const { menteeId } = await request.json();

    if (!menteeId) {
      return NextResponse.json(
        { message: "Mentee ID is required" },
        { status: 400 },
      );
    }

    // Check if mentee exists and is a student
    const mentee = await prisma.user.findUnique({
      where: { id: menteeId },
    });

    if (!mentee || mentee.role !== "STUDENT") {
      return NextResponse.json(
        { message: "Invalid mentee - must be a student" },
        { status: 400 },
      );
    }

    // Check if mentorship already exists
    const existing = await prisma.mentorship.findUnique({
      where: {
        mentorId_menteeId: {
          mentorId: user.id,
          menteeId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "This student is already your mentee" },
        { status: 400 },
      );
    }

    // Create mentorship
    const mentorship = await prisma.mentorship.create({
      data: {
        mentorId: user.id,
        menteeId,
      },
      include: {
        mentee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            studentId: true,
            grade: true,
            semester: true,
          },
        },
      },
    });

    return NextResponse.json(serialize(mentorship), { status: 201 });
  } catch (error) {
    console.error("[MENTORSHIP_POST]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
