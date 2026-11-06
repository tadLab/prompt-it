"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Icon from "../components/Icon";
import { BrandMark } from "../components/Brand";
import { useLang } from "../i18n/LanguageProvider";
import {
  getPromptResult,
  getWizardInputs,
  savePromptResult,
  type PromptResult,
} from "../hooks/usePromptStore";
import { useHistory } from "../hooks/useHistory";
import {
  parseStreamedResult,
  promptBeforeMeta,
  isCompleteStream,
} from "../lib/streamResult";
import { applyPromptEdit } from "../lib/resultEditing";

function PromptText({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n/).map((line, i) =>
        /^#{1,3}\s/.test(line) ? (
          <h3 key={i}>{line.replace(/^#{1,3}\s/, "")}</h3>
        ) : (
          <span key={i}>
            {line
              .split(/(\*\*[^*]+\*\*)/g)
              .map((part, j) =>
                part.startsWith("**") ? (
                  <strong key={j}>{part.slice(2, -2)}</strong>
                ) : (
                  part
                ),
              )}
            {"\n"}
          </span>
        ),
      )}
    </>
  );
}

export default function ResultPage() {
  const { lang, ready } = useLang();
  const cs = lang === "cs";
  const { addEntry, updateEntry } = useHistory();
  const [result, setResult] = useState<PromptResult | null>(null);
  const [streamText, setStreamText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [missing, setMissing] = useState(false);
  const [version, setVersion] = useState<"local" | "en">("local");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [feedback, setFeedback] = useState("");
  const [toast, setToast] = useState("");
  const [previous, setPrevious] = useState<PromptResult | null>(null);
  const controller = useRef<AbortController | null>(null);
  const initialized = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const current = result
    ? version === "en"
      ? result.promptEnglish || result.prompt
      : result.prompt
    : streamText;
  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3500);
  }, []);

  const persist = useCallback(
    (next: PromptResult) => {
      setResult(next);
      try {
        savePromptResult(next);
        if (next.historyId) updateEntry(next.historyId, next);
      } catch {
        notify(
          cs
            ? "Výsledek je připravený, ale prohlížeč ho nemohl uložit."
            : "Your result is ready, but browser storage couldn’t save it.",
        );
      }
    },
    [updateEntry, notify, cs],
  );

  const generate = useCallback(
    async (
      refinement?: { prompt: string; feedback: string },
      prior?: PromptResult | null,
    ) => {
      const inputs = getWizardInputs();
      if (!inputs.goal && !refinement) {
        setMissing(true);
        return;
      }
      controller.current?.abort();
      const abort = new AbortController();
      controller.current = abort;
      setBusy(true);
      setError("");
      setStreamText("");
      try {
        const response = await fetch("/api/generate-stream", {
          method: "POST",
          signal: abort.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            refinement
              ? {
                  refinePrompt: refinement.prompt,
                  feedback: refinement.feedback,
                  lang,
                }
              : { ...inputs, lang: inputs.lang || lang },
          ),
        });
        if (!response.ok)
          throw new Error(response.status === 429 ? "limit" : "service");
        if (!response.body) throw new Error("service");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let full = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          if (!refinement) setStreamText(promptBeforeMeta(full));
        }
        full += decoder.decode();
        if (!isCompleteStream(full)) throw new Error("service");
        const parsed = parseStreamedResult(full);
        if (!parsed.prompt?.trim() || !parsed.recommendedModel)
          throw new Error("service");
        if (abort.signal.aborted) return;
        let next: PromptResult = {
          ...parsed,
          generationId: crypto.randomUUID(),
        };
        if (prior?.historyId) {
          next = { ...next, historyId: prior.historyId };
          setPrevious(prior);
        } else {
          try {
            const entry = addEntry({ inputs, result: next });
            next.historyId = entry.id;
          } catch {
            notify(
              cs
                ? "Historii nelze uložit. Prompt si můžeš zkopírovat."
                : "History couldn’t be saved. You can still copy your prompt.",
            );
          }
        }
        persist(next);
        setVersion("local");
        setFeedback("");
      } catch (e) {
        if (abort.signal.aborted) return;
        setError(
          e instanceof Error && e.message === "limit"
            ? cs
              ? "Příliš mnoho požadavků. Počkej prosím minutu a zkus to znovu."
              : "Too many requests. Please wait a minute and try again."
            : cs
              ? "Prompt se nepodařilo dokončit. Tvoje zadání zůstalo uložené. Zkus to znovu."
              : "We couldn’t finish your prompt. Your input is still saved. Please try again.",
        );
        setStreamText("");
      } finally {
        if (!abort.signal.aborted) setBusy(false);
      }
    },
    [lang, cs, addEntry, notify, persist],
  );

  useEffect(() => {
    if (!ready || initialized.current) return;
    initialized.current = true;
    const stored = getPromptResult();
    if (stored?.prompt) setResult(stored);
    else void generate();
    return () => {
      controller.current?.abort();
      initialized.current = false;
    };
    // Language changes translate the interface, not the user's saved work.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(current);
      notify(cs ? "Prompt zkopírován." : "Prompt copied.");
    } catch {
      setError(
        cs
          ? "Kopírování není dostupné. Označ text a zkopíruj ho ručně."
          : "Clipboard unavailable. Select the text and copy it manually.",
      );
    }
  }
  function saveEdit() {
    if (!result || !draft.trim()) return;
    setPrevious(result);
    persist(applyPromptEdit(result, draft.trim(), version));
    setEditing(false);
    notify(cs ? "Změny uloženy." : "Changes saved.");
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([current], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "makebetterprompt.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const model = result?.recommendedModel || "Claude";
  const provider = /gpt|openai/i.test(model)
    ? { name: "ChatGPT", url: "https://chatgpt.com/" }
    : /gemini|google/i.test(model)
      ? { name: "Gemini", url: "https://gemini.google.com/app" }
      : { name: "Claude", url: "https://claude.ai/new" };
  async function openAI() {
    const tab = window.open(provider.url, "_blank");
    if (tab) tab.opener = null;
    try {
      await navigator.clipboard.writeText(current);
      notify(
        cs
          ? "Zkopírováno. Vlož prompt do nové konverzace."
          : "Copied. Paste your prompt into the new conversation.",
      );
    } catch {
      notify(
        cs
          ? "AI otevřena. Prompt zkopíruj ručně."
          : "AI opened. Please copy the prompt manually.",
      );
    }
  }

  return (
    <>
      <Header />
      <main className="workspace" id="main-content">
        <div className="workspace-head">
          <div>
            <span className="eyebrow">
              {cs
                ? "TVŮJ NÁPAD, O NĚCO JASNĚJŠÍ"
                : "YOUR IDEA, A LITTLE CLEARER"}
            </span>
            <h1>
              {cs ? "Teď z toho něco vytvoř." : "Now make something good."}
            </h1>
            <p>
              {cs
                ? "Prompt je tvůj. Uprav ho, dolaď a vezmi do své AI."
                : "It’s your prompt. Edit it, refine it, and take it to your AI."}
            </p>
          </div>
          <Link href="/builder" className="button button-ghost button-small">
            <Icon name="plus" size={15} />
            {cs ? "Nový prompt" : "New prompt"}
          </Link>
        </div>
        {missing ? (
          <div className="panel empty-state">
            <BrandMark />
            <h2>{cs ? "Začneme nápadem." : "Let’s start with an idea."}</h2>
            <p>
              {cs
                ? "Ještě tu není žádný prompt. Napiš, co chceš vytvořit."
                : "There’s no prompt here yet. Tell us what you’d like to create."}
            </p>
            <Link href="/builder" className="button button-primary">
              {cs ? "Vytvořit prompt" : "Create a prompt"}
              <Icon name="arrow" />
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="notice" role="alert">
                <p className="error-message">{error}</p>
                <button
                  className="text-button"
                  disabled={busy}
                  onClick={() =>
                    void generate(
                      result && feedback
                        ? { prompt: current, feedback }
                        : undefined,
                      result,
                    )
                  }
                >
                  {cs ? "Zkusit znovu" : "Try again"}
                  <Icon name="undo" size={14} />
                </button>
              </div>
            )}
            <div className="result-grid">
              <div>
                <section
                  className="panel result-card"
                  aria-busy={busy}
                  aria-label={cs ? "Vygenerovaný prompt" : "Generated prompt"}
                >
                  <div className="result-toolbar">
                    <div>
                      <span className="status-dot" />
                      <span className="mono-label">
                        {busy
                          ? cs
                            ? "TVŮJ PROMPT VZNIKÁ"
                            : "BRINGING IT INTO FOCUS"
                          : cs
                            ? "TVŮJ PROMPT"
                            : "YOUR PROMPT"}
                      </span>
                    </div>
                    <div>
                      {result &&
                        result.detectedLanguage !== "en" &&
                        result.promptEnglish && (
                          <>
                            <button
                              disabled={editing || busy}
                              onClick={() => setVersion("local")}
                              className={version === "local" ? "active" : ""}
                              aria-pressed={version === "local"}
                            >
                              {result.detectedLanguage === "cs"
                                ? "CZ"
                                : (
                                    result.detectedLanguage || "local"
                                  ).toUpperCase()}
                            </button>
                            <button
                              disabled={editing || busy}
                              onClick={() => setVersion("en")}
                              className={version === "en" ? "active" : ""}
                              aria-pressed={version === "en"}
                            >
                              EN
                            </button>
                          </>
                        )}
                      <button
                        className="icon-button"
                        disabled={!result || busy || editing}
                        onClick={() => {
                          setDraft(current);
                          setEditing(true);
                        }}
                        aria-label={cs ? "Upravit prompt" : "Edit prompt"}
                      >
                        <Icon name="edit" size={15} />
                      </button>
                      <button
                        className="icon-button"
                        disabled={!result || busy || editing}
                        onClick={download}
                        aria-label={cs ? "Stáhnout prompt" : "Download prompt"}
                      >
                        <Icon name="download" size={15} />
                      </button>
                      <button
                        className="icon-button"
                        disabled={!result || busy || editing}
                        onClick={copy}
                        aria-label={
                          cs ? "Zkopírovat prompt" : "Copy prompt to clipboard"
                        }
                      >
                        <Icon name="copy" size={15} />
                      </button>
                    </div>
                  </div>
                  {!current && busy ? (
                    <div className="loading-state" role="status">
                      <div className="loading-mark">
                        <BrandMark />
                      </div>
                      <h3>
                        {cs
                          ? "Dáváme tvému nápadu směr."
                          : "Giving your idea some direction."}
                      </h3>
                      <p>
                        {cs
                          ? "Hledáme správná slova, kontext a strukturu…"
                          : "Finding the right words, context, and structure…"}
                      </p>
                      <div className="loading-bars">
                        <i />
                        <i />
                        <i />
                      </div>
                    </div>
                  ) : (
                    <div className="result-body">
                      {editing ? (
                        <>
                          <label className="sr-only" htmlFor="prompt-editor">
                            {cs ? "Upravit prompt" : "Edit prompt"}
                          </label>
                          <textarea
                            id="prompt-editor"
                            className="result-editor"
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            maxLength={30000}
                          />
                          <p className="field-hint">
                            {cs
                              ? "Změny se ukládají do této jazykové verze."
                              : "Edits are saved to this language version."}
                          </p>
                        </>
                      ) : (
                        <PromptText text={current} />
                      )}
                    </div>
                  )}
                  <div className="result-bottom">
                    <span>
                      {cs
                        ? "Vytvořeno s AI. Před použitím zkontroluj."
                        : "AI-assisted. Review before you use it."}
                    </span>
                    {editing ? (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="text-button"
                          onClick={() => setEditing(false)}
                        >
                          {cs ? "Zrušit" : "Cancel"}
                        </button>
                        <button
                          className="button button-primary button-small"
                          onClick={saveEdit}
                          disabled={!draft.trim()}
                        >
                          <Icon name="check" size={14} />
                          {cs ? "Uložit" : "Save"}
                        </button>
                      </div>
                    ) : (
                      <button
                        className="button button-primary button-small"
                        disabled={!result || busy}
                        onClick={copy}
                      >
                        <Icon name="copy" size={14} />
                        {cs ? "Zkopírovat" : "Copy prompt"}
                      </button>
                    )}
                  </div>
                </section>
                {result && (
                  <section className="panel refine-section">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <h3>
                        {cs ? "Ještě ne úplně ono?" : "Not quite there yet?"}
                      </h3>
                      {previous && (
                        <button
                          className="text-button"
                          disabled={busy || editing}
                          onClick={() => {
                            persist(previous);
                            setPrevious(null);
                          }}
                        >
                          <Icon name="undo" size={13} />
                          {cs ? "Vrátit" : "Undo"}
                        </button>
                      )}
                    </div>
                    <p>
                      {cs
                        ? "Drobná změna může udělat velký rozdíl."
                        : "A small adjustment can make all the difference."}
                    </p>
                    <div className="refine-chips">
                      {(cs
                        ? [
                            "Stručněji",
                            "Přirozenější tón",
                            "Konkrétnější výstup",
                          ]
                        : [
                            "Make it shorter",
                            "More conversational",
                            "More specific output",
                          ]
                      ).map((f) => (
                        <button
                          key={f}
                          disabled={busy || editing}
                          onClick={() => {
                            setFeedback(f);
                            void generate(
                              { prompt: current, feedback: f },
                              result,
                            );
                          }}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    <form
                      className="refine-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (feedback.trim())
                          void generate({ prompt: current, feedback }, result);
                      }}
                    >
                      <label className="sr-only" htmlFor="refine-input">
                        {cs ? "Co změnit?" : "What should change?"}
                      </label>
                      <input
                        id="refine-input"
                        className="field-input"
                        placeholder={
                          cs
                            ? "Co bys chtěl změnit?"
                            : "What would you like to change?"
                        }
                        value={feedback}
                        maxLength={1000}
                        disabled={busy || editing}
                        onChange={(e) => setFeedback(e.target.value)}
                      />
                      <button
                        className="button button-secondary"
                        disabled={busy || editing || !feedback.trim()}
                        type="submit"
                        aria-label={cs ? "Vylepšit prompt" : "Refine prompt"}
                      >
                        <Icon name="arrow" size={17} />
                      </button>
                    </form>
                    {busy && (
                      <p role="status">
                        {cs ? "Upravuji prompt…" : "Refining your prompt…"}
                      </p>
                    )}
                  </section>
                )}
              </div>
              <aside className="result-sidebar">
                <section className="panel">
                  <span className="model-badge">
                    <Icon name="spark" size={14} />
                    {cs ? "DOPORUČENÝ NÁSTROJ" : "A SUGGESTED STARTING POINT"}
                  </span>
                  <h2 className="model-title">
                    {result ? provider.name : "—"}
                  </h2>
                  <p className="model-reason">
                    {result?.whyThisModel ||
                      (cs
                        ? "Doporučení se zobrazí společně s výsledkem."
                        : "Your suggestion will appear with the finished prompt.")}
                  </p>
                  <button
                    className="button button-secondary model-action"
                    disabled={!result || busy || editing}
                    onClick={openAI}
                  >
                    {cs
                      ? `Použít v ${provider.name}`
                      : `Use in ${provider.name}`}
                    <Icon name="up-right" size={16} />
                  </button>
                  <p className="side-caption">
                    {cs
                      ? "Zkopíruje prompt a otevře AI. V nové konverzaci ho vlož. Může být potřeba účet."
                      : "Copies your prompt and opens the AI. Paste it into a new chat. An account may be required."}
                  </p>
                </section>
                {!!result?.assumptions?.length && (
                  <details className="panel">
                    <summary>
                      {cs ? "Co jsme předpokládali" : "What we assumed"}
                      <Icon name="chevron" size={16} />
                    </summary>
                    <ul>
                      {result.assumptions.map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                  </details>
                )}
                <div className="panel">
                  <Icon name="clock" size={18} />
                  <p className="side-caption">
                    {cs
                      ? "Prompty najdeš v historii tohoto prohlížeče. Důležité prompty si raději stáhni."
                      : "Your prompts live in this browser’s history. Download anything you’d like to keep."}
                  </p>
                  <Link href="/history" className="text-button">
                    {cs ? "Otevřít historii" : "Your prompt history"}
                    <Icon name="arrow" size={14} />
                  </Link>
                </div>
              </aside>
            </div>
          </>
        )}
      </main>
      <Footer />
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  );
}
