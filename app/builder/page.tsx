"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Icon from "../components/Icon";
import { BrandMark } from "../components/Brand";
import { useLang } from "../i18n/LanguageProvider";
import {
  clearPromptResult,
  getWizardInputs,
  saveWizardInputs,
} from "../hooks/usePromptStore";

interface Question {
  id: string;
  question: string;
  suggestions: string[];
}
export default function BuilderPage() {
  const { lang } = useLang();
  const cs = lang === "cs";
  const router = useRouter();
  const [goal, setGoal] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [asked, setAsked] = useState(false);
  const clarification = useRef<AbortController | null>(null);
  useEffect(() => {
    setGoal(getWizardInputs().goal);
  }, []);
  useEffect(() => {
    setQuestions([]);
    setAnswers({});
    setAsked(false);
    setBusy(false);
    setError("");
    return () => clarification.current?.abort();
  }, [lang]);
  function generate() {
    if (!goal.trim()) {
      setError(
        cs ? "Napiš, co chceš vytvořit." : "Tell us what you want to create.",
      );
      return;
    }
    try {
      saveWizardInputs({
        goal: goal.trim(),
        answers: questions.map((q) => ({
          question: q.question,
          answer: answers[q.id] || "",
        })),
        lang,
      });
      clearPromptResult();
      router.push("/result");
    } catch {
      setError(
        cs
          ? "Pro pokračování povol úložiště prohlížeče."
          : "Allow browser storage to continue.",
      );
    }
  }
  async function clarify() {
    if (!goal.trim()) {
      setError(
        cs ? "Nejdřív napiš svůj nápad." : "Start with your idea first.",
      );
      return;
    }
    setBusy(true);
    setError("");
    clarification.current?.abort();
    const abort = new AbortController();
    clarification.current = abort;
    try {
      const response = await fetch("/api/clarify", {
        method: "POST",
        signal: abort.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, lang }),
      });
      if (!response.ok)
        throw new Error(response.status === 429 ? "limit" : "service");
      const data = await response.json();
      if (abort.signal.aborted) return;
      setQuestions(data.questions ?? []);
      setAnswers({});
      setAsked(true);
    } catch (e) {
      if (abort.signal.aborted) return;
      setError(
        e instanceof Error && e.message === "limit"
          ? cs
            ? "Chvilku počkej, limit požadavků se brzy obnoví."
            : "Please wait a moment for the request limit to reset."
          : cs
            ? "Otázky se nepodařilo načíst. Zkus to znovu, nebo vytvoř prompt přímo."
            : "We couldn’t load the questions. Try again, or create your prompt directly.",
      );
    } finally {
      if (!abort.signal.aborted) setBusy(false);
    }
  }
  return (
    <>
      <Header />
      <main className="workspace" id="main-content">
        <div className="workspace-stepper">
          <span className="active">
            <b>1</b>
            {cs ? "Tvůj nápad" : "Your idea"}
          </span>
          <i />
          <span className={asked ? "active" : ""}>
            <b>2</b>
            {cs ? "Detaily" : "A little context"}
          </span>
          <i />
          <span>
            <b>3</b>
            {cs ? "Tvůj prompt" : "Your prompt"}
          </span>
        </div>
        <div className="workspace-head">
          <div>
            <span className="eyebrow">
              {cs ? "PROSTOR PRO TVŮJ NÁPAD" : "A LITTLE ROOM FOR YOUR IDEA"}
            </span>
            <h1>{cs ? "Co chceš vytvořit?" : "What’s on your mind?"}</h1>
            <p>
              {cs
                ? "Začni vlastními slovy. Zbytek spolu doladíme."
                : "Start in your own words. We’ll work out the details together."}
            </p>
          </div>
        </div>
        <div className="builder-grid">
          <section className="panel">
            <label htmlFor="builder-goal">
              {cs
                ? "Tvůj nápad nebo původní prompt"
                : "Your idea or existing prompt"}
            </label>
            <textarea
              id="builder-goal"
              disabled={busy}
              className="field-textarea"
              maxLength={2000}
              value={goal}
              placeholder={
                cs
                  ? "Např. chci napsat nabídku spolupráce pro místní kavárnu…"
                  : "e.g. I want to pitch a collaboration to a local coffee shop…"
              }
              onChange={(e) => {
                setGoal(e.target.value);
                setAsked(false);
                setQuestions([]);
                setAnswers({});
              }}
            />
            <div className="field-hint">
              {goal.length}/2,000 ·{" "}
              {cs
                ? "Nevkládej citlivé údaje ani hesla."
                : "Please leave out sensitive information and passwords."}
            </div>
            {asked && questions.length === 0 && (
              <p className="notice" style={{ marginTop: 22 }}>
                {cs
                  ? "Máme dost informací pro první verzi. Můžeš pokračovat."
                  : "That’s enough context for a first version. You’re ready to go."}
              </p>
            )}
            {questions.map((q, i) => (
              <div className="question-block" key={q.id}>
                <label htmlFor={`answer-${q.id}`}>
                  <span className="mono-label">0{i + 1} / </span>
                  {q.question}
                </label>
                <input
                  id={`answer-${q.id}`}
                  className="field-input"
                  maxLength={800}
                  value={answers[q.id] ?? ""}
                  placeholder={
                    cs
                      ? "Vlastní odpověď, nebo vyber možnost…"
                      : "Your answer, or choose a suggestion…"
                  }
                  onChange={(e) =>
                    setAnswers({ ...answers, [q.id]: e.target.value })
                  }
                />
                <div className="suggestions">
                  {q.suggestions?.map((s) => (
                    <button
                      type="button"
                      aria-pressed={answers[q.id] === s}
                      key={s}
                      onClick={() => setAnswers({ ...answers, [q.id]: s })}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            <div className="field-actions">
              <button className="text-button" disabled={busy} onClick={clarify}>
                <Icon name="plus" size={16} />
                {busy
                  ? cs
                    ? "Hledám správné otázky…"
                    : "Finding the right questions…"
                  : asked
                    ? cs
                      ? "Nové otázky"
                      : "Refresh questions"
                    : cs
                      ? "Pomoz mi upřesnit zadání"
                      : "Help me add context"}
              </button>
              <button
                className="button button-primary"
                disabled={busy || !goal.trim()}
                onClick={generate}
              >
                {cs ? "Vytvořit prompt" : "Create my prompt"}
                <span className="button-arrow">
                  <Icon name="arrow" size={17} />
                </span>
              </button>
            </div>
          </section>
          <aside className="panel builder-aside">
            <div className="brand-art">
              <BrandMark />
            </div>
            <h3>
              {cs
                ? "Nemusí to být dokonalé."
                : "It doesn’t have to be perfect."}
            </h3>
            <p>
              {cs
                ? "Pomůže nám, když zmíníš, pro koho výstup je a co od něj očekáváš. Ale i jedna věta je dobrý začátek."
                : "It helps to mention who it’s for and what a good result looks like. But even one sentence is a good start."}
            </p>
            <div className="builder-note">
              <Icon name="check" size={14} />
              {cs
                ? "Otázky jsou dobrovolné. Prompt můžeš vytvořit rovnou."
                : "Questions are optional. You can create your prompt straight away."}
            </div>
            <div className="builder-note">
              <Icon name="globe" size={14} />
              {cs
                ? "Výsledek dostaneš česky, s možností anglické verze."
                : "Your result follows your selected language."}
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
