import { describe, it, expect } from "vitest";
import {
  META_SENTINEL,
  promptBeforeMeta,
  parseStreamedResult,
  hasUsablePrompt,
} from "../app/lib/streamResult";

const EN = `### Role\nYou are a copywriter.\n${META_SENTINEL}\n{"detectedLanguage":"en","promptEnglish":"","assumptions":["Tone: friendly"],"recommendedModel":"ChatGPT","whyThisModel":"Good at copy.","alternatives":["Claude — variants","Gemini — research"]}`;

const CS = `### Role\nJsi copywriter.\n${META_SENTINEL}\n{"detectedLanguage":"cs","promptEnglish":"### Role\\nYou are a copywriter.","assumptions":[],"recommendedModel":"Claude","whyThisModel":"x","alternatives":["a","b"]}`;

describe("promptBeforeMeta (streaming display)", () => {
  it("returns everything before the sentinel while streaming", () => {
    expect(promptBeforeMeta("### Role\npartial promp")).toContain("partial promp");
  });
  it("stops at the sentinel once it appears", () => {
    expect(promptBeforeMeta(EN)).not.toContain(META_SENTINEL);
    expect(promptBeforeMeta(EN)).toContain("You are a copywriter.");
  });
});

describe("parseStreamedResult", () => {
  it("English input: prompt is English, localized empty", () => {
    const r = parseStreamedResult(EN);
    expect(r.detectedLanguage).toBe("en");
    expect(r.promptLocalized).toBe("");
    expect(r.promptEnglish).toContain("You are a copywriter.");
    expect(r.recommendedModel).toBe("ChatGPT");
    expect(r.assumptions).toEqual(["Tone: friendly"]);
  });

  it("Czech input: streamed prose is localized, English comes from meta", () => {
    const r = parseStreamedResult(CS);
    expect(r.detectedLanguage).toBe("cs");
    expect(r.promptLocalized).toContain("Jsi copywriter.");
    expect(r.promptEnglish).toContain("You are a copywriter.");
    expect(r.recommendedModel).toBe("Claude");
  });

  it("malformed/empty metadata degrades gracefully but keeps the prompt", () => {
    const r = parseStreamedResult(`### Role\nSomething useful.\n${META_SENTINEL}\n{not json`);
    expect(r.prompt).toContain("Something useful.");
    expect(r.recommendedModel).toBe("Claude"); // default
    expect(r.alternatives.length).toBe(2);
    expect(r.assumptions).toEqual([]);
  });

  it("no sentinel at all (pure prose) still yields a prompt", () => {
    const r = parseStreamedResult("### Role\nJust a prompt, no meta.");
    expect(r.prompt).toContain("Just a prompt");
    expect(hasUsablePrompt("### Role\nJust a prompt, no meta.")).toBe(true);
  });

  it("empty stream has no usable prompt (triggers fallback)", () => {
    expect(hasUsablePrompt(`\n${META_SENTINEL}\n{}`)).toBe(false);
  });
});
