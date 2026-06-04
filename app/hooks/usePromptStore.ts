"use client";

// Store wizard state in sessionStorage so it survives page navigation

export interface WizardInputs {
  task: string;
  context: string;
  output: string;
  preferences: string;
  role: string;
}

export interface PromptResult {
  prompt: string;
  // Bilingual fields (optional — older history entries won't have them).
  promptEnglish?: string;
  promptLocalized?: string;
  detectedLanguage?: string;
  recommendedModel: string;
  whyThisModel: string;
  alternatives: string[];
  generationId?: string;  // Added for rating system
}

const SESSION_KEY = "prompt-it-wizard";
const RESULT_KEY = "prompt-it-result";

export function getWizardInputs(): WizardInputs {
  if (typeof window === "undefined")
    return { task: "", context: "", output: "", preferences: "", role: "" };
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw
      ? JSON.parse(raw)
      : { task: "", context: "", output: "", preferences: "", role: "" };
  } catch {
    return { task: "", context: "", output: "", preferences: "", role: "" };
  }
}

export function saveWizardInputs(inputs: WizardInputs) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(inputs));
}

export function clearWizardInputs() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
}

export function getPromptResult(): PromptResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(RESULT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function savePromptResult(result: PromptResult) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
}
