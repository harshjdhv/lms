import { NextRequest, NextResponse } from "next/server";

const MODELS = {
  default: "llama-3.1-8b-instant",
  fallback: "llama-3.3-70b-versatile",
};

async function generateBatchQuiz(
  transcriptText: string,
  count: number = 4,
): Promise<any[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Groq API key not configured");

  const systemContent = `You are an expert educational assistant. 
  Given a video transcript, generate ${count} distinct multiple-choice questions that test understanding of the key concepts covered in the transcript.
  
  Return ONLY a valid JSON object with a single key "questions" containing an array of objects.
  Each object must have:
  - "id": string (unique id)
  - "question": string (the question text)
  - "options": array of 4 strings (1 correct, 3 distractors)
  - "correctIndex": number (0-3)
  
  The questions should covers different parts or concepts if possible. Be concise.`;

  const userContent = `Transcript (content watched so far):\n\n${transcriptText.slice(0, 12000)}\n\nGenerate ${count} quiz questions.`;

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODELS.default,
        messages: [
          { role: "system", content: systemContent },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
        max_tokens: 1024,
        temperature: 0.5,
      }),
    },
  );

  if (!response.ok) throw new Error(`Groq API error: ${response.statusText}`);

  const data = await response.json();
  const content = data.choices[0].message.content;

  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed.questions) ? parsed.questions : [];
  } catch (e) {
    console.error("Failed to parse batch quiz", e);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcriptText, count = 3 } = body;

    if (!transcriptText) {
      return NextResponse.json(
        { error: "Transcript required" },
        { status: 400 },
      );
    }

    const questions = await generateBatchQuiz(transcriptText, count);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Batch generate error", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 },
    );
  }
}
