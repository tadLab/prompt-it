import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.supabase_user_id;
    const coinAmount = parseInt(session.metadata?.coin_amount || "0", 10);

    if (userId && coinAmount > 0) {
      await supabase.rpc("increment_coins", {
        user_id: userId,
        amount: coinAmount,
      });
    }
  }

  return NextResponse.json({ received: true });
}
