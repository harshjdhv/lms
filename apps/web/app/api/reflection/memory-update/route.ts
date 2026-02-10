import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@workspace/database";
import {
  applyLearningPreferences,
  mergeUniqueTopics,
  type LearningPreferencesInput,
} from "@/lib/learning-memory";

type InteractionEventType =
  | "SKIP"
  | "REWATCH"
  | "HINT_REQUEST"
  | "AI_CHAT_REQUEST"
  | "PAUSE"
  | "RESUME";

type MemoryUpdateEvent =
  | "reflection_answer"
  | "video_interaction"
  | "settings_update"
  | "onboarding";

const DEFAULT_INTERACTION_PATTERNS = {
  skipCount: 0,
  rewatchCount: 0,
  hintRequestCount: 0,
  aiChatHelpCount: 0,
  pauseCount: 0,
  resumeCount: 0,
};

const DEFAULT_HABIT_SIGNALS = {
  prefersExamples: false,
  theoryFirst: false,
  fastLearner: false,
  slowLearner: false,
};

const parseJsonObject = (value: unknown) =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const ensureMemory = async (studentId: string) => {
  return prisma.studentReflectionMemory.upsert({
    where: { userId: studentId },
    update: {},
    create: {
      userId: studentId,
      weakTopics: [],
      strengthTopics: [],
      accuracyRate: 0,
      totalAttempts: 0,
      correctAttempts: 0,
      interactionPatterns: DEFAULT_INTERACTION_PATTERNS,
      habitSignals: DEFAULT_HABIT_SIGNALS,
      topicStats: {},
      memorySignals: {},
      lastActiveAt: new Date(),
    },
  });
};

