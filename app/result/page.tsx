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

export default function ResultPage() {
  const router = useRouter();
  const { addEntry } = useHistory();
  const [result, setResult] = useState<PromptResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState("");
  const [rated, setRated] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);
  const hasSaved = useRef(false);

  useEffect(() => {
    const r = getPromptResult();
    if (!r) {
      router.replace("/builder");
      return;
    }
    setResult(r);
    setEditedPrompt(r.prompt);

    // Save to history only once using ref (immune to re-renders)
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

  const handleRate = async (rating: "up" | "down") => {
    if (!result?.generationId) return;
    setRatingLoading(true);
    try {
      const res = await fetch("/api/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId: result.generationId, rating }),
      });
      if (res.ok) {
        setRated(true);
      }
    } catch {
      // Silently fail — non-critical feature
    } finally {
      setRatingLoading(false);
    }
  };

  if (!result) return null;

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

          {/* Rating */}
          {result.generationId && !rated && (
            <div className="glass-card p-5 mb-10 text-center">
              <p className="text-sm font-medium mb-3">How was this prompt?</p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => handleRate("up")}
                  disabled={ratingLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-400/10 border border-emerald-400/20 hover:bg-emerald-400/20 transition-colors text-sm"
                >
                  <span>👍</span> Useful
                </button>
                <button
                  onClick={() => handleRate("down")}
                  disabled={ratingLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm"
                >
                  <span>👎</span> Not great
                </button>
              </div>
              <p className="text-white/30 text-xs mt-2">Your feedback helps us improve</p>
            </div>
          )}
          {rated && (
            <div className="glass-card p-5 mb-10 text-center">
              <p className="text-emerald-400 text-sm font-medium">Thanks for rating!</p>
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
