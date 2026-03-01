# Deployment Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Polish Prompt It for production deployment on Vercel — fix bugs, build missing features, improve UI/UX, and add SEO/marketing essentials.

**Architecture:** Systematic four-layer approach: infrastructure/security first, then missing features (referrals, ratings, sign-up bonus), then UI/UX polish (mobile header, toasts, loading states), then SEO/marketing (meta tags, sitemap, analytics, legal pages). Each layer builds on the previous.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Supabase (auth + DB), Stripe, Anthropic Claude API, Vercel Analytics.

---

## Layer 1: Infrastructure & Security

### Task 1: Atomic Coin Increment (Stripe Race Condition Fix)

**Files:**
- Create: `supabase/migrations/001_increment_coins.sql` (SQL to run in Supabase dashboard)
- Modify: `app/api/webhooks/stripe/route.ts`
- Modify: `app/api/generate/route.ts`

**Step 1: Create the RPC function SQL**

Create `supabase/migrations/001_increment_coins.sql`:

```sql
-- Run this in Supabase SQL Editor
CREATE OR REPLACE FUNCTION increment_coins(user_id UUID, amount INT)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  new_balance INT;
BEGIN
  UPDATE profiles
  SET coins = coins + amount, updated_at = NOW()
  WHERE id = user_id
  RETURNING coins INTO new_balance;
  RETURN new_balance;
END;
$$;
```

**Step 2: Update the Stripe webhook to use atomic increment**

In `app/api/webhooks/stripe/route.ts`, replace the read-then-write block (lines 36-48) with:

```typescript
if (userId && coinAmount > 0) {
  await supabase.rpc("increment_coins", {
    user_id: userId,
    amount: coinAmount,
  });
}
```

**Step 3: Update generate route to use atomic decrement**

In `app/api/generate/route.ts`, replace the coin deduction block (lines 146-153) with:

```typescript
let remainingCoins = userCoins;
if (user) {
  const { data } = await serviceClient.rpc("increment_coins", {
    user_id: user.id,
    amount: -1,
  });
  remainingCoins = data ?? userCoins - 1;
}
```

**Step 4: Commit**

```bash
git add supabase/ app/api/webhooks/stripe/route.ts app/api/generate/route.ts
git commit -m "fix: use atomic coin increment to prevent race conditions"
```

---

### Task 2: Environment Variable Validation

**Files:**
- Create: `lib/env.ts`

**Step 1: Create env validation module**

Create `lib/env.ts`:

```typescript
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Check your .env.local file or Vercel environment settings.`
    );
  }
  return value;
}

// Server-only env vars (validated on first use)
export const env = {
  get ANTHROPIC_API_KEY() { return requireEnv("ANTHROPIC_API_KEY"); },
  get SUPABASE_SERVICE_ROLE_KEY() { return requireEnv("SUPABASE_SERVICE_ROLE_KEY"); },
  get STRIPE_SECRET_KEY() { return requireEnv("STRIPE_SECRET_KEY"); },
  get STRIPE_WEBHOOK_SECRET() { return requireEnv("STRIPE_WEBHOOK_SECRET"); },
  get STRIPE_PRICE_STARTER() { return requireEnv("STRIPE_PRICE_STARTER"); },
  get STRIPE_PRICE_PRO() { return requireEnv("STRIPE_PRICE_PRO"); },
  get STRIPE_PRICE_POWER() { return requireEnv("STRIPE_PRICE_POWER"); },
  // Public vars (available at build time)
  get NEXT_PUBLIC_SUPABASE_URL() { return requireEnv("NEXT_PUBLIC_SUPABASE_URL"); },
  get NEXT_PUBLIC_SUPABASE_ANON_KEY() { return requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"); },
  get NEXT_PUBLIC_APP_URL() { return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"; },
};
```

**Step 2: Update consumers to use `env`**

Update `lib/stripe.ts`:
```typescript
import { env } from "@/lib/env";
import Stripe from "stripe";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  typescript: true,
});
```

Update `lib/supabase/server.ts` — replace the `!` assertions with `env` imports for `SUPABASE_SERVICE_ROLE_KEY`.

Update `app/api/checkout/route.ts` — replace `process.env[pack.priceEnv]` with `env[pack.priceEnv as keyof typeof env]`.

Update `app/api/generate/route.ts` — replace `process.env.ANTHROPIC_API_KEY` with `env.ANTHROPIC_API_KEY`.

**Step 3: Commit**

```bash
git add lib/env.ts lib/stripe.ts lib/supabase/server.ts app/api/checkout/route.ts app/api/generate/route.ts
git commit -m "feat: add environment variable validation"
```

---

### Task 3: Error Pages

**Files:**
- Create: `app/not-found.tsx`
- Create: `app/error.tsx`
- Create: `app/global-error.tsx`

**Step 1: Create not-found page**

Create `app/not-found.tsx`:

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-gradient-main flex flex-col min-h-screen items-center justify-center px-6">
      <h1 className="text-6xl font-bold text-emerald-400 mb-4">404</h1>
      <p className="text-xl font-semibold mb-2">Page not found</p>
      <p className="text-white/50 mb-8">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/" className="btn-primary">
        Back to home
      </Link>
    </div>
  );
}
```

