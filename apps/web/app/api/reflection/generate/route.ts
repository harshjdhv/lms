import { NextRequest, NextResponse } from "next/server";

// Groq model selection strategy
const MODELS = {
  default: "llama-3.1-8b-instant",
  fallback: "llama-3.3-70b-versatile",
  upgrade: "llama-3.3-70b-versatile", // Used when student fails twice
};

async function generateQuizWithGroq(
  input: { topic?: string; transcriptText?: string },
  model: string = MODELS.default,
): Promise<{ question: string; options: string[]; correctIndex: number }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Groq API key not configured");
  }

  const hasTranscript = Boolean(input.transcriptText?.trim());
  const systemContent = hasTranscript
    ? `You are an expert educational assistant. You will be given a video transcript (content the student has watched up to a certain point). Generate a single quiz question (multiple choice) that tests understanding of the content in that transcript ONLY. Do not ask about anything beyond the transcript.
Return ONLY a valid JSON object with this exact shape (no markdown, no extra text):
{"question": "the question text", "options": ["option A", "option B", "option C", "option D"], "correctIndex": 0}
- question: one clear multiple-choice question about the transcript content.
- options: exactly 4 plausible options, one correct and three plausible distractors.
- correctIndex: 0-3, the index of the correct option in the options array.
Be concise. The question should feel like a quiz/test.`
    : `You are an expert educational assistant. Generate a single quiz question (multiple choice) that tests understanding of the topic.
Return ONLY a valid JSON object with this exact shape (no markdown, no extra text):
{"question": "the question text", "options": ["option A", "option B", "option C", "option D"], "correctIndex": 0}
- question: one clear multiple-choice question about the topic.
- options: exactly 4 plausible options, one correct and three plausible distractors.
- correctIndex: 0-3, the index of the correct option in the options array.
Be concise. The question should feel like a quiz/test.`;

  const userContent = hasTranscript
    ? `Transcript (content watched so far):\n\n${(input.transcriptText ?? "").slice(0, 8000)}\n\nGenerate a quiz question based ONLY on this transcript.`
    : `Topic: ${input.topic ?? "general"}. Generate a quiz question.`;

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
    const options = Array.isArray(parsed.options) ? parsed.options.slice(0, 4).map(String) : [];
    let correctIndex = typeof parsed.correctIndex === "number" ? parsed.correctIndex : 0;
    if (correctIndex < 0 || correctIndex >= options.length) correctIndex = 0;
    return { question, options, correctIndex };
  } catch {
    throw new Error("Invalid quiz JSON from model");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { topic, transcriptText } = body as { topic?: string; transcriptText?: string };

    const hasTranscript = Boolean(transcriptText?.trim());
    if (!topic && !hasTranscript) {
      return NextResponse.json(
        { error: "Either topic or transcriptText is required" },
        { status: 400 },
      );
    }

    const input = { topic: topic ?? "content so far", transcriptText };

    let result: { question: string; options: string[]; correctIndex: number };
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
          options: [
            "I need to review the material.",
            "I understood the main idea.",
            "I can explain it to someone else.",
            "I'm not sure yet.",
          ],
          correctIndex: 1,
        };
        modelUsed = "fallback";
      }
    }

    return NextResponse.json({
      question: result.question,
      options: result.options,
      correctIndex: result.correctIndex,
      modelUsed,
      topic: input.topic,
      fromTranscript: hasTranscript,
    });
  } catch (error) {
    console.error("Error generating question:", error);
    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 },
    );
  }
}
