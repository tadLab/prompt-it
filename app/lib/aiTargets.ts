/**
 * AI target deep-links — the "Open in AI" feature.
 *
 * Each target builds a URL that opens the provider's chat with the prompt
 * pre-filled via a query param. Prefill support varies by provider and changes
 * over time, so the UI ALWAYS copies the prompt to the clipboard first — if a
 * provider doesn't honor the param (notably Gemini), the user can just paste.
 * That makes the feature robust regardless of any single provider's behavior.
 */

export type AiTargetId = "chatgpt" | "claude" | "gemini";

export interface AiTarget {
  id: AiTargetId;
  label: string;
  /** Builds the deep-link URL with the prompt URL-encoded into the query. */
  buildUrl: (prompt: string) => string;
}

export const AI_TARGETS: AiTarget[] = [
  {
    id: "chatgpt",
    label: "ChatGPT",
    buildUrl: (p) => `https://chatgpt.com/?q=${encodeURIComponent(p)}`,
  },
  {
    id: "claude",
    label: "Claude",
    buildUrl: (p) => `https://claude.ai/new?q=${encodeURIComponent(p)}`,
  },
  {
    id: "gemini",
    label: "Gemini",
    buildUrl: (p) => `https://gemini.google.com/app?q=${encodeURIComponent(p)}`,
  },
];

/**
 * Maps a free-text model recommendation ("Claude", "ChatGPT (great for...)",
 * "GPT-4", "Google Gemini") to a known target id, or null if none matches.
 * Kept liberal because the model name comes from the LLM and varies in wording.
 */
export function targetIdForModel(
  model: string | undefined | null,
): AiTargetId | null {
  if (!model) return null;
  const m = model.toLowerCase();
  if (m.includes("chatgpt") || m.includes("gpt") || m.includes("openai"))
    return "chatgpt";
  if (m.includes("claude") || m.includes("anthropic")) return "claude";
  if (m.includes("gemini") || m.includes("bard") || m.includes("google"))
    return "gemini";
  return null;
}

export function getTarget(id: AiTargetId): AiTarget {
  return AI_TARGETS.find((t) => t.id === id)!;
}
