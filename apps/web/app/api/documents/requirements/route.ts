/**
 * @file api/documents/requirements/route.ts
 * @description API endpoints for document requirements
 * @module Apps/Web/API/Documents
 */

import { NextResponse } from "next/server";
import { prisma } from "@workspace/database";
import { getCurrentUser } from "@/lib/get-current-user";

const serialize = <T>(data: T): T => JSON.parse(JSON.stringify(data));

/**
 * GET /api/documents/requirements
 * Get document requirements based on user role
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.role === "TEACHER") {
      // Get requirements created by this teacher
      const requirements = await prisma.documentRequirement.findMany({
        where: { mentorId: user.id },
        include: {
          _count: { select: { submissions: true } },
          submissions: {
            select: {
              id: true,
              status: true,
              studentId: true,
            },
          },
        },
        orderBy: [{ isRequired: "desc" }, { dueDate: "asc" }],
      });

      return NextResponse.json(serialize(requirements));
    } else {
      // For students, get requirements from their mentor
      const mentorship = await prisma.mentorship.findFirst({
        where: { menteeId: user.id, status: "ACTIVE" },
      });

      if (!mentorship) {
        return NextResponse.json([]);
      }

      const requirements = await prisma.documentRequirement.findMany({
        where: { mentorId: mentorship.mentorId },
        orderBy: [{ isRequired: "desc" }, { dueDate: "asc" }],
      });

      return NextResponse.json(serialize(requirements));
    }
  } catch (error) {
    console.error("[REQUIREMENTS_GET]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/documents/requirements
 * Create a new document requirement (teacher only)
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "TEACHER") {
      return NextResponse.json(
        { message: "Only teachers can create requirements" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { title, description, dueDate, isRequired, category } = body;

    if (!title) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 },
      );
    }

    const requirement = await prisma.documentRequirement.create({
      data: {
        title,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        isRequired: isRequired ?? true,
        category: category || null,
        mentorId: user.id,
      },
    });

    return NextResponse.json(serialize(requirement), { status: 201 });
  } catch (error) {
    console.error("[REQUIREMENTS_POST]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
