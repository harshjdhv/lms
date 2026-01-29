import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@workspace/database";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all chats where the user is either user1 or user2
    const chats = await prisma.chat.findMany({
      where: {
        OR: [
          { user1Id: currentUser.id },
          { user2Id: currentUser.id },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1, // Get only the last message
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Transform chats to include other user and last message
    const transformedChats = chats.map((chat) => {
      const otherUser = chat.user1Id === currentUser.id ? chat.user2 : chat.user1;
      const lastMessage = chat.messages[0] || null;

      return {
        id: chat.id,
        otherUser: {
          id: otherUser.id,
          name: otherUser.name || otherUser.email,
          email: otherUser.email,
          avatar: otherUser.avatar,
        },
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              senderId: lastMessage.senderId,
              createdAt: lastMessage.createdAt,
            }
          : null,
        updatedAt: chat.updatedAt,
        createdAt: chat.createdAt,
      };
    });

    return NextResponse.json({ chats: transformedChats });
  } catch (error: any) {
    console.error("Get chats error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch chats",
        details: error.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (userId === currentUser.id) {
      return NextResponse.json({ error: "Cannot create chat with yourself" }, { status: 400 });
    }

    // Check if other user exists
    const otherUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!otherUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if chat already exists (in either direction)
    const existingChat = await prisma.chat.findFirst({
      where: {
        OR: [
          { user1Id: currentUser.id, user2Id: userId },
          { user1Id: userId, user2Id: currentUser.id },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (existingChat) {
      const otherUserData =
        existingChat.user1Id === currentUser.id ? existingChat.user2 : existingChat.user1;
      return NextResponse.json({
        chat: {
          id: existingChat.id,
          otherUser: {
            id: otherUserData.id,
            name: otherUserData.name || otherUserData.email,
            email: otherUserData.email,
            avatar: otherUserData.avatar,
          },
          createdAt: existingChat.createdAt,
          updatedAt: existingChat.updatedAt,
        },
      });
    }

    // Create new chat (always set current user as user1)
    const newChat = await prisma.chat.create({
      data: {
        user1Id: currentUser.id,
        user2Id: userId,
      },
      include: {
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({
      chat: {
        id: newChat.id,
        otherUser: {
          id: newChat.user2.id,
          name: newChat.user2.name || newChat.user2.email,
          email: newChat.user2.email,
          avatar: newChat.user2.avatar,
        },
        createdAt: newChat.createdAt,
        updatedAt: newChat.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Create chat error:", error);
    return NextResponse.json(
      { 
        error: "Failed to create chat",
        details: error.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}
