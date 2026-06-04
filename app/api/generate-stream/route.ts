import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/env";
import { PROMPT_CORE, buildUserContent, classifyRequest } from "@/lib/generation";

// Streaming variant of /api/generate. The user-facing prompt streams as plain
// text (so it materializes live); the metadata follows a ===META=== sentinel as
// one JSON line. This is the "split the response" resolution to the
// streaming-vs-structured-output tension — see the level-up plan, Phase 2.1.
const SYSTEM_PROMPT = `${PROMPT_CORE}

OUTPUT FORMAT — follow EXACTLY:
1. First, write the complete optimized prompt in the SAME LANGUAGE as the user's input (English goal → write in English; Czech goal → write in Czech), as plain text with ### section headers. Write nothing before it.
2. Then a line containing exactly: ===META===
3. Then ONE line of minified JSON (no markdown, no backticks):
{"detectedLanguage":"<iso 639-1>","promptEnglish":"<the same optimized prompt in English; empty string if the input was already English>","assumptions":["Topic: assumed value"],"recommendedModel":"Claude|ChatGPT|Gemini","whyThisModel":"<one sentence>","alternatives":["<alt 1 + reason>","<alt 2 + reason>"]}
Write nothing after the JSON.

Model guide: Claude = structured tasks, analysis, coding, long-form writing. ChatGPT = creative content, marketing, conversational. Gemini = research, multimodal, data analysis.`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { isRefine, isIntake, intakeGoal } = classifyRequest(body);

  if (!isRefine && !isIntake && !body.task) {
    return new Response(JSON.stringify({ error: "Goal or task is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (intakeGoal.length > 2000 || (typeof body.task === "string" && body.task.length > 2000)) {
    return new Response(JSON.stringify({ error: "Input exceeds maximum length" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userContent = buildUserContent(body);
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = await client.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 8192,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userContent }],
          stream: true,
        });
        for await (const event of anthropicStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (error) {
        console.error("Stream error:", error instanceof Error ? error.message : error);
        // Emit an empty meta so the client detects failure and falls back to
        // the non-streaming /api/generate (which has the tool-use guarantee).
        controller.enqueue(encoder.encode("\n===META===\n{}"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
