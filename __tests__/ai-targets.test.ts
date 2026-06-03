/**
 * Tests for the "Open in AI" deep-link logic.
 *
 * The model recommendation comes from an LLM as free text ("Claude",
 * "ChatGPT (great for creative work)", "Google Gemini"), so the mapping to a
 * concrete target must be liberal. The URL builders must always URL-encode the
 * prompt so special characters don't break the link.
 */

import { describe, it, expect } from "vitest";
import {
  AI_TARGETS,
  getTarget,
  targetIdForModel,
} from "../app/lib/aiTargets";

describe("targetIdForModel", () => {
  it("maps Claude phrasings", () => {
    expect(targetIdForModel("Claude")).toBe("claude");
    expect(targetIdForModel("Anthropic Claude 3.5")).toBe("claude");
  });

  it("maps ChatGPT / GPT / OpenAI phrasings", () => {
    expect(targetIdForModel("ChatGPT")).toBe("chatgpt");
    expect(targetIdForModel("GPT-4")).toBe("chatgpt");
    expect(targetIdForModel("OpenAI's model")).toBe("chatgpt");
  });

  it("maps Gemini / Google / Bard phrasings", () => {
    expect(targetIdForModel("Gemini")).toBe("gemini");
    expect(targetIdForModel("Google Gemini 1.5")).toBe("gemini");
  });

  it("handles descriptive recommendations with parentheses", () => {
    expect(targetIdForModel("ChatGPT (great for creative/marketing tasks)")).toBe("chatgpt");
    expect(targetIdForModel("Gemini (great for research/data tasks)")).toBe("gemini");
  });

  it("returns null for unknown / empty input", () => {
    expect(targetIdForModel("Llama")).toBeNull();
    expect(targetIdForModel("")).toBeNull();
    expect(targetIdForModel(undefined)).toBeNull();
    expect(targetIdForModel(null)).toBeNull();
  });
});

describe("buildUrl", () => {
  it("URL-encodes the prompt for every target", () => {
    const prompt = 'Write a "friendly" email & say hi <to> boss';
    for (const target of AI_TARGETS) {
      const url = target.buildUrl(prompt);
      // The raw special characters must not appear unencoded in the query
      expect(url).not.toContain('"to>');
      expect(url).toContain(encodeURIComponent(prompt));
      expect(() => new URL(url)).not.toThrow();
    }
  });

  it("each target points at the expected provider domain", () => {
    expect(getTarget("chatgpt").buildUrl("x")).toContain("chatgpt.com");
    expect(getTarget("claude").buildUrl("x")).toContain("claude.ai");
    expect(getTarget("gemini").buildUrl("x")).toContain("gemini.google.com");
  });
});
