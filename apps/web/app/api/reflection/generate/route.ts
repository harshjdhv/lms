import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@workspace/database";
import { formatLearningMemoryForPrompt } from "@/lib/learning-memory";

// Groq model selection strategy
const MODELS = {
  default: "llama-3.1-8b-instant",
  fallback: "llama-3.3-70b-versatile",
  upgrade: "llama-3.3-70b-versatile", // Used when student fails twice
};

async function generateQuizWithGroq(
  input: {
    topic?: string;
    transcriptText?: string;
    learningMemoryContext?: string;
  },
  model: string = MODELS.default,
): Promise<{ question: string; referenceAnswer: string }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Groq API key not configured");
  }

  const hasTranscript = Boolean(input.transcriptText?.trim());
  const personalizationContext =
    input.learningMemoryContext ??
    "No learner memory available. Ask a neutral mid-level question.";
  const systemContent = hasTranscript
    ? `You are an expert educational assistant. You will be given a video transcript (content the student has watched up to a certain point). Generate a single open-ended quiz question that tests understanding of the content in that transcript ONLY. Do not ask about anything beyond the transcript.
Use the learner memory to personalize difficulty, tone, and style. Focus on weak topics when relevant and avoid generic wording.
Return ONLY a valid JSON object with this exact shape (no markdown, no extra text):
{"question": "the question text", "referenceAnswer": "a concise model answer"}
- question: one clear short-answer question about the transcript content.
- referenceAnswer: a concise, correct answer (1-3 sentences max) the student should provide.
Be concise. The question should feel like a quiz/test.`
    : `You are an expert educational assistant. Generate a single open-ended quiz question that tests understanding of the topic.
Use the learner memory to personalize difficulty, tone, and style. Focus on weak topics when relevant and avoid generic wording.
Return ONLY a valid JSON object with this exact shape (no markdown, no extra text):
{"question": "the question text", "referenceAnswer": "a concise model answer"}
- question: one clear short-answer question about the topic.
- referenceAnswer: a concise, correct answer (1-3 sentences max) the student should provide.
Be concise. The question should feel like a quiz/test.`;

  const userContent = hasTranscript
    ? `Learner memory:\n${personalizationContext}\n\nTranscript (content watched so far):\n\n${(input.transcriptText ?? "").slice(0, 8000)}\n\nGenerate a quiz question based ONLY on this transcript.`
    : `Learner memory:\n${personalizationContext}\n\nTopic: ${input.topic ?? "general"}. Generate a quiz question.`;

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
          { role: "system", content: systemContent },
          { role: "user", content: userContent },
        ],
        max_tokens: 350,
        temperature: 0.5,
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
    const question = typeof parsed.question === "string" ? parsed.question : "";
    const referenceAnswer =
      typeof parsed.referenceAnswer === "string" ? parsed.referenceAnswer : "";
    return { question, referenceAnswer };
  } catch {
    throw new Error("Invalid quiz JSON from model");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { topic, transcriptText, studentId } = body as {
      topic?: string;
      transcriptText?: string;
      studentId?: string;
    };

    const hasTranscript = Boolean(transcriptText?.trim());
    if (!topic && !hasTranscript) {
      return NextResponse.json(
        { error: "Either topic or transcriptText is required" },
        { status: 400 },
      );
    }

    const memory = studentId
      ? await prisma.studentReflectionMemory.findUnique({
          where: { userId: studentId },
        })
      : null;
    const input = {
      topic: topic ?? "content so far",
      transcriptText,
      learningMemoryContext: formatLearningMemoryForPrompt(memory),
    };

    let result: { question: string; referenceAnswer: string };
    let modelUsed = MODELS.default;

    try {
      result = await generateQuizWithGroq(input, MODELS.default);
      modelUsed = MODELS.default;
    } catch (error) {
      console.warn("Primary model failed, trying fallback:", error);
      try {
        result = await generateQuizWithGroq(input, MODELS.fallback);
        modelUsed = MODELS.fallback;
      } catch (fallbackError) {
        console.error("All models failed:", fallbackError);
        result = {
          question: hasTranscript
            ? "What was a key point covered in the content you just watched?"
            : `What is a key concept or takeaway regarding ${input.topic}?`,
          referenceAnswer:
            "Summarize the most important concept or takeaway in your own words.",
        };
        modelUsed = "fallback";
      }
    }

    return NextResponse.json({
      question: result.question,
      referenceAnswer: result.referenceAnswer,
      modelUsed,
      topic: input.topic,
      fromTranscript: hasTranscript,
      personalized: Boolean(memory),
    });
  } catch (error) {
    console.error("Error generating question:", error);
    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 },
    );
  }
}
