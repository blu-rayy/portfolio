# CLAUDE.md

Portfolio site with two renderers (fun "Kris OS" desktop and clean single page)
over one content source. See README.md for architecture and decisions.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript 6 strict (pinned `~6.0`:
typescript-eslint doesn't support 7 yet) · Tailwind CSS v4 · Zod 4 · Zustand 5 ·
Vitest + Testing Library · Playwright · ESLint 10 + Prettier · pnpm.
Next 16 docs are bundled at `node_modules/next/dist/docs`; check them before
using an API from memory (e.g. `middleware` is now `proxy`).

## Commands

`pnpm dev` · `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build` ·
`pnpm e2e` · `pnpm lhci` (after build) · `pnpm analyze` · `pnpm format`.
Before finishing a change run lint, typecheck, test, build and e2e.

## Rules

- **Content is the single source of truth.** Everything shown comes from `/content`
  through `lib/content`. Never hard-code copy in components. Schema changes go in
  `lib/content/schemas.ts`; invalid content must fail the build.
- **Both modes must render all content.** If you add a field or collection, make
  it reachable in `components/fun` AND `components/clean`. Shared markup lives in
  `components/shared/blocks.tsx`; extend it so a field can't be mode-specific.
- **Mobile-first; test on the mobile Playwright projects** (`iphone-webkit`,
  `android-chromium`) as well as desktop. Touch targets ≥ 44px, `100dvh` not
  `100vh`, safe-area insets, pointer events, nothing hover-only.
- **All mode switches go through `transitionToMode()`** (`lib/mode/transition.ts`).
  Don't set the cookie or navigate directly.
- **Window state goes through the reducer** (`lib/wm/reducer.ts`). Keep it pure
  (no React/DOM). New behaviour needs reducer unit tests, including compact layout.
- **No hydration mismatches.** The server can't know the viewport; first paint
  is CSS media queries (`lg:` / `max-lg:`), and `matchMedia` is read after mount.
  Keep `lib/wm/layout.ts` and the CSS breakpoint in sync.
- **Static by default.** Don't read `cookies()`/`searchParams` in pages; mode is a
  route segment resolved in `proxy.ts`.
- **Lazy-load heavy things** (GSAP wash animation, mascot) with dynamic `import()`.
  Images via `next/image` with `sizes`.
- Use native `<dialog>` and `inert` for modals/focus containment. No gesture,
  modal or focus-trap libraries.
- Styling: tokens in `styles/tokens.css` (`bg-(--color-bg)`), no real visual
  design until requested.

## Conventions

- Small logical commits, imperative messages (`feat(wm): ...`, `fix: ...`).
- Placeholder content has `placeholder: true` and a "[Placeholder]" prefix.
- Tests: `tests/unit/*.test.ts(x)` (Vitest, jsdom), `tests/e2e/*.spec.ts`.