**Step 2: Create error page**

Create `app/error.tsx`:

```tsx
"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="bg-gradient-main flex flex-col min-h-screen items-center justify-center px-6">
      <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
      <p className="text-white/50 mb-8">
        An unexpected error occurred. Please try again.
      </p>
      <button onClick={reset} className="btn-primary">
        Try again
      </button>
    </div>
  );
}
```

**Step 3: Create global-error page**

Create `app/global-error.tsx`:

```tsx
"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ background: "#0a1a14", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "system-ui" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Something went wrong</h1>
          <button onClick={reset} style={{ background: "#34d399", color: "#000", padding: "12px 24px", borderRadius: "12px", border: "none", fontWeight: 600, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
```

**Step 4: Commit**

```bash
git add app/not-found.tsx app/error.tsx app/global-error.tsx
git commit -m "feat: add styled error pages (404, error, global-error)"
```

---

### Task 4: Hydration Mismatch Fix

**Files:**
- Modify: `app/pricing/page.tsx`

**Step 1: Fix the referral link rendering**

In `app/pricing/page.tsx`, the referral link section (lines 169-184) uses `typeof window !== "undefined"` in JSX which causes hydration mismatch.

Replace lines 169-184 with a component that uses `useEffect`:

Add a state at the top of `PricingPage`:
```typescript
const [referralLink, setReferralLink] = useState("");

useEffect(() => {
  if (user) {
    setReferralLink(`${window.location.origin}/?ref=${user.id?.slice(0, 8)}`);
  }
}, [user]);
```

Then replace the referral link div:
```tsx
<div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 truncate">
  {referralLink}
</div>
<button
  onClick={() => navigator.clipboard.writeText(referralLink)}
  className="bg-white/10 hover:bg-white/15 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors shrink-0"
>
  Copy
</button>
```

**Step 2: Commit**

```bash
git add app/pricing/page.tsx
git commit -m "fix: resolve hydration mismatch in pricing page referral link"
```

---

### Task 5: Security Headers & Next.js Config

**Files:**
- Modify: `next.config.ts`

**Step 1: Add security headers and image config**

Replace `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

**Step 2: Commit**

```bash
git add next.config.ts
git commit -m "feat: add security headers and Google avatar image config"
```

---

### Task 6: API Input Validation

**Files:**
- Modify: `app/api/generate/route.ts`

**Step 1: Add input validation at the top of the POST handler**

After `const { task, context, output, preferences, role } = body;` add:

```typescript
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
```

**Step 2: Commit**

```bash
git add app/api/generate/route.ts
git commit -m "feat: add input length validation to generate API"
```

---

## Layer 2: Missing Features

### Task 7: Database Schema for New Features

**Files:**
- Create: `supabase/migrations/002_referrals_ratings.sql`

**Step 1: Create migration SQL**

Create `supabase/migrations/002_referrals_ratings.sql`:

```sql
-- Run this in Supabase SQL Editor

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES auth.users(id) NOT NULL,
  referred_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referred_id)  -- Each user can only be referred once
);

-- Ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  generation_id UUID NOT NULL,
  rating TEXT CHECK (rating IN ('up', 'down')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, generation_id)  -- One rating per generation per user
);

