import { NextRequest, NextResponse } from "next/server";

const MODELS = {
  default: "llama-3.1-8b-instant",
  fallback: "llama-3.3-70b-versatile",
};

async function generateRemediation(
  transcriptText: string,
  failedQuestion: any,
  wrongAnswerIndex: number,
) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Groq API key not configured");

  const systemContent = `You are a patient and clear teacher. A student answered a question incorrectly based on a video transcript.
  
  Your goal is to:
  1. Explain the concept clearly and simply, addressing why their answer might be wrong (without simply saying "You are wrong").
  2. Create a NEW, SIMPLER multiple-choice question to test the same concept. The new question should be easier than the original one.
  
  Return ONLY a valid JSON object with:
  - "explanation": string (The teaching part, keep it conversational and encouraging)
  - "newQuestion": object with:
    - "question": string
    - "options": array of 4 strings
    - "correctIndex": number
  `;

  const userContent = `
  Transcript Snippet: ...${transcriptText.slice(0, 4000)}...
  
  Original Question: ${failedQuestion.question}
  Options: ${JSON.stringify(failedQuestion.options)}
  Student's Answer (Index ${wrongAnswerIndex}): ${failedQuestion.options[wrongAnswerIndex]}
  Correct Answer: ${failedQuestion.options[failedQuestion.correctIndex]}
  
  The student failed this. Teach them and give a simpler question.
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
        model: MODELS.default,
        messages: [
          { role: "system", content: systemContent },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
        max_tokens: 800,
        temperature: 0.5,
      }),
    },
  );

  if (!response.ok) throw new Error(`Groq API error: ${response.statusText}`);

  const data = await response.json();
  const content = data.choices[0].message.content;

  return JSON.parse(content);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcriptText, failedQuestion, wrongAnswerIndex } = body;

    if (!failedQuestion) {
      return NextResponse.json(
        { error: "Question data required" },
        { status: 400 },
      );
    }

    const result = await generateRemediation(
      transcriptText,
      failedQuestion,
      wrongAnswerIndex,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Remediation error", error);
    return NextResponse.json(
      { error: "Failed to generate remediation" },
      { status: 500 },
    );
  }
}
