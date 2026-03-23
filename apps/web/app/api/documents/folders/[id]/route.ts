/**
 * @file api/documents/folders/[id]/route.ts
 * @description API endpoints for individual document folder operations
 * @module Apps/Web/API/Documents/Folders
 */

import { NextResponse } from "next/server";
import { prisma } from "@workspace/database";
import { getCurrentUser } from "@/lib/get-current-user";

const serialize = <T>(data: T): T => JSON.parse(JSON.stringify(data));

/**
 * PATCH /api/documents/folders/:id
 * Update a document folder
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "TEACHER") {
      return NextResponse.json(
        { message: "Only teachers can update folders" },
        { status: 403 },
      );
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.documentFolder.findUnique({
      where: { id },
    });

    if (!existing || existing.mentorId !== user.id) {
      return NextResponse.json(
        { message: "Folder not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { name, description, color, icon, position } = body;

    const folder = await prisma.documentFolder.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(color !== undefined && { color }),
        ...(icon !== undefined && { icon }),
        ...(position !== undefined && { position }),
      },
    });

    return NextResponse.json(serialize(folder));
  } catch (error) {
    console.error("[FOLDER_PATCH]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/documents/folders/:id
 * Delete a document folder (requirements become uncategorized)
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "TEACHER") {
      return NextResponse.json(
        { message: "Only teachers can delete folders" },
        { status: 403 },
      );
    }

    const { id } = await params;

    const existing = await prisma.documentFolder.findUnique({
      where: { id },
    });

    if (!existing || existing.mentorId !== user.id) {
      return NextResponse.json(
        { message: "Folder not found" },
        { status: 404 },
      );
    }

    // Delete folder — requirements will have folderId set to null via onDelete: SetNull
    await prisma.documentFolder.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Folder deleted" });
  } catch (error) {
    console.error("[FOLDER_DELETE]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
