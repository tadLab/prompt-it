"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  getPromptResult,
  getWizardInputs,
  savePromptResult,
  type PromptResult,
} from "../hooks/usePromptStore";
import { useHistory } from "../hooks/useHistory";
import {
  AI_TARGETS,
  getTarget,
  targetIdForModel,
  type AiTarget,
} from "../lib/aiTargets";

function languageLabel(code?: string): string {
  const map: Record<string, string> = {
    cs: "Čeština",
    sk: "Slovenčina",
    de: "Deutsch",
    fr: "Français",
    es: "Español",
    pl: "Polski",
    it: "Italiano",
  };
  if (!code) return "Original";
  return map[code.toLowerCase()] ?? code.toUpperCase();
}

export default function ResultPage() {
  const router = useRouter();
  const { addEntry } = useHistory();
  const [result, setResult] = useState<PromptResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState("");
  const [openedTarget, setOpenedTarget] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<"local" | "en">("local");
  const [showRefine, setShowRefine] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [refineLoading, setRefineLoading] = useState(false);
  const [refineError, setRefineError] = useState(false);
  const hasSaved = useRef(false);

  useEffect(() => {
    const r = getPromptResult();
    if (!r) {
      router.replace("/builder");
      return;
    }
    setResult(r);
    setEditedPrompt(r.prompt);

    if (!hasSaved.current) {
      hasSaved.current = true;
      const inputs = getWizardInputs();
      addEntry({
        inputs,
        result: r,
      });
      window.dispatchEvent(new Event("history-updated"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Text shown/used right now: the active language version, or edits on top of it.
  const activeBaseText = (): string => {
    if (!result) return "";
    const en = result.promptEnglish ?? result.prompt;
    const loc = result.promptLocalized ?? "";
    const bilingual = !!loc && loc !== en;
    if (!bilingual) return result.prompt;
    return activeLang === "en" ? en : loc;
  };
  const currentText = () => (isEditing ? editedPrompt : activeBaseText());

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(currentText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  // Switching language resets any in-progress edit to the new base text.
  const switchLang = (lang: "local" | "en") => {
    if (!result || lang === activeLang) return;
    setActiveLang(lang);
    const en = result.promptEnglish ?? result.prompt;
    const loc = result.promptLocalized ?? "";
    setEditedPrompt(lang === "en" ? en : loc || en);
    setIsEditing(false);
  };

  // Open in AI: copy prompt to clipboard first (so the user can paste if the
  // provider doesn't honor the prefill param), then open the chat in a new tab.
  const handleOpenIn = async (target: AiTarget) => {
    if (!result) return;
    const text = currentText();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard may be unavailable (permissions / insecure context) — the
      // deep-link still opens, so the user isn't blocked.
    }
    window.open(target.buildUrl(text), "_blank", "noopener,noreferrer");
    setOpenedTarget(target.id);
    setTimeout(() => setOpenedTarget(null), 5000);
  };

  // Refine: send the current prompt + the user's feedback back to the model and
  // replace the result with the improved version (iteration, not regeneration).
  const handleRefine = async () => {
    if (!result || !feedback.trim() || refineLoading) return;
    setRefineLoading(true);
    setRefineError(false);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refinePrompt: currentText(), feedback: feedback.trim() }),
      });
      if (!res.ok) throw new Error("refine failed");
      const data: PromptResult = await res.json();
      setResult(data);
      savePromptResult(data);
      addEntry({ inputs: getWizardInputs(), result: data });
      window.dispatchEvent(new Event("history-updated"));
      setActiveLang("local");
      setEditedPrompt(data.prompt);
      setIsEditing(false);
      setFeedback("");
      setShowRefine(false);
    } catch {
      setRefineError(true);
    } finally {
      setRefineLoading(false);
    }
  };

  if (!result) return null;

  const promptEnglish = result.promptEnglish ?? result.prompt;
  const promptLocalized = result.promptLocalized ?? "";
  const isBilingual = !!promptLocalized && promptLocalized !== promptEnglish;

  const recommendedId = targetIdForModel(result.recommendedModel);
  const recommendedTarget = recommendedId ? getTarget(recommendedId) : null;
  const otherTargets = AI_TARGETS.filter((t) => t.id !== recommendedId);

  return (
    <div className="bg-gradient-main flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-6">
            YOUR PROMPT
          </h1>

          {/* Language tabs — only when we have a localized + English version */}
          {isBilingual && (
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <button
                onClick={() => switchLang("local")}
                aria-pressed={activeLang === "local"}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeLang === "local"
                    ? "bg-emerald-500 text-black"
                    : "bg-white/5 text-white/60 hover:text-white"
                }`}
              >
                {languageLabel(result.detectedLanguage)}
              </button>
              <button
                onClick={() => switchLang("en")}
                aria-pressed={activeLang === "en"}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeLang === "en"
                    ? "bg-emerald-500 text-black"
                    : "bg-white/5 text-white/60 hover:text-white"
                }`}
              >
                English
              </button>
              {activeLang !== "en" && (
                <span className="text-white/40 text-xs ml-1">
                  AI modely rozumí anglickým promptům líp — zkus English verzi.
                </span>
              )}
            </div>
          )}

          {/* Prompt output */}
          <div className="glass-card-bright p-6 mb-4">
            {isEditing ? (
              <textarea
                className="w-full bg-transparent text-white/90 text-sm leading-relaxed outline-none resize-none min-h-[300px] font-mono"
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                autoFocus
              />
            ) : (
              <pre className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {activeBaseText()}
              </pre>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <button onClick={handleCopy} aria-label="Copy prompt to clipboard" className="btn-primary text-sm">
              {copied ? "Copied!" : "Copy"}
            </button>
            <button onClick={handleEdit} aria-label={isEditing ? "Finish editing" : "Edit prompt"} className="btn-secondary text-sm">
              {isEditing ? "Done" : "Edit"}
            </button>
            <button
              onClick={() => {
                setShowRefine((v) => !v);
                setRefineError(false);
              }}
              aria-label={showRefine ? "Cancel refine" : "Refine prompt"}
              className="btn-secondary text-sm"
            >
              {showRefine ? "Cancel" : "Refine"}
            </button>
            <Link href="/" className="btn-ghost text-sm">
              Home
            </Link>
          </div>

          {/* Refine panel — iterate on the prompt with natural-language feedback */}
          {showRefine && (
            <div className="glass-card p-5 mb-10 fade-in">
              <label
                htmlFor="refine-feedback"
                className="block text-emerald-400 text-xs font-medium tracking-wider mb-2"
              >
                What should change?
              </label>
              <textarea
                id="refine-feedback"
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white/90 text-sm outline-none resize-none min-h-[80px] focus:border-emerald-400/40 transition-colors"
                placeholder="e.g. make it shorter · more technical · add an example · friendlier tone · zaměř se na B2B…"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={refineLoading}
                autoFocus
              />
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={handleRefine}
                  disabled={!feedback.trim() || refineLoading}
                  className="btn-primary text-sm"
                >
                  {refineLoading ? "Refining…" : "Regenerate"}
                </button>
                {refineError && (
                  <span className="text-red-400 text-xs">Refine failed — try again.</span>
                )}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div>
            <h2 className="text-xl font-bold tracking-tight mb-4">
              RECOMMENDATIONS
            </h2>
            <div className="glass-card p-6 space-y-4">
              <div>
                <h3 className="text-emerald-400 text-xs font-medium tracking-wider mb-1">
                  Recommended Model:
                </h3>
                <p className="text-lg font-bold">{result.recommendedModel}</p>
              </div>
              <div>
                <h3 className="text-emerald-400 text-xs font-medium tracking-wider mb-1">
                  Why this model?
                </h3>
                <p className="text-white/70 text-sm">{result.whyThisModel}</p>
              </div>

              {/* Open in AI — fuses model matching with one-click insert */}
              <div className="pt-4 border-t border-white/10">
                <h3 className="text-emerald-400 text-xs font-medium tracking-wider mb-3">
                  Open with your prompt
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  {recommendedTarget && (
                    <button
                      onClick={() => handleOpenIn(recommendedTarget)}
                      aria-label={`Open prompt in ${recommendedTarget.label}`}
                      className="btn-primary text-sm"
                    >
                      Open in {recommendedTarget.label} →
                    </button>
                  )}
                  {(recommendedTarget ? otherTargets : AI_TARGETS).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleOpenIn(t)}
                      aria-label={`Open prompt in ${t.label}`}
                      className="btn-secondary text-sm"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <p className="text-white/40 text-xs mt-3">
                  {openedTarget
                    ? "Prompt copied — if it didn't pre-fill, just paste (⌘/Ctrl + V)."
                    : "We copy your prompt and open the chat — paste if it doesn't auto-fill."}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold mb-2">Alternatives</h3>
                <ul className="space-y-1">
                  {result.alternatives.map((alt) => (
                    <li key={alt} className="text-white/60 text-sm">
                      • {alt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
