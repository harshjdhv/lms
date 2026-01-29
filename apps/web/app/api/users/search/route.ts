import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@workspace/database";

export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ users: [] });
    }

    const searchTerm = query.trim().toLowerCase();

    // Search users by email or name (excluding current user)
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            NOT: {
              id: currentUser.id,
            },
          },
          {
            OR: [
              {
                email: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
              {
                name: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
      take: 10, // Limit results
    });

    return NextResponse.json({
      users: users.map((user) => ({
        id: user.id,
        name: user.name || user.email,
        email: user.email,
        avatar: user.avatar,
      })),
    });
  } catch (error) {
    console.error("Search users error:", error);
    return NextResponse.json({ error: "Failed to search users" }, { status: 500 });
  }
}
