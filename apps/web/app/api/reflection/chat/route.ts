import { NextRequest, NextResponse } from "next/server";
import { searchSerper } from "@/lib/serper";

const MODELS = {
  default: "llama-3.1-8b-instant",
  fallback: "llama-3.3-70b-versatile",
};

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Groq API key not configured" },
        { status: 500 },
      );
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 },
      );
    }

    const referenceAnswer =
      typeof context?.referenceAnswer === "string" ? context.referenceAnswer : "";

    // System prompt setup
    const systemPrompt = `You are a helpful and patient AI tutor. A student has just answered a quiz question INCORRECTLY.
    
    CONTEXT:
    - Topic: ${context.topic}
    - Question they missed: "${context.question}"
    - Their wrong answer: "${context.wrongAnswer}"
    - Reference answer: "${referenceAnswer || "Not provided"}"
    - Transcript context: "${context.transcriptContext || "Not available"}"

    YOUR GOAL:
    1. Help the student understand why their answer was wrong and what the correct concept is.
    2. Be conversational and encouraging. Do not just lecture; ask if they understand.
    3. Answer any questions they have about the topic.
    
    RESOURCES:
    - If you think an **visual aid** (diagram, chart) or a **video explanation** would actally help the student understand better, you can request one.
    - Do not request resources for every single message, only when the topic is visual or complex.
    
    INTENT DETECTION:
    - You must detect if the student is ready to retry the quiz.
    - If the user says "YES" (case insensitive), "I'm ready", "Try again", or demonstrates they key concept clearly and asks to move on.
    
    OUTPUT FORMAT:
    You must ALWAYS return a JSON object.
    
    Structure:
    {
      "message": "Your response...",
      "status": "CHAT" | "READY",
      "resourceRequest": {
         "type": "images" | "videos" | null,
         "query": "search query string..."
      }
    }
    
    - Set "status" to "READY" ONLY if the student explicitly asks to retry or clearly confirms they understand and are ready.
    - If you want to show an image of a cell, set resourceRequest: { type: "images", query: "animal cell structure diagram" }.
    - If you want a video, set type: "videos".
    - If no resource needed, set resourceRequest: null.
    `;

    // Prepare messages for Groq
    const groqMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role, // 'user' or 'assistant'
        content: m.content,
      })),
    ];

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
          messages: groqMessages,
          response_format: { type: "json_object" },
          max_tokens: 1000,
          temperature: 0.7,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      // Fallback if model fails to output JSON (rare with json_object mode but possible)
      parsedContent = {
        message: content,
        status: "CHAT",
      };
    }

    // Process Resource Request if present
    if (
      parsedContent.resourceRequest &&
      parsedContent.resourceRequest.type &&
      parsedContent.resourceRequest.query
    ) {
      const { type, query } = parsedContent.resourceRequest;
      console.log(`[Chat] Fetching resources: ${type} for "${query}"`);

      const resources = await searchSerper(query, type as any, 2);
      parsedContent.resources = {
        type,
        data: resources,
      };
      // Remove the request from client output to keep it clean, or keep it for debugging
      delete parsedContent.resourceRequest;
    }

    return NextResponse.json(parsedContent);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 },
    );
  }
}