-- Add referral_code column to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- RLS policies (service role bypasses, so these are for client access)
CREATE POLICY "Users can read own referrals" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can read own ratings" ON ratings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ratings" ON ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update generations table to return id
-- (it likely already has an id column, but ensure it does)
ALTER TABLE generations ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
```

**Step 2: Commit**

```bash
git add supabase/migrations/002_referrals_ratings.sql
git commit -m "feat: add referrals and ratings database schema"
```

---

### Task 8: Sign-up Bonus (+3 coins)

**Files:**
- Modify: `app/auth/callback/route.ts`

**Step 1: Update auth callback to create profile with bonus coins**

Replace `app/auth/callback/route.ts`:

```typescript
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
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
```

**Step 2: Commit**

```bash
git add app/auth/callback/route.ts
git commit -m "feat: add sign-up bonus (3 coins) and referral processing on auth callback"
```

---

### Task 9: Referral Link Tracking

**Files:**
- Modify: `middleware.ts`
- Modify: `app/pricing/page.tsx`

**Step 1: Capture ref param in middleware**

In `middleware.ts`, after `await supabase.auth.getUser();` add:

```typescript
// Capture referral code from URL into cookie
const refCode = request.nextUrl.searchParams.get("ref");
if (refCode && !request.cookies.get("prompt-it-ref")) {
  supabaseResponse.cookies.set("prompt-it-ref", refCode, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}
```

**Step 2: Add referral stats to pricing page**

In `app/pricing/page.tsx`, add an API call or inline query to show referral count for logged-in users. For now, update the referral link section to use `user.id?.slice(0, 8)` as the referral code (already done, just needs the hydration fix from Task 4).

**Step 3: Commit**

```bash
git add middleware.ts app/pricing/page.tsx
git commit -m "feat: track referral codes via cookie in middleware"
```

---

### Task 10: Prompt Rating System

**Files:**
- Modify: `app/hooks/usePromptStore.ts` (update PromptResult type)
- Modify: `app/api/generate/route.ts` (return generation_id)
- Create: `app/api/rate/route.ts`
- Modify: `app/result/page.tsx` (add rating UI)

**Step 1: Update PromptResult type to include generation_id**

In `app/hooks/usePromptStore.ts`, update the interface:

```typescript
export interface PromptResult {
  prompt: string;
  recommendedModel: string;
  whyThisModel: string;
  alternatives: string[];
  generationId?: string;  // Added for rating system
}
```

**Step 2: Return generation_id from the generate API**

In `app/api/generate/route.ts`, update the generations insert to return the id:

```typescript
const { data: generation } = await serviceClient
  .from("generations")
  .insert({
    user_id: user?.id || null,
    anonymous_id: user ? null : anonymousId,
  })
  .select("id")
  .single();
```

And include it in the response:

```typescript
return NextResponse.json({
  prompt: parsed.prompt,
  recommendedModel: parsed.recommendedModel,
  whyThisModel: parsed.whyThisModel,
  alternatives: parsed.alternatives,
  remainingCoins,
  generationId: generation?.id,
});
```

**Step 3: Create rating API endpoint**

Create `app/api/rate/route.ts`:

```typescript
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
```

**Step 4: Add rating UI to result page**

In `app/result/page.tsx`, add rating buttons below the action buttons. Add state:

```typescript
const [rated, setRated] = useState(false);
const [ratingLoading, setRatingLoading] = useState(false);
```

Add the rating component after the actions div (after line 96):

```tsx
{/* Rating */}
{result.generationId && !rated && (
  <div className="glass-card p-5 mb-10 text-center">
    <p className="text-sm font-medium mb-3">How was this prompt?</p>
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={() => handleRate("up")}
        disabled={ratingLoading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-400/10 border border-emerald-400/20 hover:bg-emerald-400/20 transition-colors text-sm"
      >
        <span>👍</span> Useful
      </button>
      <button
        onClick={() => handleRate("down")}
        disabled={ratingLoading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm"
      >
        <span>👎</span> Not great
      </button>
    </div>
    <p className="text-white/30 text-xs mt-2">Rate to earn +1 coin</p>
  </div>
)}
{rated && (
  <div className="glass-card p-5 mb-10 text-center">
    <p className="text-emerald-400 text-sm font-medium">Thanks for rating! +1 coin earned</p>
  </div>
)}
```

Add the handler:

```typescript
const handleRate = async (rating: "up" | "down") => {
  if (!result?.generationId) return;
  setRatingLoading(true);
  try {
    const res = await fetch("/api/rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ generationId: result.generationId, rating }),
    });
    if (res.ok) {
      setRated(true);
    }
  } catch {
    // Silently fail — non-critical feature
  } finally {
    setRatingLoading(false);
  }
};
```

**Step 5: Commit**

```bash
git add app/hooks/usePromptStore.ts app/api/generate/route.ts app/api/rate/route.ts app/result/page.tsx
git commit -m "feat: add prompt rating system with +1 coin reward"
```

---

## Layer 3: UI/UX Polish

### Task 11: Mobile Responsive Header

**Files:**
- Modify: `app/components/Header.tsx`

**Step 1: Add hamburger menu for mobile**

Rewrite `app/components/Header.tsx` to include:
- A hamburger button visible only on `md:hidden`
- A full-screen overlay menu on mobile
- Desktop nav stays unchanged (hidden on mobile with `hidden md:flex`)
- The overlay includes all nav links, coin balance, and sign in/out

Key structure:

```tsx
const [menuOpen, setMenuOpen] = useState(false);

return (
  <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between">
    <Link href="/" className="text-gradient-green text-xl font-bold tracking-tight">
      prompt it
    </Link>

    {/* Desktop nav */}
    <nav className="hidden md:flex items-center gap-6">
      {/* ...existing nav items... */}
    </nav>

    {/* Mobile hamburger */}
    <button
      onClick={() => setMenuOpen(!menuOpen)}
      className="md:hidden text-white/60 hover:text-white"
      aria-label="Toggle menu"
    >
      {menuOpen ? "✕" : "☰"}
    </button>

    {/* Mobile overlay */}
    {menuOpen && (
      <div className="fixed inset-0 z-40 bg-[#0a1a14]/95 backdrop-blur-sm flex flex-col items-center justify-center gap-6 md:hidden">
        {/* Nav links with onClick={() => setMenuOpen(false)} */}
      </div>
    )}
  </header>
);
```

**Step 2: Commit**

```bash
git add app/components/Header.tsx
git commit -m "feat: add mobile responsive hamburger menu to header"
```

---

### Task 12: Toast Notification Component & Payment Feedback

**Files:**
- Create: `app/components/Toast.tsx`
- Modify: `app/builder/page.tsx` (show payment success toast)
- Modify: `app/pricing/page.tsx` (show payment cancel toast)

**Step 1: Create Toast component**

Create `app/components/Toast.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export function usePaymentToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") {
      setToast({ message: "Coins added to your account!", type: "success" });
    } else if (payment === "cancelled") {
      setToast({ message: "Payment cancelled.", type: "error" });
    }

    if (payment) {
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      router.replace(url.pathname, { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return toast;
}

export default function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg text-sm font-medium shadow-lg fade-in ${
        type === "success"
          ? "bg-emerald-400 text-black"
          : "bg-white/10 text-white border border-white/20"
      }`}
    >
      {message}
    </div>
  );
}
```

**Step 2: Add toast to builder and pricing pages**

In both `app/builder/page.tsx` and `app/pricing/page.tsx`, import and use:

```tsx
import Toast, { usePaymentToast } from "../components/Toast";

// Inside component:
const toast = usePaymentToast();

// In JSX, before closing </div>:
{toast && <Toast message={toast.message} type={toast.type} />}
```

Wrap the component body in `<Suspense>` since `useSearchParams()` requires it.

**Step 3: Commit**

```bash
git add app/components/Toast.tsx app/builder/page.tsx app/pricing/page.tsx
git commit -m "feat: add toast notifications for payment success/cancel"
```

---

### Task 13: Loading & Error States

**Files:**
- Modify: `app/loading-prompt/page.tsx`
- Modify: `app/pricing/page.tsx`

**Step 1: Add error state to loading page**

In `app/loading-prompt/page.tsx`, add error state:

```typescript
const [error, setError] = useState(false);
```

In the catch block, instead of silently falling back, set the error:

```typescript
catch (error) {
  console.error("Generation error:", error);
  setError(true);
}
```

Add error UI in the JSX (replace or supplement the current loading view):

```tsx
{error && (
  <div className="text-center mt-8 fade-in">
    <p className="text-red-400 text-sm mb-4">Something went wrong generating your prompt.</p>
    <button onClick={() => window.location.reload()} className="btn-secondary text-sm">
      Try again
    </button>
  </div>
)}
```

**Step 2: Add loading skeleton to pricing page**

In `app/pricing/page.tsx`, when `isLoading` is true, show a subtle skeleton pulse on the coin balance line instead of nothing.

**Step 3: Commit**

```bash
git add app/loading-prompt/page.tsx app/pricing/page.tsx
git commit -m "feat: add error state to loading page and skeleton to pricing"
```

---

### Task 14: Builder UX Improvements

**Files:**
- Modify: `app/builder/page.tsx`

**Step 1: Add progress bar**

Add a thin green bar at the very top of the page:

```tsx
<div className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-50">
  <div
    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500 ease-out"
    style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
  />
</div>
```

**Step 2: Add step transition animation**

Wrap the wizard content in a div with a key that changes per step, triggering the `fade-in` animation:

```tsx
<div key={step} className="fade-in w-full max-w-xl mx-auto">
  {/* existing step content */}
</div>
```

**Step 3: Commit**

```bash
git add app/builder/page.tsx
git commit -m "feat: add progress bar and step transitions to builder"
```

---

### Task 15: Accessibility Pass

**Files:**
- Modify: `app/builder/page.tsx` (aria-label on back button)
- Modify: `app/result/page.tsx` (aria-labels on copy/edit)
- Modify: `app/history/page.tsx` (aria-labels on action buttons)
- Modify: `app/layout.tsx` (add per-page metadata pattern)

**Step 1: Add aria-labels to icon-only buttons**

Builder back button:
```tsx
<button onClick={goBack} aria-label="Go to previous step" className="...">←</button>
```

Result page copy button:
```tsx
<button onClick={handleCopy} aria-label="Copy prompt to clipboard" className="...">
```

**Step 2: Add per-page metadata**

Add `metadata` exports to pages that don't have them:

```typescript
// app/builder/page.tsx — can't use metadata export in client components
// Instead, add via layout or generateMetadata in a layout.tsx for /builder

// For server-rendered pages, add:
export const metadata = {
  title: "Build Your Prompt | prompt it",
  description: "Create structured AI prompts step by step.",
};
```

Since `builder/page.tsx` is a client component, create `app/builder/layout.tsx`:

```tsx
export const metadata = {
  title: "Build Your Prompt | prompt it",
  description: "Create structured AI prompts with our step-by-step wizard.",
};

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

Repeat for `/pricing`, `/history`, `/example`, `/result`.

**Step 3: Commit**

```bash
git add app/builder/ app/result/page.tsx app/history/page.tsx app/pricing/ app/example/
git commit -m "feat: add aria-labels and per-page metadata for accessibility"
```

---

### Task 16: Visual Consistency — Unified Header

**Files:**
- Modify: `app/components/Header.tsx` (add compact mode)
- Modify: `app/builder/page.tsx` (use Header instead of inline header)

**Step 1: Add compact prop to Header**

Add a `compact` prop to Header that renders a simpler version for the builder:

```tsx
export default function Header({ compact = false }: { compact?: boolean }) {
```

When `compact` is true, render the builder-style header (logo + step counter + history). Remove the `if (isBuilder) return null;` check. The builder page then uses `<Header compact />`.

**Step 2: Update builder page**

Replace the inline `<header>` in `app/builder/page.tsx` with `<Header compact />` and pass step info via props or context.

Actually, simpler: keep the builder's custom header as-is but extract it into Header as a variant. The key change is removing `if (isBuilder) return null;` and instead letting the builder pass `compact`.

**Step 3: Commit**

```bash
git add app/components/Header.tsx app/builder/page.tsx
git commit -m "refactor: unify header with compact variant for builder"
```

---

## Layer 4: SEO & Marketing

### Task 17: Favicon & App Icons

**Files:**
- Create: `app/favicon.ico` (or `app/icon.tsx` using Next.js image generation)
- Create: `app/apple-icon.tsx`
- Create: `app/manifest.ts`

**Step 1: Create dynamic favicon using Next.js ImageResponse**

Create `app/icon.tsx`:

```tsx
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ fontSize: 24, background: "#0a1a14", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#34d399", fontWeight: 700, borderRadius: "6px" }}>
        P
      </div>
    ),
    { ...size }
  );
}
```

Create `app/apple-icon.tsx` — same but 180x180.

Create `app/manifest.ts`:

```typescript
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "prompt it",
    short_name: "prompt it",
    description: "Build better prompts. Get better AI results.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a1a14",
    theme_color: "#34d399",
  };
}
```

**Step 2: Commit**

```bash
git add app/icon.tsx app/apple-icon.tsx app/manifest.ts
git commit -m "feat: add favicon, apple icon, and web manifest"
```

---

### Task 18: Open Graph & Social Meta Tags

**Files:**
- Create: `app/opengraph-image.tsx`
- Modify: `app/layout.tsx` (enhance metadata)

**Step 1: Create OG image using Next.js ImageResponse**

Create `app/opengraph-image.tsx`:

```tsx
import { ImageResponse } from "next/og";

