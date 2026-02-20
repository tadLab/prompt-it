"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getWizardInputs, savePromptResult } from "../hooks/usePromptStore";

const CHECKLIST_ITEMS = ["TASK", "CONTEXT", "OUTPUT", "PREFERENCES", "ROLE"];

export default function LoadingPromptPage() {
  const router = useRouter();
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const inputs = getWizardInputs();

    // If no inputs, redirect back to builder
    if (!inputs.task) {
      router.replace("/builder");
      return;
    }

    // Animate checklist items
    CHECKLIST_ITEMS.forEach((_, i) => {
      setTimeout(() => {
        setCheckedItems((prev) => [...prev, i]);
      }, (i + 1) * 400);
    });

    // Call API
    const generatePrompt = async () => {
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inputs),
        });

        if (!res.ok) throw new Error("Failed to generate prompt");

        const data = await res.json();
        savePromptResult(data);

        // Wait for checklist animation to finish, then navigate
        const minDelay = CHECKLIST_ITEMS.length * 400 + 800;
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, minDelay - elapsed);

        setTimeout(() => {
          router.push("/result");
        }, remaining);
      } catch (error) {
        console.error("Generation error:", error);
        // On error, still navigate with a fallback
        savePromptResult({
          prompt: `### Role\n${inputs.role}\n\n### Goal\n${inputs.task}\n\n### Context\n${inputs.context}\n\n### Requirements\n${inputs.preferences}\n\n### Output Format\n${inputs.output}`,
          recommendedModel: "Claude",
          whyThisModel:
            "Claude excels at following structured instructions and producing clean, readable outputs.",
          alternatives: ["ChatGPT", "Gemini"],
        });
        setTimeout(() => router.push("/result"), 2000);
      }
    };

    const start = Date.now();
    generatePrompt();
  }, [router]);

  return (
    <div className="bg-gradient-main flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-2">
          WE&apos;RE BUILDING YOUR PROMPT
        </h1>
        <p className="text-white/40 text-lg mb-10 loading-dots"></p>

        <div className="space-y-4 w-full max-w-xs">
          {CHECKLIST_ITEMS.map((item, i) => {
            const isChecked = checkedItems.includes(i);
            return (
              <div
                key={item}
                className="flex items-center gap-4 text-lg font-semibold"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-all duration-300 ${
                    isChecked
                      ? "bg-emerald-500 text-white check-animate"
                      : "bg-white/5 text-white/20"
                  }`}
                >
                  {isChecked ? "✓" : ""}
                </div>
                <span
                  className={
                    isChecked ? "text-white" : "text-white/30"
                  }
                >
                  {item}
                </span>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
