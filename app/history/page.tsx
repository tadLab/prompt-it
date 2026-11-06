"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Icon from "../components/Icon";
import { useLang } from "../i18n/LanguageProvider";
import { useHistory, type HistoryEntry } from "../hooks/useHistory";
import { savePromptResult, saveWizardInputs } from "../hooks/usePromptStore";

export default function HistoryPage() {
  const { lang } = useLang();
  const cs = lang === "cs";
  const { history, removeEntry, clearHistory } = useHistory();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  function open(entry: HistoryEntry) {
    try {
      saveWizardInputs({
        goal: entry.inputs.goal || entry.inputs.task || "",
        answers: entry.inputs.answers || [],
        lang: entry.inputs.lang,
      });
      savePromptResult({ ...entry.result, historyId: entry.id });
      router.push("/result");
    } catch {
      setError(
        cs
          ? "Úložiště prohlížeče není dostupné."
          : "Browser storage is unavailable.",
      );
    }
  }
  function remove(id: string) {
    try {
      removeEntry(id);
    } catch {
      setError(
        cs ? "Záznam se nepodařilo smazat." : "Couldn’t delete this entry.",
      );
    }
  }
  const filtered = history.filter((e) =>
    `${e.inputs.goal || e.inputs.task} ${e.result.prompt}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <Header />
      <main className="workspace" id="main-content">
        <div className="workspace-head">
          <div>
            <span className="eyebrow">
              {cs ? "DOBRÉ NÁPADY NEZAPADNOU" : "GOOD IDEAS, KEPT CLOSE"}
            </span>
            <h1>{cs ? "Tvoje historie." : "Your prompt collection."}</h1>
            <p>
              {cs
                ? "Vrať se k nápadům, které stojí za to. Uloženo v tomto prohlížeči."
                : "Pick up a good idea where you left off. Saved in this browser."}
            </p>
          </div>
          <Link href="/builder" className="button button-primary button-small">
            <Icon name="plus" size={15} />
            {cs ? "Nový prompt" : "New prompt"}
          </Link>
        </div>
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        {!!history.length && (
          <div className="field-actions" style={{ marginBottom: 20 }}>
            <div
              className="history-search"
              style={{ marginBottom: 0, width: "100%" }}
            >
              <label className="sr-only" htmlFor="history-search">
                {cs ? "Hledat v historii" : "Search history"}
              </label>
              <input
                id="history-search"
                className="field-input"
                type="search"
                placeholder={cs ? "Najdi svůj prompt…" : "Find a prompt…"}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button
              className="text-button"
              onClick={() => setConfirm(!confirm)}
            >
              <Icon name="trash" size={14} />
              {cs ? "Smazat vše" : "Clear all"}
            </button>
          </div>
        )}
        {confirm && (
          <div className="notice">
            <p>
              {cs
                ? "Opravdu smazat celou historii? Toto nelze vrátit."
                : "Delete all saved prompts? This can’t be undone."}
            </p>
            <div className="field-actions" style={{ marginTop: 8 }}>
              <button className="text-button" onClick={() => setConfirm(false)}>
                {cs ? "Zrušit" : "Cancel"}
              </button>
              <button
                className="text-button"
                onClick={() => {
                  try {
                    clearHistory();
                    setConfirm(false);
                  } catch {
                    setError(
                      cs
                        ? "Historii se nepodařilo smazat."
                        : "Couldn’t clear history.",
                    );
                  }
                }}
              >
                {cs ? "Ano, smazat historii" : "Yes, clear history"}
              </button>
            </div>
          </div>
        )}
        {!history.length ? (
          <div className="panel empty-state">
            <Icon name="clock" size={32} />
            <h2>
              {cs ? "Začátek něčeho dobrého." : "The start of something good."}
            </h2>
            <p>
              {cs
                ? "Tvoje hotové prompty se objeví tady."
                : "Your finished prompts will appear here."}
            </p>
            <Link className="button button-secondary" href="/builder">
              {cs ? "Vytvořit první prompt" : "Create your first prompt"}
              <Icon name="arrow" size={16} />
            </Link>
          </div>
        ) : (
          <div className="history-list">
            {filtered.map((entry) => (
              <article className="panel history-entry" key={entry.id}>
                <div>
                  <h2>{entry.inputs.goal || entry.inputs.task || "Prompt"}</h2>
                  <p>{entry.result.prompt}</p>
                  <div className="history-entry-meta">
                    <time dateTime={entry.createdAt}>
                      {new Date(entry.createdAt).toLocaleString(
                        cs ? "cs-CZ" : "en-GB",
                        { dateStyle: "medium", timeStyle: "short" },
                      )}
                    </time>
                    <span>{entry.result.recommendedModel}</span>
                  </div>
                </div>
                <div className="history-entry-actions">
                  <button
                    className="button button-secondary button-small"
                    onClick={() => open(entry)}
                  >
                    {cs ? "Otevřít" : "Open"}
                    <Icon name="up-right" size={14} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label={cs ? "Smazat prompt" : "Delete prompt"}
                    onClick={() => remove(entry.id)}
                  >
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              </article>
            ))}
            {!filtered.length && (
              <p className="field-hint">
                {cs
                  ? "Žádný prompt neodpovídá hledání."
                  : "No prompts match your search."}
              </p>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
