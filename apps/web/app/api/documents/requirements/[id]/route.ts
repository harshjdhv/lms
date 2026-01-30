/**
 * @file api/documents/requirements/[id]/route.ts
 * @description API endpoints for individual document requirement operations
 * @module Apps/Web/API/Documents
 */

import { NextResponse } from "next/server";
import { prisma } from "@workspace/database";
import { getCurrentUser } from "@/lib/get-current-user";

const serialize = <T>(data: T): T => JSON.parse(JSON.stringify(data));

/**
 * PATCH /api/documents/requirements/[id]
 * Update a document requirement
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
        { message: "Only teachers can update requirements" },
        { status: 403 },
      );
    }

    // Verify ownership
    const requirement = await prisma.documentRequirement.findFirst({
      where: { id, mentorId: user.id },
    });

    if (!requirement) {
      return NextResponse.json(
        { message: "Requirement not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { title, description, dueDate, isRequired, category } = body;

    const updated = await prisma.documentRequirement.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
        ...(isRequired !== undefined && { isRequired }),
        ...(category !== undefined && { category }),
      },
    });

    return NextResponse.json(serialize(updated));
  } catch (error) {
    console.error("[REQUIREMENT_PATCH]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/documents/requirements/[id]
 * Delete a document requirement
 */
export async function DELETE(
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
        { message: "Only teachers can delete requirements" },
        { status: 403 },
      );
    }

    // Verify ownership
    const requirement = await prisma.documentRequirement.findFirst({
      where: { id, mentorId: user.id },
    });

    if (!requirement) {
      return NextResponse.json(
        { message: "Requirement not found" },
        { status: 404 },
      );
    }

    await prisma.documentRequirement.delete({ where: { id } });

    return NextResponse.json({ message: "Requirement deleted successfully" });
  } catch (error) {
    console.error("[REQUIREMENT_DELETE]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
