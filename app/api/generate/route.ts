import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/env";
import { rateLimit, clientKey, tooManyRequests } from "@/lib/rateLimit";
import {
  PROMPT_CORE,
  buildUserContent,
  validateGenerateBody,
  type GenerateBody,
} from "@/lib/generation";

const tool: Anthropic.Tool = {
  name: "submit_optimized_prompt",
  description: "Return the improved prompt and its translations.",
  input_schema: {
    type: "object",
    properties: {
      promptEnglish: { type: "string" },
      promptLocalized: { type: "string" },
      detectedLanguage: { type: "string" },
      assumptions: { type: "array", items: { type: "string" } },
      recommendedModel: {
        type: "string",
        enum: ["Claude", "ChatGPT", "Gemini"],
      },
      whyThisModel: { type: "string" },
      alternatives: { type: "array", items: { type: "string" } },
    },
    required: [
      "promptEnglish",
      "promptLocalized",
      "detectedLanguage",
      "assumptions",
      "recommendedModel",
      "whyThisModel",
      "alternatives",
    ],
  },
};

export async function POST(req: NextRequest) {
  const rl = rateLimit(`generate:${clientKey(req)}`, {
    limit: 15,
    windowMs: 60000,
  });
  if (!rl.ok) return tooManyRequests(rl);
  let body: GenerateBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const invalid = validateGenerateBody(body);
  if (invalid) return Response.json({ error: invalid }, { status: 400 });
  try {
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: `${PROMPT_CORE}\nUse the submit_optimized_prompt tool. Always provide promptEnglish. Provide promptLocalized when the selected language is not English, otherwise an empty string.`,
      tools: [tool],
      tool_choice: { type: "tool", name: tool.name },
      messages: [{ role: "user", content: buildUserContent(body) }],
    });
    const output = message.content.find((b) => b.type === "tool_use");
    if (!output || output.type !== "tool_use")
      throw new Error("Missing output");
    const data = output.input as Record<string, unknown>;
    if (typeof data.promptEnglish !== "string" || !data.promptEnglish.trim())
      throw new Error("Missing prompt");
    if (
      body.lang === "cs" &&
      (typeof data.promptLocalized !== "string" || !data.promptLocalized.trim())
    )
      throw new Error("Missing translation");
    return Response.json({
      ...data,
      prompt:
        typeof data.promptLocalized === "string" && data.promptLocalized
          ? data.promptLocalized
          : data.promptEnglish,
    });
  } catch (error) {
    console.error(
      "Prompt generation failed:",
      error instanceof Error ? error.name : "UnknownError",
    );
    return Response.json(
      { error: "Generation unavailable. Please try again." },
      { status: 503 },
    );
  }
}
