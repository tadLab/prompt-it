# Redesign verification · 30 September 2026

## Passed

- Production build: 19 generated routes, no build/type errors.
- TypeScript: `npm run typecheck`.
- Unit tests: 32 passing tests across six suites. These cover parsing/completion, input validation, language instructions, edit synchronization, AI-target helpers, and the inherited rate limiter. They are not benchmark evidence of better AI outputs.
- Actual browser flow using the existing configured Anthropic integration: Czech goal → two Czech questions → Czech prompt plus English translation.
- Manual Czech edit → save → reload: edited text preserved, English version retained independently.
- Real refinement → undo → clipboard: original edited version restored and copied correctly.
- History: saved edit shown, search finds it, reopening restores it.
- English/Czech homepage and examples; mobile menu expansion and collapse.
- Responsive homepage: 320px and 390px widths, no horizontal overflow; default desktop preview checked visually.
- Final screenshots: `artifacts/homepage-desktop.jpg`, `artifacts/homepage-full.jpg`, `artifacts/homepage-mobile.jpg`.

## Deliberate limitations

- AI output still needs human review. A live sample suggested invented placeholder values; the shared instruction was tightened to require literal bracketed labels. This is guidance, not a guarantee.
- External AI handoff uses clipboard plus opening the provider; it does not claim automatic insertion or submission. Provider login and browser clipboard/pop-up settings can affect the handoff.
- Existing legal policy substance was retained and translated, not legally audited. Owner review of real data practices remains necessary.
- Rate limiting remains the existing in-memory, per-instance design. Distributed production abuse protection is not configured here.
- This is an isolated local project copy. No original-project files were overwritten, and nothing was committed, pushed, or deployed.
