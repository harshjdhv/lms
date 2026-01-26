import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@workspace/database";

// const prisma = new PrismaClient();

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  });
  if (!dbUser || dbUser.role !== "TEACHER") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { id, status } = await req.json();
  if (!id || !status)
    return new NextResponse("Missing fields", { status: 400 });

  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: { course: true },
  });

  if (!assignment) return new NextResponse("Not found", { status: 404 });
  if (assignment.course.teacherId !== dbUser.id)
    return new NextResponse("Forbidden", { status: 403 });

  const updated = await prisma.assignment.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(updated);
}
