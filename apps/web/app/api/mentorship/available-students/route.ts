/**
 * @file api/mentorship/available-students/route.ts
 * @description Get students who are not yet assigned as mentees
 * @module Apps/Web/API/Mentorship
 */

import { NextResponse } from "next/server";
import { prisma } from "@workspace/database";
import { getCurrentUser } from "@/lib/get-current-user";

const serialize = <T>(data: T): T => JSON.parse(JSON.stringify(data));

/**
 * GET /api/mentorship/available-students
 * Returns students who don't have a mentor yet (teacher only)
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "TEACHER") {
      return NextResponse.json(
        { message: "Only teachers can view available students" },
        { status: 403 },
      );
    }

    // Get students who don't have an active mentorship with this teacher
    const existingMenteeIds = await prisma.mentorship.findMany({
      where: { mentorId: user.id },
      select: { menteeId: true },
    });

    const assignedIds = existingMenteeIds.map((m) => m.menteeId);

    const availableStudents = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        id: { notIn: assignedIds },
        hasCompletedOnboarding: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        studentId: true,
        grade: true,
        semester: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(serialize(availableStudents));
  } catch (error) {
    console.error("[AVAILABLE_STUDENTS_GET]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
