import { describe, it, expect } from "vitest";
import { isCompleteStream } from "../app/lib/streamResult";
describe("completed generation detection", () => {
  it("rejects partial prose and missing metadata", () => {
    expect(isCompleteStream("A partial prompt")).toBe(false);
    expect(isCompleteStream("A prompt\n===META===\n{}")).toBe(false);
  });
  it("rejects a failed stream even with complete metadata", () => {
    expect(
      isCompleteStream(
        'A prompt\n===META===\n{"detectedLanguage":"en","recommendedModel":"Claude","whyThisModel":"Useful"}\n===ERROR===',
      ),
    ).toBe(false);
  });
  it("accepts a complete English result", () => {
    expect(
      isCompleteStream(
        'A prompt\n===META===\n{"detectedLanguage":"en","recommendedModel":"Claude","whyThisModel":"Useful"}',
      ),
    ).toBe(true);
  });
  it("requires the promised English translation for Czech", () => {
    expect(
      isCompleteStream(
        'Prompt\n===META===\n{"detectedLanguage":"cs","recommendedModel":"Claude","whyThisModel":"Vhodný"}',
      ),
    ).toBe(false);
  });
});
