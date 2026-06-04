# Prompt It — Level-Up Plan

> Created 2026-06-03. Goal: take the existing free, no-auth prompt generator from
> "works" to "feels like a real product." Sequenced so the **core** (prompt
> quality + how it feels) lands first, with a fast cleanup pass up front.

**Current stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind 4 ·
Anthropic Claude API · Vercel Analytics. No auth, no DB (history is `localStorage`,
wizard state is `sessionStorage`).

**Current flow:** `/builder` (5-step wizard) → `/loading-prompt` (spinner that
POSTs to `/api/generate`) → `/result` (prompt + model recommendation, manual edit,
copy).

---

## Competitive positioning (analysis 2026-06-03)

Market is **crowded with free "paste → structured prompt" tools** (ImprovePrompt,
Gud Prompt, PromptOptimizer, Smart Prompt Generator). Differentiation is hard
because they all do the same thing. PromptPerfect (the best-known) shuts down
Sept 2026 → opening.

**The moat is the *combination* of four things, which no single competitor has:**
1. **Adaptive intake** (Phase 1.0) — the tool asks back instead of a static form.
   The crowd is all static "paste → prompt"; asking back is what attacks
   underspecification, the #1 prompting failure mode.
2. **Model matching** (already shipped) — recommends *which* AI to use. **Unique
   on the market.** Emphasize it more, don't bury it.
3. **Open in AI** (✅ shipped 3.3) — one click into ChatGPT/Claude/Gemini with the
   prompt loaded. Only Promptly (a Chrome extension) does zero-copy today.
4. **Czech-first, bilingual output** (analysis 2026-06-03) — **zero competition.**
   Every tool found is English-only; a Czech prompt optimizer does not exist.
   CZ+SK ≈ 16M people, ~0.5–1M active AI users, with easier marketing (Czech SEO,
   Czech communities, no rivals). The killer framing: *"piš česky, my ti dáme
   optimální anglický prompt"* — solving two problems at once: (a) people can't
   prompt, (b) people don't know English prompts perform better. **Don't go
   Czech-only** — keep an English version alongside (near-zero extra work, no
   growth ceiling). Czech is the beachhead, not the cage.

Together: *describe (in Czech) → get prompt → told which model → one click into it,
in optimal English.* A complete zero-friction flow for a beginner. **Guard the low
barrier** — describe → generate → copy must always stay one frictionless path.

**Defensibility note (risk: models get better at vague prompts).** Structuring
prompts is *not* a durable moat — frontier models will absorb it. The durable
edges are **workflow** (Open in AI, future extension), **niche** (Czech), and
**convenience/speed** — not the structuring itself. Prioritize accordingly.

**Competitive gaps to close (folded into phases below):**
- [ ] **C1 Before/after proof — MUST-HAVE BEFORE LAUNCH (was Phase 4, now elevated).**
      Show a weak prompt vs. our enriched result (+ a screenshot of the better AI
      output). This single feature answers **three** separately-raised pain points:
      "verified framework" sounds like empty marketing without proof, there's no
      social proof, and "showing the output difference is the strongest marketing."
      One artifact, three holes closed. → landing page + maybe inline on `/result`.
- [ ] **C2 Prompt counter** — "X prompts optimized" social proof. → Phase 4.
- [ ] **C3 Templates (10–20)** — email-to-boss, blog post, IG caption, code review,
      etc., to lower the entry barrier. → Phase 3.1 (raise priority).
- [ ] **C4 "Why we added this" tooltips** — light education per section (ImprovePrompt's
      edge is teaching *why*; match it cheaply without a course). → Phase 3.
- [ ] **C5 Iterate / "edit & regenerate"** — already planned as the refine loop (1.4).
- [ ] **C6 (Growth bet) Chrome extension** — zero copy/paste, runs inside the AI
      tools. The Promptly model. Largest effort; revisit after the web core is strong.
- [ ] **C7 Czech UI + go-to-market** — localize UI copy (CS/EN toggle or CS default),
      Czech SEO ("jak napsat lepší prompt" — nobody optimizes for it), Czech socials
      & communities. Pairs with **1.1b** (bilingual output). Low effort, owns a niche.

