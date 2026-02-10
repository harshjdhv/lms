import type { StudentReflectionMemory } from "@workspace/database";

export const LEARNING_PACE_OPTIONS = [
  { value: "FAST", label: "Fast pace" },
  { value: "STEADY", label: "Steady pace" },
  { value: "DEEP", label: "Deep pace" },
] as const;

export const LEARNING_STYLE_OPTIONS = [
  { value: "EXAMPLES_FIRST", label: "Examples first" },
  { value: "THEORY_FIRST", label: "Theory first" },
  { value: "MIXED", label: "Mix of both" },
] as const;

export const EXPLANATION_STYLE_OPTIONS = [
  { value: "SHORT", label: "Short" },
  { value: "DETAILED", label: "Detailed" },
  { value: "STEP_BY_STEP", label: "Step-by-step" },
  { value: "ANALOGY", label: "Analogy based" },
] as const;

export const CONFIDENCE_OPTIONS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
] as const;

export const LEARNING_GOAL_OPTIONS = [
  { value: "EXAM_PREP", label: "Exam prep" },
  { value: "DEEP_UNDERSTANDING", label: "Deep understanding" },
  { value: "SPEED_LEARNING", label: "Speed learning" },
  { value: "PRACTICAL_APPLICATION", label: "Practical application" },
] as const;

export type LearningPace = (typeof LEARNING_PACE_OPTIONS)[number]["value"];
export type LearningStyle = (typeof LEARNING_STYLE_OPTIONS)[number]["value"];
export type ExplanationStyle =
  (typeof EXPLANATION_STYLE_OPTIONS)[number]["value"];
export type ConfidenceLevel = (typeof CONFIDENCE_OPTIONS)[number]["value"];
export type LearningGoal = (typeof LEARNING_GOAL_OPTIONS)[number]["value"];

type Nullable<T> = T | null | undefined;

export type LearningPreferencesInput = {
  learningPace?: Nullable<LearningPace>;
  preferredLearningStyle?: Nullable<LearningStyle>;
  preferredExplanationStyle?: Nullable<ExplanationStyle>;
  confidenceLevel?: Nullable<ConfidenceLevel>;
  goals?: Nullable<string[]>;
  onboardingAnswers?: Nullable<Record<string, unknown>>;
};

const getLabel = (
  options: readonly { value: string; label: string }[],
  value: string | null | undefined,
) => options.find((item) => item.value === value)?.label ?? value ?? "Not set";

export const formatLearningMemoryForPrompt = (
  memory: StudentReflectionMemory | null,
) => {
  if (!memory) {
    return "No stored learner profile yet. Start with beginner-friendly scaffolding and adapt quickly.";
  }

  const weakTopics = memory.weakTopics?.slice(0, 5).join(", ") || "None yet";
  const strongTopics =
    memory.strengthTopics?.slice(0, 5).join(", ") || "None yet";
  const interactionPatterns = memory.interactionPatterns
    ? JSON.stringify(memory.interactionPatterns)
    : "{}";

  return [
    `Learning pace: ${getLabel(LEARNING_PACE_OPTIONS, memory.learningPace)}`,
    `Learning style: ${getLabel(LEARNING_STYLE_OPTIONS, memory.preferredLearningStyle)}`,
    `Explanation style: ${getLabel(EXPLANATION_STYLE_OPTIONS, memory.preferredExplanationStyle)}`,
    `Confidence: ${getLabel(CONFIDENCE_OPTIONS, memory.confidenceLevel)}`,
    `Goals: ${memory.goals?.join(", ") || "Not set"}`,
    `Accuracy: ${Number(memory.accuracyRate ?? 0).toFixed(1)}% (${memory.correctAttempts}/${memory.totalAttempts})`,
    `Weak topics: ${weakTopics}`,
    `Strong topics: ${strongTopics}`,
    `Interaction patterns JSON: ${interactionPatterns}`,
  ].join("\n");
};

export const mergeUniqueTopics = (
  base: string[] | null | undefined,
  topic: string,
  max = 20,
) => {
  const normalized = (topic || "").trim();
  if (!normalized) return (base ?? []).slice(0, max);
  const without = (base ?? []).filter((t) => t !== normalized);
  return [normalized, ...without].slice(0, max);
};

export const applyLearningPreferences = (
  current: StudentReflectionMemory,
  updates: LearningPreferencesInput,
) => {
  const goals = updates.goals?.filter(Boolean);
  return {
    learningPace: updates.learningPace ?? current.learningPace,
    preferredLearningStyle:
      updates.preferredLearningStyle ?? current.preferredLearningStyle,
    preferredExplanationStyle:
      updates.preferredExplanationStyle ?? current.preferredExplanationStyle,
    confidenceLevel: updates.confidenceLevel ?? current.confidenceLevel,
    goals: goals ? [...new Set(goals)] : current.goals,
    onboardingAnswers: updates.onboardingAnswers ?? current.onboardingAnswers,
  };
};
