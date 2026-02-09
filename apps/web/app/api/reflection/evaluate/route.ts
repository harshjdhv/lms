import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@workspace/database";

const MODELS = {
  default: "llama-3.1-8b-instant",
  fallback: "llama-3.3-70b-versatile",
  upgrade: "llama-3.3-70b-versatile", // Used when student fails twice
};

// Heuristic threshold for short-answer grading to allow minor paraphrases while rejecting vague answers.
// Default is calibrated to balance false positives/negatives for 1-3 sentence responses.
// Override via the REFLECTION_SCORE_THRESHOLD environment variable when calibrating with real-world scoring data.
const DEFAULT_SIMILARITY_THRESHOLD = 0.62;
const RAW_SIMILARITY_THRESHOLD = Number.parseFloat(
  process.env.REFLECTION_SCORE_THRESHOLD ?? "",
);
const SIMILARITY_THRESHOLD = Number.isFinite(RAW_SIMILARITY_THRESHOLD)
  ? RAW_SIMILARITY_THRESHOLD
  : DEFAULT_SIMILARITY_THRESHOLD;
// Semantic scoring is weighted higher to recognize correct paraphrases; lexical overlap is secondary.
const DEFAULT_AI_SCORE_WEIGHT = 0.85;
const RAW_AI_SCORE_WEIGHT = Number.parseFloat(
  process.env.REFLECTION_AI_WEIGHT ?? "",
);
const AI_SCORE_WEIGHT =
  Number.isFinite(RAW_AI_SCORE_WEIGHT) &&
  RAW_AI_SCORE_WEIGHT > 0 &&
  RAW_AI_SCORE_WEIGHT < 1
    ? RAW_AI_SCORE_WEIGHT
    : DEFAULT_AI_SCORE_WEIGHT;
const SIMILARITY_SCORE_WEIGHT = 1 - AI_SCORE_WEIGHT;
const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "the",
  "to",
  "of",
  "in",
  "on",
  "for",
  "with",
  "at",
  "by",
  "from",
  "is",
  "are",
  "was",
  "were",
  "be",
  "as",
  "it",
  "that",
  "this",
  "these",
  "those",
  "or",
  "but",
  "so",
  "if",
  "then",
  "because",
  "into",
  "about",
  "over",
  "under",
]);

// Normalize text for coarse lexical similarity by stripping punctuation and stop words.
const tokenize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !STOP_WORDS.has(token));

const buildFrequency = (tokens: string[]) => {
  const map = new Map<string, number>();
  tokens.forEach((token) => {
    map.set(token, (map.get(token) ?? 0) + 1);
  });
  return map;
};

const cosineSimilarity = (a: Map<string, number>, b: Map<string, number>) => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const [token, count] of a) {
    normA += count * count;
    if (b.has(token)) {
      dotProduct += count * (b.get(token) ?? 0);
    }
  }

  for (const count of b.values()) {
    normB += count * count;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

const calculateSimilarity = (answer: string, referenceAnswer: string) => {
  if (!answer.trim() || !referenceAnswer.trim()) return 0;
  const answerTokens = tokenize(answer);
  const referenceTokens = tokenize(referenceAnswer);
  if (answerTokens.length === 0 || referenceTokens.length === 0) return 0;
  return cosineSimilarity(
    buildFrequency(answerTokens),
    buildFrequency(referenceTokens),
  );
};

const clampScore = (value: number) => Math.min(Math.max(value, 0), 1);
const calculateCombinedScore = (aiScore: number, similarityScore: number) =>
  aiScore * AI_SCORE_WEIGHT + similarityScore * SIMILARITY_SCORE_WEIGHT;
const roundScore = (value: number, precision = 2) =>
  parseFloat(value.toFixed(precision));

async function evaluateWithGroq(
  question: string,
  answer: string,
  topic: string,
  referenceAnswer: string,
  similarityScore: number,
  model: string = MODELS.default,
) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Groq API key not configured");
  }

  const prompt = `
  As an expert educator, evaluate this student answer:

  Topic: ${topic}
  Question: ${question}
  Reference Answer: ${referenceAnswer || "Not available"}
  Student's Answer: ${answer}
  Lexical Similarity Score (0-1): ${similarityScore.toFixed(2)}

  Provide your evaluation as a JSON object with:
  {
    "score": number, // 0-1 semantic correctness
    "feedback": "specific feedback on their answer",
    "hint": "a helpful hint if incorrect (or empty string if correct)"
  }

  Be encouraging but accurate. For partially correct answers, focus on what they got right and what needs improvement. Provide specific, actionable hints.
  The semantic score should reflect conceptual correctness even if wording differs; treat the token similarity as a loose baseline.
  If the answer is correct, keep the hint empty and score high (closer to 1.0).
  `;

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are an expert educational evaluator. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content.trim();

  try {
    const parsed = JSON.parse(content);
    return {
      score: typeof parsed.score === "number" ? parsed.score : 0,
      feedback: typeof parsed.feedback === "string" ? parsed.feedback : "",
      hint: typeof parsed.hint === "string" ? parsed.hint : "",
    };
  } catch (parseError) {
    console.error("Failed to parse AI response as JSON:", content);
    // Fallback evaluation
    return {
      score: calculateCombinedScore(similarityScore, similarityScore),
      feedback:
        "Unable to evaluate your answer automatically. Please review the question and try again.",
      hint: "Think about the key concepts covered in the topic.",
    };
  }
}

