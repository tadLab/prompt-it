# makebetterprompt

An English/Czech prompt workspace with a custom emerald identity. This copy preserves the existing Anthropic-backed service and local browser history keys.

## Production release · 30 September 2026

- Live: https://makebetterprompt.com
- Vercel project: `tadlabs-projects/prompt-it-app`
- Deployment: `dpl_8jxUtM6ztbCWTjiHHCfnUHDSsUUU`
- Immutable URL: https://prompt-it-egnwrdobl-tadlabs-projects.vercel.app
- Verification: 32 tests passed, TypeScript passed, Next.js production build passed, homepage HTTP 200, Czech clarification and streaming generation HTTP 200, EN/CZ UI checked on the public domain. Runtime error query returned no matching logs.
- Prior release / rollback target: https://prompt-it-m8887dhec-tadlabs-projects.vercel.app

This release was originally deployed directly from a local workspace, without syncing the redesign to GitHub. A Git-backed redeployment on 6 November 2026 therefore restored the old design. The September deployment was promoted again, and this source sync brings the emerald redesign into the repository while preserving the newer `@vercel/analytics/next` integration. The promo video was not embedded or published to social media as part of deployment.

## Release workflow

Treat `tadLab/prompt-it` on GitHub as the source of truth. Commit and verify design changes there before releasing; Vercel builds `main` for production. Do not publish a local-only redesign and leave `main` on an older UI.

Before merging a release, run `npm test`, `npm run typecheck`, and `npm run build`. Review the preview, then verify the production domain after Vercel finishes. `__tests__/brand-release.test.ts` checks the homepage identity, green theme, brand assets, and analytics integration to catch an accidental reversion.

## Run

1. `npm ci`
2. Copy `.env.example` to `.env.local` and set your Anthropic API key.
3. `npm run dev`

## Verify

- `npm run typecheck`
- `npm test`
- `npm run build`

Stop the development server before a production build: Next.js 15 shares the `.next` output directory between them. Fonts are downloaded at build time and self-hosted by Next.js; the build needs network access on a cold cache.

## Product flow

The homepage sends an idea straight to generation, or into an optional 0–2-question intake. Both API routes share the same proportional-length, no-invented-facts generation contract. Results stream live and are saved only after valid completion metadata arrives. Users can edit either translation, refine, undo the last change, download, copy, or open an AI tool. AI handoff deliberately copies then opens: URL prefill behavior is not assumed across providers.

Browser storage retains the last 100 prompts. No registration or new external service was introduced. Legacy keys remain so existing history can survive an in-place rollout.

## Identity

See `identity/BRAND.md`. Editable SVGs are in `public/brand/`. App icon, Apple icon, and Open Graph PNGs are rendered by Next.js from the new identity.

## Public launch checks

- Review the visual direction and actual EN/CZ wording.
- Verify production Anthropic credentials and billing.
- Review the existing legal policy contents with the owner; translations are not a compliance audit.
- The inherited rate limiter is in-memory per instance, not a distributed abuse-control system. Review production capacity before a large public launch.
- Confirm hosting/log retention matches the privacy policy.
- Further production releases require approval. This workspace is linked to the existing live Vercel project.
