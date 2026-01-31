import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@workspace/database";

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

    if (!user.email) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { role, name, phone, bio, ...rest } = body;

    // Construct data object to ensure we only pass valid fields to Prisma
    // and avoid "Unknown argument" errors if extra data is sent.
    const userData: any = {
      role,
      name,
      phone,
      bio,
      hasCompletedOnboarding: true,
    };

    if (role === "STUDENT") {
      userData.studentId = rest.studentId;
      userData.grade = rest.grade;
      userData.semester = rest.semester;
    } else if (role === "TEACHER") {
      userData.title = rest.title;
      userData.expertise = rest.expertise;
    }

    // Upsert user in database
    const updatedUser = await prisma.user.upsert({
      where: { email: user.email },
      update: userData,
      create: {
        id: user.id,
        email: user.email,
        ...userData,
      },
    });

    // Auto-enroll logic
    if (role === "STUDENT" && userData.semester) {
      const semester = userData.semester;

      // Find all published courses for this semester (or general ones)
      const courses = await prisma.course.findMany({
        where: {
          isPublished: true,
          OR: [
            { semester: semester },
            { semester: null }, // Include general courses too
          ],
        },
      });

      if (courses.length > 0) {
        await prisma.enrollment.createMany({
          data: courses.map((course) => ({
            userId: user.id,
            courseId: course.id,
          })),
          skipDuplicates: true,
        });
      }
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to complete onboarding" },
      { status: 500 },
    );
  }
}
