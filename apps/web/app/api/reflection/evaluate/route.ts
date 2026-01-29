import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@workspace/database";

const MODELS = {
  default: "llama-3.1-8b-instant",
  fallback: "llama-3.3-70b-versatile",
  upgrade: "llama-3.3-70b-versatile", // Used when student fails twice
};

async function evaluateWithGroq(
  question: string,
  answer: string,
  topic: string,
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
Student's Answer: ${answer}

Provide your evaluation as a JSON object with:
{
  "correct": boolean,
  "feedback": "specific feedback on their answer",
  "hint": "a helpful hint if incorrect (or empty string if correct)"
}

Be encouraging but accurate. For partially correct answers, focus on what they got right and what needs improvement. Provide specific, actionable hints.
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
    return JSON.parse(content);
  } catch (parseError) {
    console.error("Failed to parse AI response as JSON:", content);
    // Fallback evaluation
    return {
      correct: false,
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
  try {
    const { question, answer, topic, studentId } = await request.json();

    if (!question || !answer || !topic || !studentId) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    // Check student's previous attempts to decide model
    const previousAttempts = await getStudentAttempts(studentId, topic);
    const shouldUpgrade = previousAttempts >= 2;
    const modelToUse = shouldUpgrade ? MODELS.upgrade : MODELS.default;

    let evaluation;
    let modelUsed = MODELS.default;

    try {
      // Try primary evaluation
      evaluation = await evaluateWithGroq(question, answer, topic, modelToUse);
      modelUsed = modelToUse;
    } catch (error) {
      console.warn("Primary evaluation failed, trying fallback:", error);

      try {
        // Try fallback model
        evaluation = await evaluateWithGroq(
          question,
          answer,
          topic,
          MODELS.fallback,
        );
        modelUsed = MODELS.fallback;
      } catch (fallbackError) {
        console.error("All evaluations failed:", fallbackError);

        // Return a basic fallback evaluation
        evaluation = {
          correct: false,
          feedback:
            "Unable to evaluate your answer at this time. Please continue with the lesson.",
          hint: "",
        };
        modelUsed = "fallback";
      }
    }

    // Ensure evaluation has required fields
    if (typeof evaluation.correct !== "boolean") {
      evaluation.correct = false;
    }
    if (!evaluation.feedback) {
      evaluation.feedback = "Thank you for your answer.";
    }
    if (!evaluation.hint) {
      evaluation.hint = "";
    }

    return NextResponse.json({
      ...evaluation,
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
        feedback:
          "An error occurred while evaluating your answer. Please try again.",
        hint: "",
      },
      { status: 500 },
    );
  }
}
