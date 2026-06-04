"use client";

import { useState, useCallback, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useHistoryCount } from "../hooks/useHistory";
import { saveWizardInputs, type WizardAnswer } from "../hooks/usePromptStore";
import Footer from "../components/Footer";

interface ClarifyQuestion {
  id: string;
  question: string;
  suggestions: string[];
}

export default function BuilderPage() {
  const router = useRouter();
  const historyCount = useHistoryCount();

  const [phase, setPhase] = useState<"goal" | "questions">("goal");
  const [goal, setGoal] = useState("");
  const [questions, setQuestions] = useState<ClarifyQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const canContinue = goal.trim().length > 0;

  // Persist the intake and head to generation. `withAnswers=false` is the
  // low-barrier floor: generate straight from the goal, skipping questions.
  const generate = useCallback(
    (withAnswers: boolean) => {
      const answerList: WizardAnswer[] = withAnswers
        ? questions
            .map((q) => ({ question: q.question, answer: (answers[q.id] || "").trim() }))
            .filter((a) => a.answer.length > 0)
        : [];
      saveWizardInputs({ goal: goal.trim(), answers: answerList });
      router.push("/loading-prompt");
    },
    [goal, questions, answers, router]
  );

  // Fetch adaptive questions for this goal. Non-blocking: if none come back
  // (or the call fails), go straight to generation so the user is never stuck.
  const fetchQuestions = useCallback(async () => {
    if (!canContinue || loadingQuestions) return;
    setLoadingQuestions(true);
    try {
      const res = await fetch("/api/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: goal.trim() }),
      });
      const data = await res.json();
      const qs: ClarifyQuestion[] = Array.isArray(data.questions) ? data.questions : [];
      if (qs.length === 0) {
        generate(false);
        return;
      }
      setQuestions(qs);
      setPhase("questions");
    } catch {
      generate(false);
    } finally {
      setLoadingQuestions(false);
    }
  }, [canContinue, loadingQuestions, goal, generate]);

  const handleGoalKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      fetchQuestions();
    }
  };

  const setAnswer = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };
  const toggleSuggestion = (id: string, sugg: string) => {
    setAnswers((prev) => ({ ...prev, [id]: prev[id] === sugg ? "" : sugg }));
  };

  return (
    <div className="bg-gradient-main flex flex-col min-h-screen">
      {/* Builder header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-gradient-green text-xl font-bold tracking-tight">
          prompt it
        </Link>
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
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        {phase === "goal" ? (
          <div className="w-full max-w-xl mx-auto fade-in">
            <div className="text-center mb-6">
              <p className="text-emerald-400 text-xs font-medium tracking-widest mb-2">
                STEP 1 — YOUR GOAL
              </p>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                WHAT DO YOU WANT AI TO HELP YOU WITH?
              </h1>
            </div>

            <textarea
              className="prompt-textarea"
              placeholder={
                "Napiš blog post na LinkedIn pro náš launch\nHelp me brainstorm React code\nNapiš e-mail šéfovi, kterým odmítnu práci o víkendu…"
              }
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              onKeyDown={handleGoalKeyDown}
              autoFocus
              rows={6}
            />
            <p className="text-center text-white/30 text-xs mt-3">
              Press <span className="kbd">Enter</span> to continue •{" "}
              <span className="kbd">Shift + Enter</span> for new line
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
              <button
                onClick={fetchQuestions}
                disabled={!canContinue || loadingQuestions}
                className="btn-primary"
              >
                {loadingQuestions ? "Preparing questions…" : "Continue →"}
              </button>
              <button
                onClick={() => generate(false)}
                disabled={!canContinue || loadingQuestions}
                className="btn-ghost text-sm"
              >
                Skip & generate now
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-xl mx-auto fade-in">
            <div className="text-center mb-6">
              <p className="text-emerald-400 text-xs font-medium tracking-widest mb-2">
                STEP 2 — A FEW QUICK QUESTIONS (OPTIONAL)
              </p>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                Answer what you can — we&apos;ll infer the rest.
              </h1>
            </div>

            <div className="space-y-5">
              {questions.map((q) => (
                <div key={q.id}>
                  <label
                    htmlFor={`q-${q.id}`}
                    className="block text-sm font-medium text-white/90 mb-2"
                  >
                    {q.question}
                  </label>
                  {q.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {q.suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => toggleSuggestion(q.id, s)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                            answers[q.id] === s
                              ? "bg-emerald-500 text-black border-emerald-500"
                              : "bg-white/5 text-white/60 border-white/10 hover:text-white"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                  <input
                    id={`q-${q.id}`}
                    type="text"
                    value={answers[q.id] || ""}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                    placeholder="Type an answer, or skip…"
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-green)] rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
              <button onClick={() => generate(true)} className="btn-primary">
                Generate prompt →
              </button>
              <button
                onClick={() => setPhase("goal")}
                className="btn-ghost text-sm"
              >
                ← Back
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
