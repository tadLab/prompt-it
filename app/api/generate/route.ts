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

Respond with ONLY valid JSON (no markdown, no backticks):
{"prompt":"the full structured prompt with ### headers","recommendedModel":"Claude|ChatGPT|Gemini","whyThisModel":"one sentence explaining why","alternatives":["Alt1","Alt2"]}

Model guide: Claude = structured tasks, analysis, coding, long-form writing. ChatGPT = creative content, marketing, conversational, brainstorming. Gemini = research, multimodal, data analysis, summarization.`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { task, context, output, preferences, role } = body;

  if (!task) {
    return NextResponse.json({ error: "Task is required" }, { status: 400 });
  }

  const MAX_FIELD_LENGTH = 2000;
  const fields = { task, context, output, preferences, role };

  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === "string" && value.length > MAX_FIELD_LENGTH) {
      return NextResponse.json(
        { error: `${key} exceeds maximum length of ${MAX_FIELD_LENGTH} characters` },
        { status: 400 }
      );
    }
  }

  let parsed;
  try {
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Task: ${task}\nContext: ${context}\nOutput format: ${output}\nPreferences: ${preferences}\nRole: ${role}`,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text in response");
    }

    let jsonText = textBlock.text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText
        .replace(/^```(?:json)?\n?/, "")
        .replace(/\n?```$/, "");
    }

    // Try to extract JSON object if there's extra text around it
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    try {
      parsed = JSON.parse(jsonText);
    } catch {
      // If JSON is malformed, try to extract fields manually
      const promptMatch = jsonText.match(/"prompt"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"recommendedModel)/);
      const modelMatch = jsonText.match(/"recommendedModel"\s*:\s*"([^"]+)"/);
      const whyMatch = jsonText.match(/"whyThisModel"\s*:\s*"([^"]+)"/);
      const altMatch = jsonText.match(/"alternatives"\s*:\s*\[([\s\S]*?)\]/);

      if (promptMatch) {
        parsed = {
          prompt: promptMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"'),
          recommendedModel: modelMatch?.[1] || "Claude",
          whyThisModel: whyMatch?.[1] || "Best suited for this type of structured task.",
          alternatives: altMatch?.[1]
            ? altMatch[1].match(/"([^"]+)"/g)?.map((s: string) => s.replace(/"/g, "")) || ["ChatGPT", "Gemini"]
            : ["ChatGPT", "Gemini"],
        };
      } else {
        throw new Error("Could not parse AI response");
      }
    }
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(generateFallbackPrompt(body));
  }

  return NextResponse.json({
    prompt: parsed.prompt,
    recommendedModel: parsed.recommendedModel,
    whyThisModel: parsed.whyThisModel,
    alternatives: parsed.alternatives,
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

  const prompt = `### Role
${role || "You are a skilled AI assistant with expertise relevant to this task."}

### Goal
${task}

### Context
${context || "Use your best judgment to infer relevant context for this task."}

### Audience
The intended audience for this output. Tailor language and depth accordingly.

### Tone & Style
${preferences || "Professional, clear, and actionable."}

### Requirements
${preferences ? `- ${preferences.split(",").join("\n- ")}` : "- Be specific and actionable\n- Include concrete details, not generic advice\n- Structure the output for easy scanning"}

### Output Format
${output || "Provide a clear, well-structured response with appropriate sections and formatting."}`;

  return {
    prompt,
    recommendedModel: "Claude",
    whyThisModel:
      "Claude excels at following structured instructions and producing clean, readable outputs.",
    alternatives: ["ChatGPT", "Gemini"],
  };
}
