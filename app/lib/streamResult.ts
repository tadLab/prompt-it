import type { PromptResult } from "../hooks/usePromptStore";

// The streaming response is "prompt prose" + a sentinel + a JSON metadata line.
export const META_SENTINEL = "===META===";

/** The visible prompt text so far (everything before the sentinel). */
export function promptBeforeMeta(buffer: string): string {
  const idx = buffer.indexOf(META_SENTINEL);
  return (idx === -1 ? buffer : buffer.slice(0, idx)).replace(/^\s+/, "");
}

interface StreamMeta {
  detectedLanguage?: string;
  promptEnglish?: string;
  assumptions?: string[];
  recommendedModel?: string;
  whyThisModel?: string;
  alternatives?: string[];
}

/**
 * Build a full PromptResult from the complete streamed text. Defensive by
 * design: if the metadata JSON is missing or malformed, the prompt (the part
 * that matters) is preserved and the metadata degrades to sensible defaults.
 */
export function parseStreamedResult(fullText: string): PromptResult {
  const idx = fullText.indexOf(META_SENTINEL);
  const promptPart = (idx === -1 ? fullText : fullText.slice(0, idx)).trim();
  const metaRaw = idx === -1 ? "" : fullText.slice(idx + META_SENTINEL.length);

  let meta: StreamMeta = {};
  if (metaRaw.trim()) {
    try {
      const match = metaRaw.match(/\{[\s\S]*\}/);
      if (match) meta = JSON.parse(match[0]) as StreamMeta;
    } catch {
      meta = {};
    }
  }

  const isEnglish = (meta.detectedLanguage || "en").toLowerCase().startsWith("en");

  return {
    prompt: promptPart,
    promptEnglish: isEnglish ? promptPart : meta.promptEnglish || "",
    promptLocalized: isEnglish ? "" : promptPart,
    detectedLanguage: meta.detectedLanguage || "en",
    assumptions: Array.isArray(meta.assumptions) ? meta.assumptions : [],
    recommendedModel: meta.recommendedModel || "Claude",
    whyThisModel: meta.whyThisModel || "Best suited for this structured task.",
    alternatives:
      Array.isArray(meta.alternatives) && meta.alternatives.length
        ? meta.alternatives
        : ["ChatGPT", "Gemini"],
  };
}

/** True once we have a usable prompt (used to decide whether to fall back). */
export function hasUsablePrompt(fullText: string): boolean {
  return parseStreamedResult(fullText).prompt.length > 0;
}