const incrementInteraction = (
  current: Record<string, unknown>,
  type?: InteractionEventType,
) => {
  const next = {
    ...DEFAULT_INTERACTION_PATTERNS,
    ...current,
  } as Record<string, number>;
  if (!type) return next;

  if (type === "SKIP") next.skipCount = (next.skipCount ?? 0) + 1;
  if (type === "REWATCH") next.rewatchCount = (next.rewatchCount ?? 0) + 1;
  if (type === "HINT_REQUEST")
    next.hintRequestCount = (next.hintRequestCount ?? 0) + 1;
  if (type === "AI_CHAT_REQUEST")
    next.aiChatHelpCount = (next.aiChatHelpCount ?? 0) + 1;
  if (type === "PAUSE") next.pauseCount = (next.pauseCount ?? 0) + 1;
  if (type === "RESUME") next.resumeCount = (next.resumeCount ?? 0) + 1;
  return next;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const studentId = body.studentId as string | undefined;
    const eventType = (body.eventType as MemoryUpdateEvent | undefined) ??
      (typeof body.isCorrect === "boolean" ? "reflection_answer" : undefined);

    if (!studentId || !eventType) {
      return NextResponse.json(
        { error: "studentId and eventType are required" },
        { status: 400 },
      );
    }

    const memory = await ensureMemory(studentId);
    const updates: any = {
      lastActiveAt: new Date(),
    };

    if (eventType === "reflection_answer") {
      const topic = (body.topic as string | undefined)?.trim();
      const isCorrect = Boolean(body.isCorrect);
      const usedHint = Boolean(body.usedHint);
      const requestedExplanationStyle = body.requestedExplanationStyle as
        | string
        | undefined;

      if (!topic) {
        return NextResponse.json(
          { error: "topic is required for reflection_answer" },
          { status: 400 },
        );
      }

      const totalAttempts = (memory.totalAttempts ?? 0) + 1;
      const correctAttempts = (memory.correctAttempts ?? 0) + (isCorrect ? 1 : 0);
      const accuracyRate =
        totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

      let weakTopics = [...(memory.weakTopics ?? [])];
      let strengthTopics = [...(memory.strengthTopics ?? [])];
      if (isCorrect) {
        weakTopics = weakTopics.filter((item) => item !== topic);
        strengthTopics = mergeUniqueTopics(strengthTopics, topic);
      } else {
        strengthTopics = strengthTopics.filter((item) => item !== topic);
        weakTopics = mergeUniqueTopics(weakTopics, topic);
      }

      const topicStats = parseJsonObject(memory.topicStats);
      const previousTopic = parseJsonObject(topicStats[topic]);
      const topicAttempts = Number(previousTopic.attempts ?? 0) + 1;
      const topicCorrect = Number(previousTopic.correct ?? 0) + (isCorrect ? 1 : 0);
      const topicStreak = isCorrect
        ? Number(previousTopic.streak ?? 0) + 1
        : 0;
      topicStats[topic] = {
        attempts: topicAttempts,
        correct: topicCorrect,
        streak: topicStreak,
        accuracy:
          topicAttempts > 0 ? Number(((topicCorrect / topicAttempts) * 100).toFixed(2)) : 0,
        lastOutcome: isCorrect ? "correct" : "incorrect",
        updatedAt: new Date().toISOString(),
      };

      const currentPatterns = parseJsonObject(memory.interactionPatterns);
      const interactionPatterns = incrementInteraction(
        currentPatterns,
        usedHint ? "HINT_REQUEST" : undefined,
      );

      updates.totalAttempts = totalAttempts;
      updates.correctAttempts = correctAttempts;
      updates.accuracyRate = accuracyRate;
      updates.weakTopics = weakTopics;
      updates.strengthTopics = strengthTopics;
      updates.topicStats = topicStats;
      updates.interactionPatterns = interactionPatterns;
      if (requestedExplanationStyle) {
        updates.preferredExplanationStyle = requestedExplanationStyle;
      }
    }

    if (eventType === "video_interaction") {
      const interactionType = body.interactionType as
        | InteractionEventType
        | undefined;
      const patterns = parseJsonObject(memory.interactionPatterns);
      const nextPatterns = incrementInteraction(patterns, interactionType);

      const habits = {
        ...DEFAULT_HABIT_SIGNALS,
        ...parseJsonObject(memory.habitSignals),
      } as Record<string, boolean>;

      habits.fastLearner =
        Number(nextPatterns.skipCount ?? 0) >
        Number(nextPatterns.rewatchCount ?? 0) + 3;
      habits.slowLearner =
        Number(nextPatterns.rewatchCount ?? 0) >
        Number(nextPatterns.skipCount ?? 0) + 3;

      updates.interactionPatterns = nextPatterns;
      updates.habitSignals = habits;
    }

    if (eventType === "settings_update" || eventType === "onboarding") {
      const preferences =
        (body.preferences as LearningPreferencesInput | undefined) ?? {};
      const onboardingAnswers = body.onboardingAnswers as
        | Record<string, unknown>
        | undefined;
      const applied = applyLearningPreferences(memory, {
        ...preferences,
        onboardingAnswers:
          eventType === "onboarding"
            ? onboardingAnswers ?? preferences.onboardingAnswers
            : preferences.onboardingAnswers,
      });
      updates.learningPace = applied.learningPace;
      updates.preferredLearningStyle = applied.preferredLearningStyle;
      updates.preferredExplanationStyle = applied.preferredExplanationStyle;
      updates.confidenceLevel = applied.confidenceLevel;
      updates.goals = applied.goals;
      updates.onboardingAnswers = applied.onboardingAnswers;
    }

    const updatedMemory = await prisma.studentReflectionMemory.update({
      where: { userId: studentId },
      data: updates,
    });

    return NextResponse.json({
      success: true,
      memory: updatedMemory,
      eventType,
    });
  } catch (error) {
    console.error("Error updating student memory:", error);
    return NextResponse.json(
      { error: "Failed to update student memory" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 },
      );
    }

    const memory = await ensureMemory(studentId);
    return NextResponse.json(memory);
  } catch (error) {
    console.error("Error fetching student memory:", error);
    return NextResponse.json(
      { error: "Failed to fetch student memory" },
      { status: 500 },
    );
  }
}