---

## Phase 0 — Cleanup & foundation (fast, unblocks everything)

Clears debris from the Stripe/Firebase eras so the codebase tells the truth.

- [x] **0.1** Delete `firebase-debug.log` (committed, 17 KB) and add `*-debug.log` to `.gitignore`. ✅
- [x] **0.2** Delete `preview-signed-in.html` (stale auth-era artifact). ✅
- [x] **0.3** Archive the stale `docs/plans/2026-03-01-deployment-polish-*.md` → moved to `docs/plans/archive/`. ✅
- [x] **0.4** Add a real `README.md`. ✅
- [x] **0.5** Bump `@anthropic-ai/sdk` `0.39.0 → 0.100.1`; also `npm audit fix` cleared the critical (vitest) + high (next→15.5.19) vulns. ✅
- [x] **0.6** `npm run build` + `tsc --noEmit` + `npm test` (17/17) all green after the bump. ✅

**Exit criteria:** clean `git status` of cruft, green build + tests, accurate docs. ✅ **DONE**

---

## Phase 1 — Intent extraction + output quality (CORE)

> **Product thesis (locked 2026-06-03):** The #1 failure mode in prompting is
> *underspecification* — people communicate a goal, not a spec. A static form asks
> everyone the same questions and can't detect what *this* input is missing. The
> differentiator is **goal → spec conversion via a smart, adaptive intake**: the
> user describes a goal; the AI asks the few clarifying questions *that input
> actually needs*; skipped answers are inferred and the assumption is shown.
>
> **Non-negotiable constraint: keep the barrier on the floor.** *Describe →
> Generate → Copy* must always be one path with no forced steps, no signup, no
> learning curve. Questions are a skippable ramp, never a gate.

### 1.0 Smart intake (the new centerpiece — replaces the static 5-field wizard)

- [x] **1.0a Single goal box.** ✅ **DONE.** `/builder` phase 1: one goal box +
      **"Skip & generate now"** (the low-barrier floor) + "Continue →".
- [x] **1.0b Adaptive questions.** ✅ **DONE.** New `/api/clarify` (tool use, Sonnet)
      returns 3–5 short, goal-specific questions in the user's language, each with
      optional quick-pick chips. Non-blocking: empty/failed → straight to generate.
- [x] **1.0c Skippable + infer-and-show.** ✅ **DONE.** Every question skippable;
      Generate always available. `/api/generate` infers unspecified aspects and
      returns an `assumptions` list, shown on `/result` as "What we assumed" with a
      pointer to Refine. Verified: 2 answered + 3 skipped → 7 surfaced assumptions.
- [x] **1.0d Retire the static `STEPS` wizard.** ✅ **DONE.** Replaced the 5-step
      fixed wizard in `app/builder/page.tsx` with the goal → adaptive-questions flow.

### 1.1+ Generation quality (powers the intake above)

- [x] **1.1 Structured outputs via tool use.** ✅ **DONE.** `/api/generate` now forces
      a `submit_optimized_prompt` tool call (`tool_choice`), so output is schema-valid
      by construction — deleted the ~40-line regex parser. `generateFallbackPrompt`
      kept as the network-failure net (updated to the new shape). Verified with a real
      Czech API call. *(Note: the separate `/api/clarify` endpoint for adaptive
      questions is still TODO — it lands with Phase 1.0.)*
- [x] **1.2 Model upgrade.** ✅ **DONE.** `claude-haiku-4-5` → `claude-sonnet-4-6`,
      `max_tokens` 4096 → 8192 (bilingual output is longer). No quality toggle.
- [x] **1.1b Bilingual output (Czech-first beachhead).** ✅ **DONE.** Expand the structured
      contract from `{prompt}` to `{detectedLanguage, promptEnglish,
      promptLocalized}`. When input isn't English, return **both** an optimal
      English prompt *and* a localized one; when input is English, just the one.
      Belongs in 1.1 because it's a change to the response *contract* — cheap now,
      a second refactor if deferred.
      - **UX (✅ DECIDED: equal tabs, user chooses):** if `detectedLanguage !== en`,
        `/result` shows **two equal tabs (Čeština | English)** — no forced default.
        Keep a one-line nudge near the English tab: *"AI modely rozumí anglickým
        promptům líp — pro nejlepší výsledky zkus anglickou verzi."* (educates
        without overriding the user's choice). "Open in AI" / Copy use the
        currently-selected tab.
