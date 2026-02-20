"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useHistory, type HistoryEntry } from "../hooks/useHistory";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function HistoryCard({
  entry,
  onDelete,
}: {
  entry: HistoryEntry;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(entry.result.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/90 truncate">
            {entry.inputs.task}
          </p>
          <p className="text-xs text-white/40 mt-1">{formatDate(entry.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2 ml-4 shrink-0">
          <span className="text-xs text-emerald-400 font-medium">
            {entry.result.recommendedModel}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 fade-in">
          <div className="glass-card-bright p-4 mb-3">
            <pre className="text-white/80 text-xs leading-relaxed whitespace-pre-wrap font-sans">
              {entry.result.prompt}
            </pre>
          </div>
          <p className="text-xs text-white/40 mb-3">
            <span className="text-emerald-400">Why {entry.result.recommendedModel}?</span>{" "}
            {entry.result.whyThisModel}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          {expanded ? "Collapse" : "View prompt"}
        </button>
        <span className="text-white/10">|</span>
        <button
          onClick={handleCopy}
          className="text-xs text-white/40 hover:text-white/60 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
        <span className="text-white/10">|</span>
        <button
          onClick={() => onDelete(entry.id)}
          className="text-xs text-red-400/60 hover:text-red-400 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const { history, removeEntry, clearHistory } = useHistory();

  return (
    <div className="bg-gradient-main flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Prompt <span className="text-gradient-green">History</span>
              </h1>
              <p className="text-white/40 mt-1">
                View and manage your previously generated prompts
              </p>
            </div>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-xs text-red-400/60 hover:text-red-400 transition-colors mt-2"
              >
                Clear all
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">📝</div>
              <h2 className="text-xl font-semibold mb-2">No prompts yet</h2>
              <p className="text-white/40 mb-6">
                Your generated prompts will appear here. Start by building your
                first prompt!
              </p>
              <Link href="/builder" className="btn-primary">
                Build my first prompt
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => (
                <HistoryCard
                  key={entry.id}
                  entry={entry}
                  onDelete={removeEntry}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
