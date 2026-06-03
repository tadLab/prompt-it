"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  getPromptResult,
  getWizardInputs,
  type PromptResult,
} from "../hooks/usePromptStore";
import { useHistory } from "../hooks/useHistory";
import {
  AI_TARGETS,
  getTarget,
  targetIdForModel,
  type AiTarget,
} from "../lib/aiTargets";

export default function ResultPage() {
  const router = useRouter();
  const { addEntry } = useHistory();
  const [result, setResult] = useState<PromptResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState("");
  const [openedTarget, setOpenedTarget] = useState<string | null>(null);
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

  const handleCopy = async () => {
    if (!result) return;
    const text = isEditing ? editedPrompt : result.prompt;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  // Open in AI: copy prompt to clipboard first (so the user can paste if the
  // provider doesn't honor the prefill param), then open the chat in a new tab.
  const handleOpenIn = async (target: AiTarget) => {
    if (!result) return;
    const text = isEditing ? editedPrompt : result.prompt;
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

  if (!result) return null;

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
                {result.prompt}
              </pre>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mb-10">
            <button onClick={handleCopy} aria-label="Copy prompt to clipboard" className="btn-primary text-sm">
              {copied ? "Copied!" : "Copy"}
            </button>
            <button onClick={handleEdit} aria-label={isEditing ? "Finish editing" : "Edit prompt"} className="btn-secondary text-sm">
              {isEditing ? "Done" : "Edit"}
            </button>
            <Link href="/" className="btn-ghost text-sm">
              Home
            </Link>
          </div>

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