- [ ] **1.3 System-prompt refinement.** Tighten the expert system prompt — add a
      few-shot example of a great transformation, and an explicit instruction to
      match the user's language (already present) and avoid restating input.
- [x] **1.4 Refine loop.** ✅ **DONE.** `/result` has a "Refine" button → feedback
      box → "Regenerate". Reuses `/api/generate` in a `refinePrompt + feedback`
      mode (same tool, model, bilingual response) — sends the *current* prompt +
      feedback, replaces the result, saves a new history entry. On refine failure
      it errors (keeps the current prompt) instead of falling back to a generic one.
      Verified end-to-end (English "shorter + strong hook" → richer hook-first prompt).

**Exit criteria:** a user can type one goal and reach a copy-ready prompt in one
click (floor preserved); OR answer a few adaptive questions for a sharper result;
skipped answers are inferred with visible, editable assumptions; generation never
fails to parse; user can iterate without re-running intake.

---

## Phase 2 — UX & feel (CORE)

Make the wait disappear and the result feel alive.

- [ ] **2.1 Streaming.** Stream the prompt **prose** token-by-token to `/result`
      using the SDK's streaming API + a Next.js streaming response. Resolves the
      streaming-vs-structured tension by **splitting the response**: stream the
      prose first, then attach the structured metadata (`recommendedModel`,
      `whyThisModel`, `alternatives`) as a second step once the stream completes.
- [ ] **2.2 Retire `/loading-prompt` as a dead wait** — kick off generation and go
      straight to `/result`, where the prompt materializes live. Keep a skeleton
      shimmer for the metadata card until it arrives.
- [ ] **2.3 Result polish** — copy-with-feedback (already there), "copy as
      markdown" vs "plain", subtle done-state animation, better mobile layout.

**Exit criteria:** no blank spinner; prompt appears within ~1s and streams.

---

## Phase 3 — New features

Real product capabilities, built on the now-solid core.

- [ ] **3.1 Templates / starting points.** A small library of pre-filled wizards
      (LinkedIn post, cold email, code review, etc.) so users start from a strong
      base instead of a blank field.
- [ ] **3.2 Share via link.** Encode the result into a shareable URL (URL-encoded
      state first — zero infra; upgrade to KV/DB only if links get too long).
- [x] **3.3 "Open in…" deep links.** ✅ **DONE (pulled forward — #1 competitive
      differentiator).** `app/lib/aiTargets.ts` + buttons on `/result`. Clipboard-
      first design (copy, then open) so it works even where prefill isn't honored
      (Gemini). The **recommended** model gets the primary CTA — fuses model
      matching with one-click insert. Unit-tested in `__tests__/ai-targets.test.ts`.
- [ ] **3.4 Variations.** Generate 2–3 stylistic variants of a prompt side by side.

**Exit criteria:** users can start fast, share results, and act on them in one click.

---

## Phase 4 — Ship & grow

- [ ] **4.1 Analytics events** — track generate, refine, copy, share (which
      templates/tasks are popular) via the existing Vercel Analytics.
- [ ] **4.2 SEO pass** — verify metadata, sitemap, OG image still accurate post-changes.
- [ ] **4.3 Rate limiting** on `/api/generate` (it's an open, unauthenticated, paid
      endpoint — protect against abuse before promoting it).
- [ ] **4.4 Deploy polish** — env checks, error boundaries, Vercel deploy.
- [ ] **4.5 (Optional) Accounts/monetization** — only if usage justifies it.

**Exit criteria:** safe to share publicly; you can see what people actually use.

---

## Sequencing rationale

Phase 0 is ~30 min and prevents future confusion. Phases 1–2 are the **core** the
user asked to prioritize — they change the product's feel more than anything else.
Phase 1.1 (structured outputs) is done *before* 2.1 (streaming) on purpose: getting
the response contract clean makes streaming far simpler to build on top of.
