import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") || "/builder";

  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    if (data.user) {
      const serviceClient = createServiceClient();

      // Check if profile exists (new user or returning)
      const { data: existingProfile } = await serviceClient
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (!existingProfile) {
        // New user — create profile with 3 bonus coins
        const referralCode = data.user.id.slice(0, 8);
        await serviceClient.from("profiles").insert({
          id: data.user.id,
          coins: 3,
          referral_code: referralCode,
        });

        // Check for referral cookie
        const refCode = request.cookies.get("prompt-it-ref")?.value;
        if (refCode) {
          // Find referrer by referral_code
          const { data: referrer } = await serviceClient
            .from("profiles")
            .select("id")
            .eq("referral_code", refCode)
            .single();

          if (referrer && referrer.id !== data.user.id) {
            // Credit both users +5 coins
            await serviceClient.rpc("increment_coins", {
              user_id: referrer.id,
              amount: 5,
            });
            await serviceClient.rpc("increment_coins", {
              user_id: data.user.id,
              amount: 5,
            });

            // Record referral
            await serviceClient.from("referrals").insert({
              referrer_id: referrer.id,
              referred_id: data.user.id,
            });
          }
        }
      }
    }
  }

  // Clear referral cookie after processing
  const response = NextResponse.redirect(new URL(redirect, request.url));
  response.cookies.delete("prompt-it-ref");
  return response;
}
