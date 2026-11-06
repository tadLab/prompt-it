import type { PromptResult } from "../hooks/usePromptStore";

/** Keep the canonical prompt and the selected translation in sync after editing. */
export function applyPromptEdit(
  result: PromptResult,
  text: string,
  language: "local" | "en",
): PromptResult {
  if (language === "en") {
    return {
      ...result,
      promptEnglish: text,
      ...(result.detectedLanguage === "en" ? { prompt: text } : {}),
    };
  }
  return {
    ...result,
    prompt: text,
    promptLocalized: text,
    ...(result.detectedLanguage === "en" ? { promptEnglish: text } : {}),
  };
}
