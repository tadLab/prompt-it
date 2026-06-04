import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/env";

// Adaptive intake: given the user's rough goal, ask the few clarifying questions
// THIS goal actually needs — the opposite of a fixed form that asks everyone the
// same thing. Attacks underspecification, the #1 prompting failure mode.
const SYSTEM_PROMPT = `You are an expert prompt engineer running a quick intake.

The user gives you a rough goal. Generate 3–5 SHORT clarifying questions whose answers would most improve the final prompt. Rules:
- Tailor every question to THIS specific goal. Never ask generic boilerplate that applies to any task.
- Each question must target a different high-impact gap (audience, tone, length, format, constraints, key details, etc.) — pick the ones that matter for this goal.
- Keep questions short and plain. No jargon.
- For each question, offer 2–4 quick-pick suggestions when natural (e.g. tone or length options) so the user can answer in one tap. Leave suggestions empty when free text fits better.
- Write the questions in the SAME LANGUAGE as the user's goal.

Return your result by calling the submit_questions tool.`;

const QUESTIONS_TOOL: Anthropic.Tool = {
  name: "submit_questions",
  description: "Submit the clarifying questions for the user's goal.",
  input_schema: {
    type: "object",
    properties: {
      detectedLanguage: {
        type: "string",
        description: "ISO 639-1 code of the user's goal language, e.g. 'en', 'cs'.",
      },
      questions: {
        type: "array",
        description: "3–5 short, goal-specific clarifying questions.",
        items: {
          type: "object",
          properties: {
            id: { type: "string", description: "Short stable id, e.g. 'audience'." },
            question: { type: "string", description: "The question text, in the user's language." },
            suggestions: {
              type: "array",
              items: { type: "string" },
              description: "0–4 quick-pick answer chips. Empty when free text is better.",
            },
          },
          required: ["id", "question", "suggestions"],
        },
      },
    },
    required: ["detectedLanguage", "questions"],
  },
};

interface ClarifyQuestion {
  id: string;
  question: string;
  suggestions: string[];
}

interface ClarifyOutput {
  detectedLanguage: string;
  questions: ClarifyQuestion[];
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const goal = typeof body.goal === "string" ? body.goal.trim() : "";

  if (!goal) {
    return NextResponse.json({ error: "Goal is required" }, { status: 400 });
  }
  if (goal.length > 2000) {
    return NextResponse.json({ error: "Goal exceeds maximum length" }, { status: 400 });
  }

  try {
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: [QUESTIONS_TOOL],
      tool_choice: { type: "tool", name: QUESTIONS_TOOL.name },
      messages: [{ role: "user", content: `Goal: ${goal}` }],
    });

    const toolUse = message.content.find((block) => block.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error("Model did not return a tool call");
    }

    const out = toolUse.input as ClarifyOutput;
    const questions = Array.isArray(out.questions) ? out.questions.slice(0, 5) : [];

    return NextResponse.json({
      detectedLanguage: out.detectedLanguage || "en",
      questions,
    });
  } catch (error) {
    console.error("Clarify error:", error instanceof Error ? error.message : error);
    // Non-blocking: if questions can't be generated, the client proceeds
    // straight to generation. Return an empty list, not an error.
    return NextResponse.json({ detectedLanguage: "en", questions: [] });
  }
}
