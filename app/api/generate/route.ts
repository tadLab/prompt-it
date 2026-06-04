import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/env";

const SYSTEM_PROMPT = `You are an expert prompt engineer. Your job is to transform vague user inputs into detailed, actionable prompts that produce excellent AI outputs.

CRITICAL RULES:
1. NEVER just restate the user's input with headers. You must EXPAND, ENRICH, and ADD DETAIL.
2. Infer what the user likely needs even if they didn't say it explicitly.
3. Add specific, practical instructions that guide the AI toward a great result.
4. Write in the SAME LANGUAGE as the user's input (if they write in Czech, the prompt must be in Czech, etc.).
5. Every section should contain real, actionable guidance — not generic filler.

PROMPT STRUCTURE — use all of these sections:

### Role
- Define a specific expert persona with relevant experience
- Example: Instead of "You are a helpful assistant" → "You are a senior B2B copywriter with 10 years of experience writing LinkedIn content for IT distribution companies in Central Europe"

### Goal
- Clearly state the end deliverable and its purpose
- Be specific about what success looks like
- Include the "why" — what should this achieve?

### Context
- Fill in background the AI needs: industry, company type, audience, situation
- Infer reasonable details from the user's input (e.g., if they mention "corporate clients" → decision makers, procurement teams, IT managers)
- Include relevant constraints: platform norms, cultural context, market specifics

### Audience
- Who will read/use this output?
- What do they care about? What motivates them?
- What's their knowledge level?

### Tone & Style
- Specific tone descriptors (not just "professional" — HOW professional?)
- Reference examples if helpful ("like [known style] but more...")
- Language register, formality level, energy

### Requirements
- Bullet list of specific, actionable requirements
- Include structural requirements (length, sections, format)
- Include content requirements (what to include/exclude)
- Include quality requirements (originality, specificity, etc.)

### Output Format
- Exact structure the AI should follow
- Specify length, sections, formatting
- Include examples of what the output should look like if helpful

ENRICHMENT GUIDELINES:
- If the user says "write a post" → specify platform best practices (LinkedIn: hook in first 2 lines, 1300 chars optimal, use line breaks, end with CTA)
- If the user mentions a company → add instructions to highlight value propositions, differentiation, specific products/services
- If the user mentions sales/marketing → add conversion-focused instructions (CTA, pain points, social proof)
- If the user says "friendly" → translate to specific tone guidance (conversational openers, personal pronouns, rhetorical questions, emoji usage)
- If the input is vague → add reasonable defaults and practical specifics that make the prompt actually useful
- If the user mentions code/technical work → add instructions about edge cases, error handling, documentation, testing

LANGUAGE & BILINGUAL OUTPUT:
- Detect the language of the user's input and report it as an ISO 639-1 code (e.g. "en", "cs", "sk").
- ALWAYS produce an optimized prompt in English — AI models perform best with English prompts.
- If the user's input language is NOT English, ALSO produce the same optimized prompt written natively in that language (a natural rewrite, not a literal word-for-word translation). If the input IS English, leave the localized version empty.
- Both versions must follow the same structure and quality bar.

Return your result by calling the submit_optimized_prompt tool.

Model guide: Claude = structured tasks, analysis, coding, long-form writing. ChatGPT = creative content, marketing, conversational, brainstorming. Gemini = research, multimodal, data analysis, summarization.`;

// Forcing a tool call guarantees schema-valid structured output — no more
// regex-parsing of free-form JSON that the model might wrap in prose or markdown.
const OUTPUT_TOOL: Anthropic.Tool = {
  name: "submit_optimized_prompt",
  description:
    "Submit the optimized prompt (English + optional localized version) and the model recommendation.",
  input_schema: {
    type: "object",
    properties: {
      detectedLanguage: {
        type: "string",
        description: "ISO 639-1 code of the user's input language, e.g. 'en', 'cs'.",
      },
      promptEnglish: {
        type: "string",
        description: "The fully optimized prompt in English, with ### section headers.",
      },
      promptLocalized: {
        type: "string",
        description:
          "The same optimized prompt written natively in the user's input language. Empty string if the input was already English.",
      },
      recommendedModel: {
        type: "string",
        enum: ["Claude", "ChatGPT", "Gemini"],
        description: "Which AI model best fits this prompt.",
      },
      whyThisModel: {
        type: "string",
        description: "One sentence explaining the recommendation.",
      },
      alternatives: {
        type: "array",
        items: { type: "string" },
        description: "Two alternative models with a short reason each.",
      },
    },
    required: [
      "detectedLanguage",
      "promptEnglish",
      "promptLocalized",
      "recommendedModel",
      "whyThisModel",
      "alternatives",
    ],
  },
};

interface OptimizedPromptOutput {
  detectedLanguage: string;
  promptEnglish: string;
  promptLocalized: string;
  recommendedModel: string;
  whyThisModel: string;
  alternatives: string[];
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { task, context, output, preferences, role, refinePrompt, feedback } = body;

  // Refine mode: improve an existing prompt from user feedback instead of
  // building one from the wizard fields.
  const isRefine =
    typeof refinePrompt === "string" &&
    typeof feedback === "string" &&
    refinePrompt.trim().length > 0 &&
    feedback.trim().length > 0;

  if (!isRefine && !task) {
    return NextResponse.json({ error: "Task is required" }, { status: 400 });
  }

