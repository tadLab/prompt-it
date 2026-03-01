import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { generationId, rating } = await req.json();

  if (!generationId || !["up", "down"].includes(rating)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const serviceClient = createServiceClient();

  // Check if already rated
  const { data: existing } = await serviceClient
    .from("ratings")
    .select("id")
    .eq("user_id", user.id)
    .eq("generation_id", generationId)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Already rated", alreadyRated: true }, { status: 409 });
  }

  // Insert rating
  await serviceClient.from("ratings").insert({
    user_id: user.id,
    generation_id: generationId,
    rating,
  });

  // Credit +1 coin
  const { data: newBalance } = await serviceClient.rpc("increment_coins", {
    user_id: user.id,
    amount: 1,
  });

  return NextResponse.json({ success: true, coins: newBalance });
}
