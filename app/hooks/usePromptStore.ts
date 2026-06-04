"use client";

// Store wizard state in sessionStorage so it survives page navigation

export interface WizardAnswer {
  question: string;
  answer: string;
}

// Adaptive intake: the user types one goal, then optionally answers a few
// AI-generated questions. Anything skipped is inferred at generation time.
export interface WizardInputs {
  goal: string;
  answers: WizardAnswer[];
}

export interface PromptResult {
  prompt: string;
  // Bilingual fields (optional — older history entries won't have them).
  promptEnglish?: string;
  promptLocalized?: string;
  detectedLanguage?: string;
  // Inferred defaults for anything the user didn't specify.
  assumptions?: string[];
  recommendedModel: string;
  whyThisModel: string;
  alternatives: string[];
  generationId?: string;  // Added for rating system
}

const EMPTY_INPUTS: WizardInputs = { goal: "", answers: [] };

const SESSION_KEY = "prompt-it-wizard";
const RESULT_KEY = "prompt-it-result";

export function getWizardInputs(): WizardInputs {
  if (typeof window === "undefined") return { ...EMPTY_INPUTS };
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return { ...EMPTY_INPUTS };
    const parsed = JSON.parse(raw);
    return {
      goal: typeof parsed.goal === "string" ? parsed.goal : "",
      answers: Array.isArray(parsed.answers) ? parsed.answers : [],
    };
  } catch {
    return { ...EMPTY_INPUTS };
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
