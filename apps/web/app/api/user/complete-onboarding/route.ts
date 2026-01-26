import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { role, name, phone, bio, ...roleSpecificData } = body;

    // Upsert user in database
    const updatedUser = await prisma.user.upsert({
      where: { email: user.email! },
      update: {
        role,
        name,
        phone,
        bio,
        hasCompletedOnboarding: true,
        ...roleSpecificData,
      },
      create: {
        id: user.id,
        email: user.email!,
        role,
        name,
        phone,
        bio,
        hasCompletedOnboarding: true,
        ...roleSpecificData,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 },
    );
  }
}
