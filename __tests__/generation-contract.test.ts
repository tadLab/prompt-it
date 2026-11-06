import { describe, it, expect } from "vitest";
import {
  PROMPT_CORE,
  buildUserContent,
  classifyRequest,
} from "../lib/generation";

// These test the app's instructions, not the quality of an AI model's output.
describe("shared generation contract", () => {
  it("makes structure proportional and explicitly prohibits invented facts", () => {
    expect(PROMPT_CORE).toContain("length proportional");
    expect(PROMPT_CORE).toContain("Never invent product features");
    expect(PROMPT_CORE).not.toContain("use all of these sections");
  });
  it("keeps clarification answers in the model input", () => {
    expect(
      buildUserContent({
        goal: "Write a post",
        answers: [{ question: "Audience?", answer: "Local café owners" }],
      }),
    ).toContain("Audience?: Local café owners");
  });
  it("preserves the refinement instruction and existing prompt", () => {
    const body = {
      refinePrompt: "Keep this context",
      feedback: "Make it shorter",
      lang: "cs",
    };
    expect(classifyRequest(body).isRefine).toBe(true);
    expect(buildUserContent(body)).toContain("Keep this context");
    expect(buildUserContent(body)).toContain("Make it shorter");
  });
  it("supports legacy stored task fields", () => {
    expect(
      buildUserContent({ task: "Write an email", context: "A project update" }),
    ).toContain("A project update");
  });
});
