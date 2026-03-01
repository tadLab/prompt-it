import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { createHash } from "crypto";

const SYSTEM_PROMPT = `You are a prompt engineering assistant. Your job is to take a user's raw inputs and generate a high-quality, structured prompt that they can use with any AI model.

You will receive 5 inputs:
1. Task - what they want AI to help with
2. Context - who it's for, background info
3. Output - desired output format
4. Preferences - tone, constraints, language
5. Role - the AI role/expertise level

Generate a structured prompt with these sections:
- ### Role
- ### Goal
- ### Context
- ### Requirements
- ### Output Format

Also recommend the best AI model for this prompt and explain why.

Return ONLY valid JSON in this exact format:
{
  "prompt": "The full structured prompt text with ### headers",
  "recommendedModel": "Model name (e.g. Claude, ChatGPT, Gemini)",
  "whyThisModel": "One sentence explanation",
  "alternatives": ["Alt1", "Alt2"]
}

Guidelines:
- Make the prompt clear, specific, and immediately usable
- Use bullet points in sections where appropriate
- Keep it concise but thorough
- Choose the model recommendation based on the task type:
  - Claude: structured tasks, analysis, long context, coding
  - ChatGPT: creative writing, marketing, conversational tasks
  - Gemini: research, multimodal tasks, data analysis
- Always include exactly 2 alternatives`;

export async function POST(req: NextRequest) {
  // Parse body once upfront so it's available in both try and catch
  const body = await req.json();
  const { task, context, output, preferences, role } = body;

  if (!task) {
    return NextResponse.json({ error: "Task is required" }, { status: 400 });
  }

  // Input validation
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

  // --- AUTH & USAGE CHECK ---
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const serviceClient = createServiceClient();

  // Generate anonymous ID from IP for free tier tracking
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const anonymousId = createHash("sha256")
    .update(ip)
    .digest("hex")
    .slice(0, 16);

  let userCoins = 0;

  if (user) {
    // Authenticated user — check coin balance
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("coins")
      .eq("id", user.id)
      .single();

    userCoins = profile?.coins ?? 0;

    if (userCoins <= 0) {
      return NextResponse.json(
        { error: "Payment required", code: "PAYMENT_REQUIRED" },
        { status: 403 }
      );
    }
  } else {
    // Anonymous user — allow max 1 free generation per IP
    const { count } = await serviceClient
      .from("generations")
      .select("*", { count: "exact", head: true })
      .eq("anonymous_id", anonymousId);

    if ((count ?? 0) >= 1) {
      return NextResponse.json(
        { error: "Sign up required", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }
  }

  // --- GENERATE PROMPT ---
  try {
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Task: ${task}\nContext: ${context}\nOutput format: ${output}\nPreferences: ${preferences}\nRole: ${role}`,
        },
      ],
    });

    // Extract text from response
    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text in response");
    }

    // Parse JSON - handle possible markdown code fences
    let jsonText = textBlock.text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText
        .replace(/^```(?:json)?\n?/, "")
        .replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(jsonText);

    // Log the generation
    const { data: generation } = await serviceClient
      .from("generations")
      .insert({
        user_id: user?.id || null,
        anonymous_id: user ? null : anonymousId,
      })
      .select("id")
      .single();

    // Deduct 1 coin for authenticated users
    let remainingCoins = userCoins;
    if (user) {
      const { data } = await serviceClient.rpc("increment_coins", {
        user_id: user.id,
        amount: -1,
      });
      remainingCoins = data ?? userCoins - 1;
    }

    return NextResponse.json({
      prompt: parsed.prompt,
      recommendedModel: parsed.recommendedModel,
      whyThisModel: parsed.whyThisModel,
      alternatives: parsed.alternatives,
      remainingCoins,
      generationId: generation?.id,
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(generateFallbackPrompt(body));
  }
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
${role || "You are a helpful AI assistant."}

### Goal
${task}

### Context
${context || "No specific context provided."}

### Requirements
${preferences ? `- ${preferences.split(",").join("\n- ")}` : "- Follow best practices\n- Be clear and concise"}

### Output Format
${output || "Provide a clear, well-structured response."}`;

  return {
    prompt,
    recommendedModel: "Claude",
    whyThisModel:
      "Claude excels at following structured instructions and producing clean, readable outputs.",
    alternatives: ["ChatGPT", "Gemini"],
  };
}