  const MAX_FIELD_LENGTH = 2000;
  const fields = { task, context, output, preferences, role, feedback };

  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === "string" && value.length > MAX_FIELD_LENGTH) {
      return NextResponse.json(
        { error: `${key} exceeds maximum length of ${MAX_FIELD_LENGTH} characters` },
        { status: 400 }
      );
    }
  }
  // The existing prompt is much longer than a wizard field — allow more room.
  if (typeof refinePrompt === "string" && refinePrompt.length > 16000) {
    return NextResponse.json(
      { error: "refinePrompt exceeds maximum length" },
      { status: 400 }
    );
  }

  let out: OptimizedPromptOutput;
  try {
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      tools: [OUTPUT_TOOL],
      tool_choice: { type: "tool", name: OUTPUT_TOOL.name },
      messages: [
        {
          role: "user",
          content: isRefine
            ? `Here is an existing prompt you produced earlier:\n---\n${refinePrompt}\n---\n\nThe user wants to refine it with this feedback: "${feedback}"\n\nApply the feedback and return an improved version. Keep the overall structure and quality bar; change what the feedback asks for (and whatever is needed to support it). Preserve the bilingual behavior (English + localized).`
            : `Task: ${task}\nContext: ${context}\nOutput format: ${output}\nPreferences: ${preferences}\nRole: ${role}`,
        },
      ],
    });

    const toolUse = message.content.find((block) => block.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error("Model did not return a tool call");
    }

    out = toolUse.input as OptimizedPromptOutput;
    if (!out.promptEnglish || typeof out.promptEnglish !== "string") {
      throw new Error("Tool output missing promptEnglish");
    }
  } catch (error) {
    console.error("AI generation error:", error instanceof Error ? error.message : error);
    // On refine failure the user still has their current prompt on screen, so
    // surface an error instead of replacing it with a generic fallback.
    if (isRefine) {
      return NextResponse.json({ error: "Refine failed" }, { status: 502 });
    }
    return NextResponse.json(generateFallbackPrompt(body));
  }

  const promptLocalized =
    out.detectedLanguage?.toLowerCase().startsWith("en") ? "" : out.promptLocalized || "";

  return NextResponse.json({
    // `prompt` stays as the canonical single string for history / back-compat:
    // the user's own language when available, otherwise English.
    prompt: promptLocalized || out.promptEnglish,
    promptEnglish: out.promptEnglish,
    promptLocalized,
    detectedLanguage: out.detectedLanguage || "en",
    recommendedModel: out.recommendedModel || "Claude",
    whyThisModel: out.whyThisModel || "Best suited for this type of structured task.",
    alternatives: out.alternatives?.length ? out.alternatives : ["ChatGPT", "Gemini"],
  });
}

function generateFallbackPrompt(inputs: {
  task?: string;
  context?: string;
  output?: string;
  preferences?: string;
  role?: string;
}) {
  const {
    task = "",
    context = "",
    output = "",
    preferences = "",
    role = "",
  } = inputs;

  // Build a genuinely useful prompt even when the API fails
  const inferredRole = role
    ? `You are ${role}. Bring deep domain expertise, practical experience, and actionable insights to this task. Draw on industry best practices and proven frameworks relevant to your field.`
    : "You are a senior expert with deep experience in the relevant domain. Apply your expertise to deliver precise, actionable, and high-quality output.";

  const inferredContext = context
    ? `${context}\n\nConsider the broader implications: who are the stakeholders, what are the constraints, and what does success look like in this specific situation? Factor in industry norms, competitive landscape, and any unspoken expectations.`
    : "Use your best judgment to infer the relevant context. Consider the industry, typical audience, and common requirements for this type of task.";

  const inferredTone = preferences
    ? `${preferences}. Be consistent with this tone throughout. Ensure the voice feels authentic and natural — not robotic or generic. Vary sentence structure and length for readability.`
    : "Professional yet approachable. Clear and direct without being dry. Use concrete language over abstract jargon. Write for humans, not algorithms.";

  const inferredOutput = output
    ? `${output}\n\nStructure the output for easy scanning: use headers, bullet points, or numbered lists where appropriate. Front-load the most important information. Include specific examples where they add clarity.`
    : "Provide a well-structured response with clear sections. Use formatting (headers, bullets, bold) to aid readability. Include specific examples and actionable details — avoid vague generalities.";

  const prompt = `### Role
${inferredRole}

### Goal
${task}

Approach this task with specificity and depth. Don't just cover the basics — anticipate follow-up questions and address them proactively. Every point should be concrete and actionable, not a generic placeholder.

### Context
${inferredContext}

### Audience
Tailor the language, depth, and examples to the audience most likely to use this output. Match their knowledge level — don't over-explain basics they already know, but don't skip context they need.

### Tone & Style
${inferredTone}

### Requirements
- Be specific and actionable — every sentence should earn its place
- Include concrete details, real examples, and practical guidance
- Avoid filler phrases, clichés, and generic advice
- Structure the output for easy scanning and quick reference
- Anticipate edge cases and address common pitfalls
${preferences ? `- ${preferences.split(",").map(p => p.trim()).join("\n- ")}` : ""}

### Output Format
${inferredOutput}`;

  return {
    // Offline fallback (network/API failure): English scaffold only, so the
    // localized version is empty and the UI shows a single prompt.
    prompt,
    promptEnglish: prompt,
    promptLocalized: "",
    detectedLanguage: "en",
    recommendedModel: "Claude",
    whyThisModel:
      "Claude excels at following structured instructions and producing detailed, well-organized outputs.",
    alternatives: ["ChatGPT (great for creative/marketing tasks)", "Gemini (great for research/data tasks)"],
  };
}
