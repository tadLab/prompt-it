import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAuthUser } from "@/lib/firebase/server-auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { getUserProfile, getAnonymousGenerationCount, incrementCoins } from "@/lib/firebase/db";
import { env } from "@/lib/env";
import { createHash } from "crypto";
import { FieldValue } from "firebase-admin/firestore";

const SYSTEM_PROMPT = `Turn user inputs (Task, Context, Output, Preferences, Role) into a structured prompt with sections: ### Role, ### Goal, ### Context, ### Requirements, ### Output Format.

Respond with ONLY valid JSON:
{"prompt":"structured prompt with ### headers","recommendedModel":"Claude|ChatGPT|Gemini","whyThisModel":"one sentence","alternatives":["Alt1","Alt2"]}

Model guide: Claude=structured/analysis/coding, ChatGPT=creative/marketing/conversational, Gemini=research/multimodal/data. Use bullet points, be concise but thorough.`;

export async function POST(req: NextRequest) {
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
  const user = await getAuthUser();

  // Generate anonymous ID from IP for free tier tracking
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const anonymousId = createHash("sha256")
    .update(ip)
    .digest("hex")
    .slice(0, 16);

  if (user) {
    const profile = await getUserProfile(user.uid);
    const remaining = profile?.coins ?? 0;

    if (remaining <= 0) {
      return NextResponse.json(
        { error: "Prompt limit reached (10 per account)", code: "LIMIT_REACHED" },
        { status: 403 }
      );
    }
  } else {
    const count = await getAnonymousGenerationCount(anonymousId);

    if (count >= 1) {
      return NextResponse.json(
        { error: "Sign up required", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }
  }

  // --- GENERATE PROMPT ---
  let parsed;
  try {
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
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

    parsed = JSON.parse(jsonText);
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(generateFallbackPrompt(body));
  }

  // --- LOG & DEDUCT (best-effort) ---
  let generationId: string | undefined;

  try {
    const genRef = await getAdminDb().collection("generations").add({
      userId: user?.uid || null,
      anonymousId: user ? null : anonymousId,
      createdAt: FieldValue.serverTimestamp(),
    });

    generationId = genRef.id;

    if (user) {
      await incrementCoins(user.uid, -1);
    }
  } catch (dbError) {
    console.error("DB logging error (prompt still returned):", dbError);
  }

  return NextResponse.json({
    prompt: parsed.prompt,
    recommendedModel: parsed.recommendedModel,
    whyThisModel: parsed.whyThisModel,
    alternatives: parsed.alternatives,
    generationId,
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
