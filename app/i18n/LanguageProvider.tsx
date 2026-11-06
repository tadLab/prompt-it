"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { messages, LANGS, type Lang } from "./messages";

const STORAGE_KEY = "prompt-it-lang";

interface LanguageContextValue {
  lang: Lang;
  ready: boolean;
  setLang: (lang: Lang) => void;
  t: (key: string, vars?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  ready: false,
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // SSR-safe default: must match the server render (English) on first paint to
  // avoid a hydration mismatch; the real preference is applied in useEffect.
  const [lang, setLangState] = useState<Lang>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* private browsing */
    }
    if (stored === "en" || stored === "cs") {
      setLangState(stored);
    } else if (navigator.language?.toLowerCase().startsWith("cs")) {
      // First-time Czech visitor → default to Czech.
      setLangState("cs");
    }
    setReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage may be unavailable; in-memory state still updates */
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string>) => {
      let str = messages[lang][key] ?? messages.en[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replaceAll(`{${k}}`, v);
        }
      }
      return str;
    },
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, ready, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}

/** Convenience hook for components that only need the translate function. */
export function useT() {
  return useContext(LanguageContext).t;
}

/** EN / CS segmented toggle. */
export function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div
      className="language-switch"
      role="group"
      aria-label={lang === "cs" ? "Jazyk" : "Language"}
    >
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={lang === l ? "active" : ""}
        >
          {l === "cs" ? "CZ" : "EN"}
        </button>
      ))}
    </div>
  );
}

export function SkipLink() {
  const { lang } = useLang();
  return (
    <a className="skip-link" href="#main-content">
      {lang === "cs" ? "Přeskočit na obsah" : "Skip to content"}
    </a>
  );
}
