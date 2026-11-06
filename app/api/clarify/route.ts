import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/env";
import { rateLimit, clientKey, tooManyRequests } from "@/lib/rateLimit";

// Adaptive intake: given the user's rough goal, ask the few clarifying questions
// THIS goal actually needs — the opposite of a fixed form that asks everyone the
// same thing. Attacks underspecification, the #1 prompting failure mode.
const SYSTEM_PROMPT = `You are an expert prompt engineer running a quick intake.

The user gives you a rough goal. Generate 0–2 SHORT clarifying questions whose answers would most improve the final prompt. Return no questions if the goal is already specific enough. Rules:
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
        description:
          "ISO 639-1 code of the user's goal language, e.g. 'en', 'cs'.",
      },
      questions: {
        type: "array",
        description: "0–2 short, goal-specific clarifying questions.",
        maxItems: 2,
        items: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Short stable id, e.g. 'audience'.",
            },
            question: {
              type: "string",
              description: "The question text, in the user's language.",
            },
            suggestions: {
              type: "array",
              items: { type: "string" },
              description:
                "0–4 quick-pick answer chips. Empty when free text is better.",
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
  const rl = rateLimit(`clarify:${clientKey(req)}`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!rl.ok) return tooManyRequests(rl);

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object")
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const goal = typeof body.goal === "string" ? body.goal.trim() : "";

  if (!goal) {
    return NextResponse.json({ error: "Goal is required" }, { status: 400 });
  }
  if (goal.length > 2000) {
    return NextResponse.json(
      { error: "Goal exceeds maximum length" },
      { status: 400 },
    );
  }

  // The user's selected UI language overrides auto-detection of the goal text.
  const langName =
    body.lang === "cs" ? "Czech" : body.lang === "en" ? "English" : null;
  const userMessage = langName
    ? `Goal: ${goal}\n\nWrite the questions in ${langName}.`
    : `Goal: ${goal}`;

  try {
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: [QUESTIONS_TOOL],
      tool_choice: { type: "tool", name: QUESTIONS_TOOL.name },
      messages: [{ role: "user", content: userMessage }],
    });

    const toolUse = message.content.find((block) => block.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error("Model did not return a tool call");
    }

    const out = toolUse.input as ClarifyOutput;
    const questions = Array.isArray(out.questions)
      ? out.questions
          .filter((q) => typeof q?.question === "string")
          .slice(0, 2)
          .map((q, i) => ({
            id: `q${i}`,
            question: q.question,
            suggestions: Array.isArray(q.suggestions)
              ? q.suggestions.filter((s) => typeof s === "string").slice(0, 4)
              : [],
          }))
      : [];

    return NextResponse.json({
      detectedLanguage: out.detectedLanguage || "en",
      questions,
    });
  } catch (error) {
    console.error(
      "Clarify error:",
      error instanceof Error ? error.message : error,
    );
    // Keep service failure distinct from the valid "no questions needed" result.
    return NextResponse.json(
      { error: "Questions unavailable" },
      { status: 503 },
    );
  }
}