export const alt = "prompt it — Build better prompts";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div style={{ background: "linear-gradient(135deg, #0a1a14, #0d3d2e)", width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "system-ui" }}>
        <div style={{ fontSize: 64, fontWeight: 700, color: "#34d399", marginBottom: 16 }}>
          prompt it
        </div>
        <div style={{ fontSize: 32, color: "rgba(255,255,255,0.8)", marginBottom: 8 }}>
          Build better prompts. Get better AI results.
        </div>
        <div style={{ fontSize: 20, color: "rgba(255,255,255,0.4)" }}>
          Works with ChatGPT, Claude, Gemini and more
        </div>
      </div>
    ),
    { ...size }
  );
}
```

**Step 2: Enhance root layout metadata**

In `app/layout.tsx`, update metadata:

```typescript
export const metadata: Metadata = {
  title: {
    default: "prompt it — Build better prompts. Get better AI results.",
    template: "%s | prompt it",
  },
  description:
    "Engineer prompts that AI actually understands. We turn your idea into a structured prompt and recommend the best AI model for it.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://promptit.app"),
  openGraph: {
    title: "prompt it — Build better prompts. Get better AI results.",
    description: "Engineer prompts that AI actually understands.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "prompt it — Build better prompts. Get better AI results.",
    description: "Engineer prompts that AI actually understands.",
  },
};
```

**Step 3: Commit**

```bash
git add app/opengraph-image.tsx app/layout.tsx
git commit -m "feat: add OG image and social meta tags"
```

---

### Task 19: Sitemap & Robots

**Files:**
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`

