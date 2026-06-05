// Shared generation logic so the structured (tool-use) and streaming routes
// produce identically-structured, same-quality prompts. The only thing that
// differs between the two routes is HOW the output is returned.

export const PROMPT_CORE = `You are an expert prompt engineer. Your job is to transform vague user inputs into detailed, actionable prompts that produce excellent AI outputs.

CRITICAL RULES:
1. NEVER just restate the user's input with headers. You must EXPAND, ENRICH, and ADD DETAIL.
2. Infer what the user likely needs even if they didn't say it explicitly.
3. Add specific, practical instructions that guide the AI toward a great result.
4. Write in the SAME LANGUAGE as the user's input (if they write in Czech, the prompt must be in Czech, etc.).
5. Every section should contain real, actionable guidance — not generic filler.

PROMPT STRUCTURE — use all of these sections:

### Role
- Define a specific expert persona with relevant experience

### Goal
- Clearly state the end deliverable and its purpose, including the "why"

### Context
- Fill in background the AI needs: industry, company type, audience, situation
- Infer reasonable details and include relevant constraints

### Audience
- Who will read/use this output, what they care about, their knowledge level

### Tone & Style
- Specific tone descriptors (not just "professional" — HOW professional?), register, energy

### Requirements
- Bullet list of specific, actionable requirements (structure, content, quality)

### Output Format
- Exact structure the AI should follow: length, sections, formatting

ENRICHMENT GUIDELINES:
- "write a post" → platform best practices (LinkedIn: hook in first 2 lines, ~1300 chars, line breaks, CTA)
- mentions a company → highlight value props, differentiation, specific products/services
- sales/marketing → conversion focus (CTA, pain points, social proof)
- "friendly" → concrete tone guidance (conversational openers, personal pronouns, rhetorical questions)
- vague input → add reasonable defaults and practical specifics
- code/technical → edge cases, error handling, documentation, testing

INFERENCE & ASSUMPTIONS:
- The user may leave gaps (skipped questions, missing details). Do NOT ask for more — infer a sensible, specific default and proceed.
- Record every meaningful gap you filled as a short "Topic: assumed value" in the user's language (for an English input that reads like: "Tone: professional but warm").

LANGUAGE (important):
- Detect the language from the USER'S INPUT TEXT itself (ISO 639-1, e.g. "en", "cs", "sk"). Do not assume a default language.
- The user-facing prompt MUST be written in that same language: an English input → write in English; a Czech input → write in Czech.
- AI models perform best with English, which is why a separate English version is also produced — but never replace the user's language with English in the user-facing prompt.`;

export interface GenerateBody {
  task?: string;
  context?: string;
  output?: string;
  preferences?: string;
  role?: string;
  refinePrompt?: string;
  feedback?: string;
  goal?: string;
  answers?: { question?: string; answer?: string }[];
  lang?: string; // UI language the user explicitly selected (overrides auto-detect)
}

const LANG_NAMES: Record<string, string> = { cs: "Czech", en: "English" };

// When the user has explicitly chosen a UI language, that choice is authoritative
// for the user-facing output — it should NOT be overridden by auto-detecting the
// goal text (a Czech user typing a short English-looking goal still wants Czech).
export function preferredLanguageInstruction(lang: unknown): string {
  const name = typeof lang === "string" ? LANG_NAMES[lang] : undefined;
  if (!name) return "";
  return `\n\nIMPORTANT: The user selected ${name} as their language. Write the user-facing prompt in ${name} and set detectedLanguage to "${lang}", regardless of the language of the goal text above.`;
}

export function classifyRequest(body: GenerateBody) {
  const isRefine =
    typeof body.refinePrompt === "string" &&
    typeof body.feedback === "string" &&
    body.refinePrompt.trim().length > 0 &&
    body.feedback.trim().length > 0;
  const intakeGoal = typeof body.goal === "string" ? body.goal.trim() : "";
  const isIntake = !isRefine && intakeGoal.length > 0;
  return { isRefine, isIntake, intakeGoal };
}

// Builds the model's user message for whichever mode the request is in.
export function buildUserContent(body: GenerateBody): string {
  const { isRefine, isIntake, intakeGoal } = classifyRequest(body);

  const langSuffix = preferredLanguageInstruction(body.lang);

  if (isRefine) {
    return `Here is an existing prompt you produced earlier:\n---\n${body.refinePrompt}\n---\n\nThe user wants to refine it with this feedback: "${body.feedback}"\n\nApply the feedback and return an improved version. Keep the overall structure and quality bar; change what the feedback asks for (and whatever is needed to support it). Preserve the bilingual behavior.${langSuffix}`;
  }

  if (isIntake) {
    const answered = Array.isArray(body.answers)
      ? body.answers.filter((a) => a && typeof a.answer === "string" && a.answer.trim().length > 0)
      : [];
    const qa = answered.length
      ? answered.map((a) => `- ${a.question}: ${a.answer}`).join("\n")
      : "(the user skipped the questions — infer everything you need)";
    return `The user's goal:\n${intakeGoal}\n\nClarifying answers provided:\n${qa}\n\nBuild the optimized prompt. For anything not specified above, infer sensible, specific defaults and list them in assumptions.${langSuffix}`;
  }

  return `Task: ${body.task}\nContext: ${body.context}\nOutput format: ${body.output}\nPreferences: ${body.preferences}\nRole: ${body.role}${langSuffix}`;
}
