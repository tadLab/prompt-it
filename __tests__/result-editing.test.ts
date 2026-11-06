import { describe, it, expect } from "vitest";
import { applyPromptEdit } from "../app/lib/resultEditing";
import { validateGenerateBody, buildUserContent } from "../lib/generation";
const base = {
  prompt: "Český prompt",
  promptEnglish: "English prompt",
  detectedLanguage: "cs",
  recommendedModel: "Claude",
  whyThisModel: "reason",
  alternatives: [],
  historyId: "saved",
};
describe("prompt edits", () => {
  it("saves the local canonical version without destroying English", () => {
    const updated = applyPromptEdit(base, "Upraveno", "local");
    expect(updated.prompt).toBe("Upraveno");
    expect(updated.promptLocalized).toBe("Upraveno");
    expect(updated.promptEnglish).toBe("English prompt");
    expect(updated.historyId).toBe("saved");
  });
  it("edits English independently for a Czech result", () => {
    const updated = applyPromptEdit(base, "Edited", "en");
    expect(updated.prompt).toBe("Český prompt");
    expect(updated.promptEnglish).toBe("Edited");
  });
  it("keeps canonical English synchronized", () => {
    expect(
      applyPromptEdit({ ...base, detectedLanguage: "en" }, "Edited", "en")
        .prompt,
    ).toBe("Edited");
  });
});
describe("generation inputs", () => {
  it("rejects malformed and unbounded data", () => {
    expect(validateGenerateBody(null)).toBeTruthy();
    expect(validateGenerateBody({ goal: "a".repeat(2001) })).toBeTruthy();
    expect(validateGenerateBody({ goal: "Hi", answers: [null] })).toBeTruthy();
    expect(
      validateGenerateBody({
        refinePrompt: "a".repeat(30001),
        feedback: "shorter",
      }),
    ).toBeTruthy();
  });
  it("accepts bounded intake and refinement", () => {
    expect(
      validateGenerateBody({
        goal: "A helpful email",
        lang: "cs",
        answers: [],
      }),
    ).toBeNull();
    expect(
      validateGenerateBody({ refinePrompt: "A prompt", feedback: "Shorter" }),
    ).toBeNull();
  });
  it("keeps selected Czech authoritative", () => {
    expect(buildUserContent({ goal: "Write an email", lang: "cs" })).toContain(
      "The user selected Czech",
    );
  });
});
