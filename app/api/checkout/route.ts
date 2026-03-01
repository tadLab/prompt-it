import { createClient, createServiceClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { NextRequest, NextResponse } from "next/server";

const PACKS: Record<string, { priceEnv: string; coins: number }> = {
  starter: { priceEnv: "STRIPE_PRICE_STARTER", coins: 30 },
  pro: { priceEnv: "STRIPE_PRICE_PRO", coins: 80 },
  power: { priceEnv: "STRIPE_PRICE_POWER", coins: 200 },
};

export async function POST(req: NextRequest) {
  const { packId } = await req.json();
  const pack = PACKS[packId];

  if (!pack) {
    return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
  }

  const priceId = env[pack.priceEnv as keyof typeof env];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const serviceClient = createServiceClient();
  const { data: profile } = await serviceClient
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    await serviceClient
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const appUrl = env.NEXT_PUBLIC_APP_URL;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/builder?payment=success`,
    cancel_url: `${appUrl}/pricing?payment=cancelled`,
    metadata: {
      supabase_user_id: user.id,
      coin_amount: String(pack.coins),
    },
  });

  return NextResponse.json({ url: session.url });
}
