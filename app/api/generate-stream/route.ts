import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/env";
import {
  PROMPT_CORE,
  buildUserContent,
  validateGenerateBody,
  type GenerateBody,
} from "@/lib/generation";
import { rateLimit, clientKey, tooManyRequests } from "@/lib/rateLimit";

const SYSTEM_PROMPT = `${PROMPT_CORE}
OUTPUT FORMAT:
First write only the complete improved prompt in the selected language. Use plain text, with ### headings only if needed.
Then a line containing exactly ===META===
Then one minified JSON object:
{"detectedLanguage":"en|cs","promptEnglish":"equivalent English prompt, or empty if already English","assumptions":["short assumption in selected language"],"recommendedModel":"Claude|ChatGPT|Gemini","whyThisModel":"one cautious practical reason in selected language","alternatives":["alternative name"]}
Write nothing after the JSON.`;

export async function POST(req: NextRequest) {
  const rl = rateLimit(`stream:${clientKey(req)}`, {
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
  let client: Anthropic;
  try {
    client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  } catch {
    return Response.json(
      { error: "Generation is not configured" },
      { status: 503 },
    );
  }
  const abort = new AbortController();
  req.signal.addEventListener("abort", () => abort.abort(), { once: true });
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const upstream = await client.messages.create(
          {
            model: "claude-sonnet-4-6",
            max_tokens: 8192,
            system: SYSTEM_PROMPT,
            messages: [{ role: "user", content: buildUserContent(body) }],
            stream: true,
          },
          { signal: abort.signal },
        );
        for await (const event of upstream) {
          if (abort.signal.aborted) break;
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          )
            controller.enqueue(encoder.encode(event.delta.text));
        }
      } catch (error) {
        if (!abort.signal.aborted) {
          console.error(
            "Prompt stream failed:",
            error instanceof Error ? error.name : "UnknownError",
          );
          controller.enqueue(encoder.encode("\n===ERROR===\n"));
        }
      } finally {
        if (!abort.signal.aborted) controller.close();
      }
    },
    cancel() {
      abort.abort();
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
