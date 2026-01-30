/**
 * @file api/mentorship/[id]/route.ts
 * @description API endpoints for individual mentorship operations
 * @module Apps/Web/API/Mentorship
 */

import { NextResponse } from "next/server";
import { prisma } from "@workspace/database";
import { getCurrentUser } from "@/lib/get-current-user";

const serialize = <T>(data: T): T => JSON.parse(JSON.stringify(data));

/**
 * PATCH /api/mentorship/[id]
 * Update mentorship (notes, status)
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
        { message: "Only teachers can update mentorship" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { notes, status } = body;

    // Verify ownership
    const mentorship = await prisma.mentorship.findFirst({
      where: { id, mentorId: user.id },
    });

    if (!mentorship) {
      return NextResponse.json(
        { message: "Mentorship not found" },
        { status: 404 },
      );
    }

    const updated = await prisma.mentorship.update({
      where: { id },
      data: {
        ...(notes !== undefined && { notes }),
        ...(status && { status }),
      },
    });

    return NextResponse.json(serialize(updated));
  } catch (error) {
    console.error("[MENTORSHIP_PATCH]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/mentorship/[id]
 * Remove a mentee
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
        { message: "Only teachers can remove mentees" },
        { status: 403 },
      );
    }

    // Verify ownership
    const mentorship = await prisma.mentorship.findFirst({
      where: { id, mentorId: user.id },
    });

    if (!mentorship) {
      return NextResponse.json(
        { message: "Mentorship not found" },
        { status: 404 },
      );
    }

    await prisma.mentorship.delete({ where: { id } });

    return NextResponse.json({ message: "Mentorship removed successfully" });
  } catch (error) {
    console.error("[MENTORSHIP_DELETE]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
