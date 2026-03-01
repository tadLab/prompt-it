# Prompt It — Deployment Polish Design

**Date:** 2026-03-01
**Approach:** Systematic Full Pass (Layer by layer)
**Target:** Vercel deployment, public launch

---

## Layer 1: Infrastructure & Security

### 1.1 Stripe Webhook Race Condition
- Current: read-then-write for coin balance — two concurrent payments can lose coins
- Fix: Supabase RPC function `increment_coins(user_id, amount)` using atomic `UPDATE profiles SET coins = coins + $1 WHERE id = $2`

### 1.2 Environment Variable Validation
- Current: no validation — app silently breaks with missing env vars
- Fix: `lib/env.ts` that validates all required env vars at import time, throws clear errors

### 1.3 Error Pages
- Current: no `error.tsx`, `not-found.tsx`, or `global-error.tsx`
- Fix: styled error pages matching the dark green theme

### 1.4 Hydration Mismatch Fix
- Current: `pricing/page.tsx` uses `typeof window !== "undefined"` in JSX render
- Fix: `useEffect` + state pattern to avoid server/client mismatch

### 1.5 Security Headers
- Current: `next.config.ts` is empty
- Fix: add security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy), configure `images.remotePatterns` for Google avatar URLs

### 1.6 API Input Validation
- Current: generate endpoint trusts all input without limits
- Fix: input length limits and basic sanitization

---

## Layer 2: Missing Features

### 2.1 Sign-up Bonus (+3 coins)
- Create `profiles` row with `coins: 3` on first sign-in
- Handle in `/auth/callback` route

### 2.2 Referral System (+5 coins each)
- Store `ref` param in cookie on landing
- On sign-up: credit referrer and new user +5 coins each
- New `referrals` table: `id`, `referrer_id`, `referred_id`, `created_at`
- Show referral stats on pricing page for logged-in users

### 2.3 Prompt Rating System (+1 coin)
- Thumbs up/down UI on result page
- New `ratings` table: `id`, `user_id`, `generation_id`, `rating`, `created_at`
- +1 coin on first rating per generation
- Pass `generation_id` from API through to result page

### 2.4 Database Schema Changes
- `referrals` table
- `ratings` table
- `increment_coins` RPC function
- Update `generations` insert to return row ID

---

## Layer 3: UI/UX Polish

### 3.1 Mobile Responsive Header
- Hamburger menu for mobile viewports
- Full-height overlay with nav links, user info, coin balance
- Desktop stays as-is

### 3.2 Payment Success/Cancel Feedback
- Toast notifications reading URL params after Stripe checkout
- Clean URL after showing toast

### 3.3 Loading & Error States
- Loading skeletons for pricing page auth state
- Proper error state on loading page with retry button
- Handle blank result page redirect gracefully

### 3.4 Builder UX Improvements
- Thin progress bar at top
- Slide/fade transitions between steps
- Consistent auto-focus on textarea

### 3.5 Accessibility Pass
- `aria-labels` on icon-only buttons
- Focus management on overlays
- Color contrast check for muted text
- Per-page `<title>` via Next.js metadata

### 3.6 Visual Consistency
- Unify header into single component with `compact` variant for builder
- Standardize `glass-card` vs `glass-card-bright` usage

---

## Layer 4: SEO & Marketing

### 4.1 Favicon & App Icons
- Minimal favicon (green logo mark)
- `apple-touch-icon`, `favicon.ico`, web manifest

### 4.2 Open Graph & Social Meta Tags
- OG image (1200x630 card)
- `og:title`, `og:description`, `og:image`, `twitter:card`
- Per-page metadata for builder, pricing, example pages

### 4.3 Sitemap & Robots
- `app/sitemap.ts` and `app/robots.ts`
- Include public pages, exclude auth/API routes

### 4.4 Analytics
- Vercel Analytics (`@vercel/analytics`)
- One import in root layout

### 4.5 Landing Page Copy Polish
- "How it works" section (3 steps: describe, generate, use)
- More prominent model compatibility display
- Tighten CTA copy

### 4.6 Legal Pages
- `/terms` and `/privacy` pages with standard SaaS content
- Link from footer and login page
