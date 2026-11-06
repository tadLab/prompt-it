"use client";

import { useState, useEffect, useCallback } from "react";
import type { PromptResult } from "./usePromptStore";

export interface HistoryEntry {
  id: string;
  createdAt: string;
  inputs: {
    goal?: string;
    answers?: { question: string; answer: string }[];
    lang?: "en" | "cs";
    // Legacy entries (created before the adaptive intake) used these fields.
    task?: string;
    context?: string;
    output?: string;
    preferences?: string;
    role?: string;
  };
  result: PromptResult;
}

const STORAGE_KEY = "prompt-it-history";

function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((e) => e?.id && typeof e?.result?.prompt === "string")
      : [];
  } catch {
    return [];
  }
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const addEntry = useCallback(
    (entry: Omit<HistoryEntry, "id" | "createdAt">) => {
      const newEntry: HistoryEntry = {
        ...entry,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      const updated = [newEntry, ...getHistory()].slice(0, 100);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setHistory(updated);
      return newEntry;
    },
    [],
  );

  const removeEntry = useCallback((id: string) => {
    const updated = getHistory().filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setHistory(updated);
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  }, []);

  const updateEntry = useCallback((id: string, result: PromptResult) => {
    const updated = getHistory().map((entry) =>
      entry.id === id ? { ...entry, result } : entry,
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setHistory(updated);
  }, []);

  return { history, addEntry, updateEntry, removeEntry, clearHistory };
}

export function useHistoryCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(getHistory().length);

    // Listen for storage changes from other tabs/components
    const handleStorage = () => setCount(getHistory().length);
    window.addEventListener("storage", handleStorage);

    // Custom event for same-tab updates
    window.addEventListener("history-updated", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("history-updated", handleStorage);
    };
  }, []);

  return count;
}
