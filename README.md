# Prompt It

Turn a vague idea into a structured, expert-level AI prompt. You answer a short
5-step wizard; Prompt It expands it into a detailed prompt and recommends which
AI model (Claude / ChatGPT / Gemini) to run it on.

Free, no account, no database — your history lives in your own browser.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4**
- **Anthropic Claude API** (`@anthropic-ai/sdk`) for prompt generation
- **Vercel Analytics**

## How it works

```
/builder            5-step wizard (task, context, output, preferences, role)
   ↓                wizard state kept in sessionStorage
/loading-prompt     POSTs the inputs to /api/generate
   ↓
/api/generate       calls Claude with an "expert prompt engineer" system prompt,
   ↓                returns { prompt, recommendedModel, whyThisModel, alternatives }
/result             shows the prompt + model recommendation; copy / edit
                    history saved to localStorage
```

The API route ([app/api/generate/route.ts](app/api/generate/route.ts)) degrades
gracefully: if the model returns malformed JSON or the API call fails, it falls
back to a locally-generated structured prompt so the user never sees an error.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Create `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm test` | Run the prompt-quality test suite (Vitest) |
| `npm run lint` | Lint |

## Tests

[`__tests__/prompt-quality.test.ts`](__tests__/prompt-quality.test.ts) are
differential tests: they assert that an *enriched* prompt is structurally richer
than the *naive* input (≥6 sections, ≥5 requirement bullets, 10×+ word count),
rather than checking exact strings.

## Roadmap

See [docs/plans/2026-06-03-level-up-plan.md](docs/plans/2026-06-03-level-up-plan.md).