**Step 1: Create sitemap**

Create `app/sitemap.ts`:

```typescript
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://promptit.app";

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/builder`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/example`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}
```

**Step 2: Create robots.txt**

Create `app/robots.ts`:

```typescript
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://promptit.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/", "/login", "/loading-prompt"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

**Step 3: Commit**

```bash
git add app/sitemap.ts app/robots.ts
git commit -m "feat: add sitemap.xml and robots.txt"
```

---

### Task 20: Vercel Analytics

**Files:**
- Modify: `package.json` (add dependency)
- Modify: `app/layout.tsx` (add Analytics component)

**Step 1: Install Vercel Analytics**

```bash
npm install @vercel/analytics
```

**Step 2: Add to root layout**

In `app/layout.tsx`, add:

```tsx
import { Analytics } from "@vercel/analytics/react";

// Inside <body>, after {children}:
<Analytics />
```

**Step 3: Commit**

```bash
git add package.json package-lock.json app/layout.tsx
git commit -m "feat: add Vercel Analytics"
```

---

### Task 21: Landing Page Polish

**Files:**
- Modify: `app/page.tsx`

**Step 1: Add "How it works" section**

After the CTA buttons and before the "Works with..." line, add a 3-step section:

```tsx
{/* How it works */}
<div className="grid grid-cols-3 gap-6 mt-16 mb-8 max-w-lg mx-auto">
  {[
    { step: "1", label: "Describe", desc: "Tell us what you need" },
    { step: "2", label: "Generate", desc: "AI builds your prompt" },
    { step: "3", label: "Use", desc: "Copy & paste into any AI" },
  ].map((item) => (
    <div key={item.step} className="text-center">
      <div className="w-10 h-10 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-2 text-emerald-400 text-sm font-bold">
        {item.step}
      </div>
      <p className="text-sm font-medium">{item.label}</p>
      <p className="text-white/40 text-xs">{item.desc}</p>
    </div>
  ))}
