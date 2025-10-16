# UI Architecture (modules/ui)

Purpose: Highly reusable, accessible, and composable UI primitives built with Shadcn, Radix, and Tailwind.

## Layers
- Primitives: Radix + Tailwind primitives (button, input, dialog, etc.) in components/.
- Patterns: Compose primitives for higher-level patterns; keep focused and small.
- Exports: Re-export stable surface from lib/index.ts only.

## Styling & Tokens
- Colors, spacing, radii, typography from tooling/tailwind/theme.css.
- No magic values; consume tokens via Tailwind utilities/classes.

## Guidelines
- Props: fully typed; minimal optionality; sensible defaults.
- Accessibility: roles/aria; focus-visible; keyboard interactions.
- Performance: avoid unnecessary state; prefer CSS over JS for visuals.
- Stories: collocated *.stories.tsx showcasing states and variants.

## Adding a Component
1) Implement in components/, use tokens and Radix.
2) Add stories and MSW handlers if needed.
3) Export from lib/index.ts.
4) Verify a11y and responsiveness.
