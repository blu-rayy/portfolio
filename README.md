# Portfolio: foundations

One content source, two renderers:

- **fun** ("Kris OS"): a retro desktop UI with draggable windows and a dock.
- **clean**: a modern, recruiter-friendly single page.

This repo is the _foundation only_ (architecture, content, mode system, window
manager, mobile support, tooling). There is intentionally no visual design yet.

## Run it

Requires Node 24+ and pnpm.

```bash
pnpm install
pnpm dev                    # http://localhost:3000
```

| Command                           | What it does                                                       |
| --------------------------------- | ------------------------------------------------------------------ |
| `pnpm lint` / `pnpm format:check` | ESLint / Prettier                                                  |
| `pnpm typecheck`                  | `tsc --noEmit` (strict)                                            |
| `pnpm test`                       | Vitest unit tests                                                  |
| `pnpm build`                      | Production build. **Fails on invalid content.**                    |
| `pnpm e2e`                        | Playwright (desktop Chrome, iPhone WebKit, Pixel Chromium)         |
| `pnpm lhci`                       | Lighthouse CI (needs a prior `pnpm build`): perf/a11y ≥ 0.9        |
| `pnpm analyze`                    | `@next/bundle-analyzer` (webpack build). Also: `pnpm next analyze` |

First e2e run: `pnpm exec playwright install chromium webkit`.

## Folder structure

```
app/[mode]/            routes; [mode] is "fun" | "clean" (see "Modes" below)
  layout.tsx           root layout: <html data-mode>, skip link, metadata
  page.tsx             "/"
  work/[slug]/page.tsx "/work/[slug]" (statically generated)
proxy.ts               resolves the mode and rewrites to /fun/* or /clean/*
content/               THE source of truth (MDX + JSON, Zod-validated)
lib/content/           schemas.ts (Zod) and load.ts (fs + gray-matter)
lib/mode/              mode resolution + transitionToMode()
lib/wm/                window manager: reducer, selectors, store, URL + history sync
components/fun/        Kris OS renderer (client components)
components/clean/      clean renderer (server components + a small nav)
components/shared/     content blocks both renderers use, ModeSwitch
styles/tokens.css      design tokens per [data-mode]
tests/unit, tests/e2e
```

## Add a project

Create `content/projects/<slug>.mdx`. The filename must equal the `slug`.

```mdx
---
title: My Project
slug: my-project
summary: One sentence.
status: shipped # shipped | in-progress | coursework
date: '2026-02-01' # ISO date, quote it
stack: [TypeScript, Next.js]
featured: false
episode: 4 # unique, positive integer
links:
  github: https://github.com/you/my-project
  live: https://example.com # optional
  caseStudy: https://example.com/case # optional
---

Body in MDX.
```

It appears in both modes, at `/work/my-project`, and in `sitemap.xml`
automatically. Run `pnpm build` (or `pnpm test`) to validate. Placeholder entries
carry `placeholder: true` and a "[Placeholder]" title; delete or replace them.

`timeline.json` and `profile.json` are validated by the same loader.

## Key decisions

**Content loader.** A ~80 line custom loader (`fs` + `gray-matter` + Zod) with
`next-mdx-remote/rsc` for MDX. No codegen or watcher step, works with Turbopack.
Every page calls it at build time, so bad content breaks the build.

**Modes and no flash.** `proxy.ts` resolves `?mode=` → cookie → `fun`, then
_rewrites_ to `/fun/...` or `/clean/...`. Both are statically generated and the
layout renders `<html data-mode>`, so the first paint is right and pages are
CDN-cacheable (no `cookies()` read). The visible URL is unchanged.
`transitionToMode(next)` (`lib/mode/transition.ts`) is the only way to switch;
`registerTransitionEffect()` is the hook the wash animation will use.

**Window manager.** `lib/wm/reducer.ts` is a pure reducer (open, close, focus,
minimize, restore, move, setLayout, setViewport) tracking z-order, focus and
clamped positions. Zustand only wraps it. `layout` is `"windowed"` or
`"compact"`; compact is a presentation difference, so the same state powers
both and nothing is lost when switching on resize/rotation.

**Hydration and layout.** The server can't know the viewport, so the first paint
uses CSS media queries only (Tailwind `lg:`/`max-lg:` = 64rem). After mount we
read `matchMedia` and sync the store, which only changes what React mounts. CSS
and JS share the boundary (`lib/wm/layout.ts`), so there's no flash or jump.

**URL and history.** Opening a window `pushState`s an entry that remembers what
it opened (`lib/wm/history-sync.ts`). Back closes that window, forward reopens
it, focus changes use `replaceState`. `/?window=about|episodes|timeline` and
`/work/[slug]` deep-link into windows; `/work/[slug]` is server-rendered with the
window open (full-screen on phones). `?window=` is applied on the client, so `/`
stays static.

**Singleton store.** In the browser the window store is a module singleton,
because Next remounts the desktop when history crosses `/` ↔ `/work/[slug]`.
The server always builds a fresh store.

## Not done yet (by design)

Visual design, fonts, images, mascot, the wash animation (lazy-load it with
`import()` inside a `registerTransitionEffect`), guestbook, deployment.
`/resume.pdf` is referenced by the profile but not shipped yet.
