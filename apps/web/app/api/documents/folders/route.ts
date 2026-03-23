/**
 * @file api/documents/folders/route.ts
 * @description API endpoints for document folders - CRUD operations
 * @module Apps/Web/API/Documents/Folders
 */

import { NextResponse } from "next/server";
import { prisma } from "@workspace/database";
import { getCurrentUser } from "@/lib/get-current-user";

const serialize = <T>(data: T): T => JSON.parse(JSON.stringify(data));

/**
 * GET /api/documents/folders
 * Get document folders based on user role
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.role === "TEACHER") {
      const folders = await prisma.documentFolder.findMany({
        where: { mentorId: user.id },
        include: {
          _count: { select: { requirements: true } },
          requirements: {
            select: {
              id: true,
              _count: { select: { submissions: true } },
            },
          },
        },
        orderBy: { position: "asc" },
      });

      // Compute requirement and submission counts
      const foldersWithStats = folders.map((folder) => {
        const totalRequirements = folder._count.requirements;
        const totalSubmissions = folder.requirements.reduce(
          (sum, req) => sum + req._count.submissions,
          0,
        );
        return {
          ...folder,
          requirements: undefined,
          stats: { totalRequirements, totalSubmissions },
        };
      });

      return NextResponse.json(serialize(foldersWithStats));
    } else {
      // Student: get folders from their mentor
      const mentorship = await prisma.mentorship.findFirst({
        where: { menteeId: user.id, status: "ACTIVE" },
      });

      if (!mentorship) {
        return NextResponse.json([]);
      }

      const folders = await prisma.documentFolder.findMany({
        where: { mentorId: mentorship.mentorId },
        include: {
          _count: { select: { requirements: true } },
        },
        orderBy: { position: "asc" },
      });

      return NextResponse.json(serialize(folders));
    }
  } catch (error) {
    console.error("[FOLDERS_GET]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/documents/folders
 * Create a new document folder (teacher only)
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "TEACHER") {
      return NextResponse.json(
        { message: "Only teachers can create folders" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { name, description, color, icon } = body;

    if (!name) {
      return NextResponse.json(
        { message: "Folder name is required" },
        { status: 400 },
      );
    }

    // Get the max position to add at the end
    const maxPosition = await prisma.documentFolder.aggregate({
      where: { mentorId: user.id },
      _max: { position: true },
    });

    const folder = await prisma.documentFolder.create({
      data: {
        name,
        description: description || null,
        color: color || null,
        icon: icon || null,
        position: (maxPosition._max.position ?? -1) + 1,
        mentorId: user.id,
      },
    });

    return NextResponse.json(serialize(folder), { status: 201 });
  } catch (error) {
    console.error("[FOLDERS_POST]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
