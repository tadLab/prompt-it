"use client";

import { useState, useEffect, useCallback } from "react";

export interface HistoryEntry {
  id: string;
  createdAt: string;
  inputs: {
    goal?: string;
    answers?: { question: string; answer: string }[];
    // Legacy entries (created before the adaptive intake) used these fields.
    task?: string;
    context?: string;
    output?: string;
    preferences?: string;
    role?: string;
  };
  result: {
    prompt: string;
    recommendedModel: string;
    whyThisModel: string;
    alternatives: string[];
  };
}

const STORAGE_KEY = "prompt-it-history";

function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const addEntry = useCallback((entry: Omit<HistoryEntry, "id" | "createdAt">) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newEntry, ...getHistory()];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setHistory(updated);
    return newEntry;
  }, []);

  const removeEntry = useCallback((id: string) => {
    const updated = getHistory().filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setHistory(updated);
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  }, []);

  return { history, addEntry, removeEntry, clearHistory };
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
