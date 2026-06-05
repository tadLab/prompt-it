"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { messages, LANGS, type Lang } from "./messages";

const STORAGE_KEY = "prompt-it-lang";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, vars?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // SSR-safe default: must match the server render (English) on first paint to
  // avoid a hydration mismatch; the real preference is applied in useEffect.
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "cs") {
      setLangState(stored);
    } else if (navigator.language?.toLowerCase().startsWith("cs")) {
      // First-time Czech visitor → default to Czech.
      setLangState("cs");
    }
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
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
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
      className="flex items-center rounded-full border border-white/10 overflow-hidden text-xs"
      role="group"
      aria-label="Language"
    >
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`px-2.5 py-1 font-semibold transition-colors ${
            lang === l
              ? "bg-emerald-500 text-black"
              : "text-white/50 hover:text-white"
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