</div>
```

**Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add 'How it works' section to landing page"
```

---

### Task 22: Legal Pages

**Files:**
- Create: `app/terms/page.tsx`
- Create: `app/privacy/page.tsx`
- Modify: `app/components/Footer.tsx` (add links)
- Modify: `app/(auth)/login/page.tsx` (link to terms)

**Step 1: Create terms page**

Create `app/terms/page.tsx` with standard SaaS terms covering: service description, user accounts, payments/refunds, acceptable use, intellectual property, limitation of liability, termination.

**Step 2: Create privacy page**

Create `app/privacy/page.tsx` with standard privacy policy covering: data collected, how it's used, third parties (Supabase, Stripe, Anthropic, Vercel), cookies, user rights, contact info.

Both pages should use the same layout pattern: `bg-gradient-main`, `<Header />`, prose content in a `max-w-3xl` container, `<Footer />`.

**Step 3: Update footer**

In `app/components/Footer.tsx`, add links to Terms and Privacy:

```tsx
<footer className="border-t border-white/5 px-6 py-4 flex items-center justify-between">
  <div className="text-sm text-white/40">
    Made with ✨ by{" "}
    <Link href="https://tadeasn.com" target="_blank" className="text-emerald-400 hover:text-emerald-300 transition-colors">
      Tade
    </Link>
  </div>
  <div className="flex items-center gap-4">
    <Link href="/terms" className="text-sm text-white/40 hover:text-white/60 transition-colors">
      Terms
    </Link>
    <Link href="/privacy" className="text-sm text-white/40 hover:text-white/60 transition-colors">
      Privacy
    </Link>
  </div>
</footer>
```