async function getStudentAttempts(studentId: string, topic: string) {
  // This is a simplified approach - in production you'd track attempts per question
  const memory = await prisma.studentReflectionMemory.findUnique({
    where: { userId: studentId },
  });

  if (!memory) return 0;

  // Estimate attempts based on total attempts and weak topics
  const hasWeakTopic = memory.weakTopics.includes(topic);
  return hasWeakTopic ? Math.max(2, memory.totalAttempts) : 0;
}

export async function POST(request: NextRequest) {
  let similarityScore = 0;
  try {
    const { question, answer, topic, studentId, referenceAnswer } =
      await request.json();

    if (!question || !answer || !topic || !studentId) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    const normalizedReferenceAnswer =
      typeof referenceAnswer === "string" ? referenceAnswer : "";
    similarityScore = calculateSimilarity(
      answer,
      normalizedReferenceAnswer,
    );

    // Check student's previous attempts to decide model
    const previousAttempts = await getStudentAttempts(studentId, topic);
    const shouldUpgrade = previousAttempts >= 2;
    const modelToUse = shouldUpgrade ? MODELS.upgrade : MODELS.default;

    let evaluation;
    let modelUsed = MODELS.default;

    try {
      // Try primary evaluation
      evaluation = await evaluateWithGroq(
        question,
        answer,
        topic,
        normalizedReferenceAnswer,
        similarityScore,
        modelToUse,
      );
      modelUsed = modelToUse;
    } catch (error) {
      console.warn("Primary evaluation failed, trying fallback:", error);

      try {
        // Try fallback model
        evaluation = await evaluateWithGroq(
          question,
          answer,
          topic,
          normalizedReferenceAnswer,
          similarityScore,
          MODELS.fallback,
        );
        modelUsed = MODELS.fallback;
      } catch (fallbackError) {
        console.error("All evaluations failed:", fallbackError);

        // Return a basic fallback evaluation
        evaluation = {
          score: calculateCombinedScore(similarityScore, similarityScore),
          feedback:
            "Unable to evaluate your answer at this time. Please continue with the lesson.",
          hint: "",
        };
        modelUsed = "fallback";
      }
    }

    // Ensure evaluation has required fields
    const normalizedAiScore = clampScore(
      typeof evaluation.score === "number" ? evaluation.score : 0,
    );
    // Blend semantic and lexical signals (AI_SCORE_WEIGHT/SIMILARITY_SCORE_WEIGHT)
    // to reward conceptual understanding while still benefiting from keyword overlap.
    const combinedScore = calculateCombinedScore(
      normalizedAiScore,
      similarityScore,
    );
    const correct = combinedScore >= SIMILARITY_THRESHOLD;
    if (!evaluation.feedback) {
      evaluation.feedback = correct
        ? "Great job! You captured the key idea."
        : "Thank you for your answer. Let's refine it a bit.";
    }
    if (!evaluation.hint || correct) {
      evaluation.hint = "";
    }

    return NextResponse.json({
      correct,
      feedback: evaluation.feedback,
      hint: evaluation.hint,
      score: roundScore(combinedScore),
      modelUsed,
      question,
      topic,
    });
  } catch (error) {
    console.error("Error evaluating answer:", error);
    return NextResponse.json(
      {
        error: "Failed to evaluate answer",
        correct: false,
        score: roundScore(similarityScore),
        feedback:
          "An error occurred while evaluating your answer. Please try again.",
        hint: "",
      },
      { status: 500 },
    );
  }
}
