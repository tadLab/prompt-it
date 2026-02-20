"use client";

import { useState, useEffect, useCallback, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useHistoryCount } from "../hooks/useHistory";
import { saveWizardInputs, getWizardInputs, type WizardInputs } from "../hooks/usePromptStore";
import Footer from "../components/Footer";

const STEPS = [
  {
    key: "task" as const,
    title: "WHAT DO YOU WANT AI TO HELP YOU WITH?",
    placeholder:
      "Write a blog post for my SaaS launch\nHelp me brainstorm React code\nCreate a contingency plan for Instagram...",
  },
  {
    key: "context" as const,
    title: "WHO IS THIS FOR, OR WHAT'S THE CONTEXT?",
    placeholder: "Target audience: project, industry, background information...",
  },
  {
    key: "output" as const,
    title: "WHAT SHOULD THE OUTPUT LOOK LIKE?",
    placeholder: "Code, Table, List, Step-by-step guide, text, other...",
  },
  {
    key: "preferences" as const,
    title: "ANY PREFERENCES OR CONSTRAINTS?",
    placeholder:
      "Professional, casual, direct, creative, auto, English, other...",
  },
  {
    key: "role" as const,
    title: "SKILL LEVEL / AI ROLE",
    placeholder: "As an expert, As a teacher, As a consultant, suprise me...",
  },
];

export default function BuilderPage() {
  const router = useRouter();
  const historyCount = useHistoryCount();
  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState<WizardInputs>({
    task: "",
    context: "",
    output: "",
    preferences: "",
    role: "",
  });

  const current = STEPS[step];
  const value = inputs[current.key];
  const isLast = step === STEPS.length - 1;
  const canContinue = value.trim().length > 0;

  const updateValue = (val: string) => {
    setInputs((prev) => ({ ...prev, [current.key]: val }));
  };

  const goNext = useCallback(() => {
    if (!canContinue) return;
    if (isLast) {
      // Save to session and navigate to loading
      saveWizardInputs(inputs);
      router.push("/loading-prompt");
    } else {
      setStep((s) => s + 1);
    }
  }, [canContinue, isLast, inputs, router]);

  const goBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      goNext();
    }
  };

  return (
    <div className="bg-gradient-main flex flex-col min-h-screen">
      {/* Builder header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-gradient-green text-xl font-bold tracking-tight"
        >
          prompt it
        </Link>
        <div className="flex items-center gap-3">
          <div className="badge">{step + 1}/{STEPS.length}</div>
          <Link
            href="/history"
            className="badge flex items-center gap-2 hover:border-emerald-400/40 transition-colors"
          >
            <span>📜</span>
            <span>History</span>
            {historyCount > 0 && (
              <span className="bg-emerald-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {historyCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Wizard content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <div className="w-full max-w-xl mx-auto">
          {/* Step header */}
          <div className="text-center mb-6 relative">
            {step > 0 && (
              <button
                onClick={goBack}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors"
              >
                ←
              </button>
            )}
            <p className="text-emerald-400 text-xs font-medium tracking-widest mb-2">
              PROGRESS: STEP {step + 1} OF {STEPS.length}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {current.title}
            </h1>
          </div>

          {/* Textarea */}
          <div className="mb-4">
            <textarea
              className="prompt-textarea"
              placeholder={current.placeholder}
              value={value}
              onChange={(e) => updateValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              rows={8}
            />
            <p className="text-center text-white/30 text-xs mt-3">
              Press <span className="kbd">Enter</span> to continue •{" "}
              <span className="kbd">Shift + Enter</span> for new line
            </p>
          </div>

          {/* Action button */}
          <div className="text-center">
            <button
              onClick={goNext}
              disabled={!canContinue}
              className="btn-primary"
            >
              {isLast ? "Generate prompt" : "Continue →"}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
