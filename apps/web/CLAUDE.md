# apps/web — Frontend Overview (Rino)

Purpose: Fast, type-safe UI in Next.js App Router with Shadcn, Radix, Tailwind, and RSC. Scope: apps/web only.

## Conventions
- Rendering: Prefer RSC; use client components only when necessary; wrap in Suspense when async.
- Styling: Tailwind; tokens defined in tooling/tailwind/theme.css; no magic values inline.
- Components: Reusable primitives in modules/ui/components, re-exported via modules/ui/lib.
- Stories: Co-locate *.stories.tsx; use MSW handlers for realistic states.
- Types: No any; prop interfaces exported; unions are exhaustive.
- a11y: Follow Radix patterns; roles, aria-labels, focus-visible, keyboard nav.

## Layout & Routing
- app/** holds routes, layouts, metadata, and server-first components.
- Keep data-fetching in RSC; pass minimal props to client components.

## Mocking & Prototyping
- Storybook v9 (.storybook/**) minimal Next.js config.
- MSW: mocks/**, msw.init.ts, public/mockServiceWorker.js for network-level mocking.

## Performance
- Avoid gratuitous state/effects; memoize only when measured.
- Code-split non-critical UI; lazy-load images with sizes.

## Responsive Design (Mobile → Desktop)
- Mobile-first: design for small screens; scale up via Tailwind breakpoints.
- Use `Container` for horizontal padding and max-width (`sm|md|lg|xl|full`).
- Use `Grid` for adaptive layouts; defaults to 1 → 2 → 12 columns at `sm`/`lg`.
- Images: set width/height or sizes; avoid layout shift.
- Navigation: ensure touch targets ≥ 44px; test focus/keyboard.

## Authoring Checklist
- Descriptive prop names; defaults explicit; no boolean traps.
- No magic strings—centralize constants.
- Stories cover: default, hover/focus, loading, error, disabled.
- a11y validated (tab order, labels, contrast).
