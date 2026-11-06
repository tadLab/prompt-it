# makebetterprompt — A clearer signal

## Idea

People arrive with intent, not specifications. The brand turns a rough thought into clear direction. Voice: warm, concise, capable. Never pretend the tool guarantees better results or knows the user's missing facts.

## Identity

The folded double-chevron is an original terminal-inspired mark: input moving forward into something clearer. Use `public/brand/mark.svg` for avatars and the favicon; `logo.svg` for the horizontal lockup. The SVG assets remain crisp at any size. Leave at least half the symbol's height as clear space. Minimum symbol size: 20px. For monochrome, replace both green fills with a single currentColor; retain the overlapping-chevron silhouette. Do not rotate the navigation logo or add effects to small marks.

## Palette

- Ink: #080B09 — canvas
- Forest: #111612 — surfaces
- Signal: #A4F986 — primary actions and symbol
- Paper: #F1F5EF — text
- Sage: #A1ACA3 — secondary text

Primary buttons use dark text on Signal. Never use pale green text on white. Decorative gradients are not text backgrounds without a solid contrast layer.

## Type and layout

Manrope, 400–700: interface and editorial headlines. IBM Plex Mono, 400–500: compact labels, step numbers, counters. Large headings use tight negative tracking; body text uses generous line height. Content width 1120px. Cards 20–22px radius; actions pill shaped. Give primary actions a small inset arrow well instead of adding unrelated icon styles.

## Motion and art

Emerald light passes through folded planes. Use CSS gradients rather than video backgrounds for performance. Motion should communicate state, not decorate idle screens. Respect prefers-reduced-motion. Use repo-native line icons and keep stroke weights consistent.

## Language

Brand name is always makebetterprompt. UI language codes are EN / CZ; internal Czech locale remains cs. Translate examples, empty states, errors, questions, and metadata—not only navigation. User-authored history stays in its original language.

## Before public launch

Review this visual direction, test production API credentials and request limits, and review actual legal/data-processing practices. Next.js renders the matching Open Graph PNG at `/opengraph-image`; the SVG is an editable source asset. No fabricated testimonials, user counts, or benchmark claims. This preview is not deployed automatically.
