import { NextRequest, NextResponse } from "next/server";

// Groq model selection strategy
const MODELS = {
  default: "llama-3.1-8b-instant",
  fallback: "llama-3.3-70b-versatile",
  upgrade: "llama-3.3-70b-versatile", // Used when student fails twice
};

async function generateQuestionWithGroq(
  topic: string,
  model: string = MODELS.default,
) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Groq API key not configured");
  }

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
              "You are an expert educational assistant. Generate a thoughtful, open-ended question that tests understanding of the given topic. The question should be clear, concise, and encourage critical thinking. Avoid yes/no questions.",
          },
          {
            role: "user",
            content: `Generate a reflection question about: ${topic}`,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    let question;
    let modelUsed = MODELS.default;

    try {
      // Try primary model first
      question = await generateQuestionWithGroq(topic, MODELS.default);
      modelUsed = MODELS.default;
    } catch (error) {
      console.warn("Primary model failed, trying fallback:", error);

      try {
        // Try fallback model
        question = await generateQuestionWithGroq(topic, MODELS.fallback);
        modelUsed = MODELS.fallback;
      } catch (fallbackError) {
        console.error("All models failed:", fallbackError);

        // Return a fallback question if all AI models fail
        question = `What key concepts did you learn about ${topic}? How would you explain them to someone else?`;
        modelUsed = "fallback";
      }
    }

    return NextResponse.json({
      question,
      modelUsed,
      topic,
    });
  } catch (error) {
    console.error("Error generating question:", error);
    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 },
    );
  }
}
