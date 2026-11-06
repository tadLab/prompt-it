import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("redesigned release identity", () => {
  it("ships the English and Czech redesigned homepage", () => {
    const home = read("app/page.tsx");
    expect(home).toContain("Clearly expressed.");
    expect(home).toContain("Jasně vyjádřený.");
    expect(home).toContain('className="hero-art"');
    expect(home).not.toContain("BUILD BETTER PROMPTS.");
  });

  it("ships the emerald artwork and brand assets", () => {
    const css = read("app/globals.css");
    expect(css).toContain(".light-fin");
    for (const asset of ["logo.svg", "mark.svg", "mark-monochrome.svg"]) {
      expect(existsSync(resolve(process.cwd(), "public/brand", asset))).toBe(true);
    }
  });

  it("preserves the newer Next.js analytics integration", () => {
    const layout = read("app/layout.tsx");
    expect(layout).toContain('from "@vercel/analytics/next"');
    expect(layout).toContain("<Analytics />");
  });
});
