import { NextResponse } from "next/server";
import { prisma } from "@workspace/database";
import { createClient } from "@/lib/supabase/server";
import type { LearningPreferencesInput } from "@/lib/learning-memory";

const ensureMemory = async (userId: string) =>
  prisma.studentReflectionMemory.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      weakTopics: [],
      strengthTopics: [],
      accuracyRate: 0,
      totalAttempts: 0,
      correctAttempts: 0,
      interactionPatterns: {},
      topicStats: {},
      habitSignals: {},
      memorySignals: {},
      lastActiveAt: new Date(),
    },
  });

const getDbUser = async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !user.email) return null;
  return prisma.user.findUnique({
    where: { email: user.email },
  });
};

export async function GET() {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const memory = await ensureMemory(dbUser.id);
    return NextResponse.json({ memory });
  } catch (error) {
    console.error("Failed to fetch learning memory:", error);
    return NextResponse.json(
      { error: "Failed to fetch learning memory" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      preferences?: LearningPreferencesInput;
      onboardingAnswers?: Record<string, unknown>;
    };

    const existing = await ensureMemory(dbUser.id);
    const preferences = body.preferences ?? {};
    const data: any = {
      learningPace: preferences.learningPace ?? existing.learningPace,
      preferredLearningStyle:
        preferences.preferredLearningStyle ?? existing.preferredLearningStyle,
      preferredExplanationStyle:
        preferences.preferredExplanationStyle ??
        existing.preferredExplanationStyle,
      confidenceLevel: preferences.confidenceLevel ?? existing.confidenceLevel,
      goals: preferences.goals?.length
        ? [...new Set(preferences.goals.filter(Boolean))]
        : existing.goals,
      onboardingAnswers:
        body.onboardingAnswers ??
        preferences.onboardingAnswers ??
        existing.onboardingAnswers,
      lastActiveAt: new Date(),
    };

    const memory = await prisma.studentReflectionMemory.update({
      where: { userId: dbUser.id },
      data,
    });

    return NextResponse.json({ success: true, memory });
  } catch (error) {
    console.error("Failed to update learning memory:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update learning memory";
    const code =
      typeof error === "object" && error && "code" in error
        ? String((error as { code?: unknown }).code ?? "")
        : undefined;
    return NextResponse.json(
      {
        error: "Failed to update learning memory",
        message,
        code,
      },
      { status: 500 },
    );
  }
}
