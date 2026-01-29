import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@workspace/database";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is part of this chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        OR: [{ user1Id: currentUser.id }, { user2Id: currentUser.id }],
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Parse query parameters for pagination
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const before = searchParams.get("before"); // ISO timestamp

    // Build where clause
    const where: any = { chatId };
    if (before) {
      where.createdAt = {
        lt: new Date(before),
      };
    }

    // Fetch messages
    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    // Reverse to show oldest first (for display)
    const reversedMessages = messages.reverse();

    return NextResponse.json({
      messages: reversedMessages.map((msg) => ({
        id: msg.id,
        chatId: msg.chatId,
        senderId: msg.senderId,
        content: msg.content,
        createdAt: msg.createdAt,
        sender: {
          id: msg.sender.id,
          name: msg.sender.name || msg.sender.email,
          email: msg.sender.email,
          avatar: msg.sender.avatar,
        },
      })),
      hasMore: messages.length === limit,
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    // Verify user is part of this chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        OR: [{ user1Id: currentUser.id }, { user2Id: currentUser.id }],
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        chatId,
        senderId: currentUser.id,
        content: content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Update chat's updatedAt timestamp
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      message: {
        id: message.id,
        chatId: message.chatId,
        senderId: message.senderId,
        content: message.content,
        createdAt: message.createdAt,
        sender: {
          id: message.sender.id,
          name: message.sender.name || message.sender.email,
          email: message.sender.email,
          avatar: message.sender.avatar,
        },
      },
    });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