**Step 4: Update login page link**

In `app/(auth)/login/page.tsx`, make "Terms of Service" a link:

```tsx
<p className="text-white/30 text-xs mt-6">
  By signing in, you agree to our{" "}
  <Link href="/terms" className="underline hover:text-white/50">Terms of Service</Link>
  {" "}and{" "}
  <Link href="/privacy" className="underline hover:text-white/50">Privacy Policy</Link>.
</p>
```

**Step 5: Commit**

```bash
git add app/terms/ app/privacy/ app/components/Footer.tsx app/(auth)/login/page.tsx
git commit -m "feat: add Terms of Service and Privacy Policy pages"
```

---

### Task 23: Final Build Verification

**Step 1: Run build**

```bash
npm run build
```

Expected: Clean build with no errors.

**Step 2: Fix any build errors**

Address TypeScript errors, missing imports, or other issues found during build.

**Step 3: Run locally and smoke test**

```bash
npm run dev
```

Test each page: `/`, `/builder` (go through all 5 steps), `/loading-prompt`, `/result`, `/history`, `/pricing`, `/example`, `/login`, `/terms`, `/privacy`, `/not-a-real-page` (404).

Test mobile: resize browser to 375px width, verify hamburger menu works.

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: build verification and final fixes"
```

---

## Summary

| Layer | Tasks | Focus |
|-------|-------|-------|
| 1: Infrastructure | Tasks 1-6 | Race condition, env validation, error pages, security |
| 2: Features | Tasks 7-10 | DB schema, sign-up bonus, referrals, ratings |
| 3: UI/UX | Tasks 11-16 | Mobile header, toasts, loading states, accessibility |
| 4: SEO/Marketing | Tasks 17-23 | Favicon, OG image, sitemap, analytics, legal pages |

**Total: 23 tasks, ~23 commits**
