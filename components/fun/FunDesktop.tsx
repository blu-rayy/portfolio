'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { SiteContent } from '@/lib/content/schemas';
import { ModeSwitch } from '@/components/shared/ModeSwitch';
import {
  ContactBlock,
  PlaceholderBadge,
  ProfileBlock,
  ProjectMeta,
  TimelineBlock,
} from '@/components/shared/blocks';
import { attachHistorySync } from '@/lib/wm/history-sync';
import { COMPACT_MEDIA_QUERY } from '@/lib/wm/layout';
import { createInitialState, wmReducer } from '@/lib/wm/reducer';
import { selectRenderedWindowIds } from '@/lib/wm/selectors';
import { getWMStore } from '@/lib/wm/store';
import {
  projectSlugFromWindowId,
  projectWindowId,
  STATIC_WINDOW_IDS,
  WINDOW_TITLES,
} from '@/lib/wm/windows';
import { Dock, type DockItem } from './Dock';
import { Window } from './Window';
import { WMContext } from './WMContext';

interface FunDesktopProps {
  content: SiteContent;
  /** Pre-rendered MDX bodies (server components), keyed by project slug. */
  bodies: Record<string, ReactNode>;
  /** Window to open on first render, e.g. for the `/work/[slug]` deep link. */
  initialWindowId?: string | null;
}

export function FunDesktop({ content, bodies, initialWindowId = null }: FunDesktopProps) {
  const { profile, projects, timeline } = content;
  const slugs = useMemo(() => projects.map((p) => p.slug), [projects]);

  // Seed state identically on server and client so hydration matches.
  const [store] = useState(() =>
    getWMStore(
      initialWindowId
        ? wmReducer(createInitialState(), { type: 'open', id: initialWindowId })
        : {},
    ),
  );

  // Windows already open on first paint don't steal focus from the skip link.
  const [initialIds] = useState(() => new Set(Object.keys(store.getState().windows)));

  const mainRef = useRef<HTMLElement>(null);
  const renderedIds = useStore(store, useShallow(selectRenderedWindowIds));

  // URL <-> windows, and viewport/layout sync. All client-only, after mount.
  useEffect(() => attachHistorySync(store, { projectSlugs: slugs }), [store, slugs]);

  useEffect(() => {
    const { dispatch } = store.getState();
    const mql = window.matchMedia(COMPACT_MEDIA_QUERY);
    const syncLayout = () =>
      dispatch({ type: 'setLayout', layout: mql.matches ? 'compact' : 'windowed' });
    syncLayout();
    mql.addEventListener('change', syncLayout);

    const el = mainRef.current;
    const ro = el
      ? new ResizeObserver(() =>
          dispatch({
            type: 'setViewport',
            viewport: { width: el.clientWidth, height: el.clientHeight },
          }),
        )
      : null;
    if (el) ro?.observe(el);
    return () => {
      mql.removeEventListener('change', syncLayout);
      ro?.disconnect();
    };
  }, [store]);

  const openIds = useStore(store, (s) => s.order);
  const focusedId = useStore(store, (s) => s.focusedId);
  const open = (id: string) => store.getState().dispatch({ type: 'open', id });

  const dockItems: DockItem[] = [
    ...STATIC_WINDOW_IDS.map((id) => ({ id: id as string, label: WINDOW_TITLES[id] })),
    ...openIds
      .filter((id) => projectSlugFromWindowId(id) !== null)
      .map((id) => ({
        id,
        label: projects.find((p) => p.slug === projectSlugFromWindowId(id))?.title ?? id,
      })),
  ];

  const focusedTitle = focusedId ? titleFor(focusedId) : null;
  function titleFor(id: string): string {
    const slug = projectSlugFromWindowId(id);
    if (slug) return projects.find((p) => p.slug === slug)?.title ?? id;
    return id in WINDOW_TITLES ? WINDOW_TITLES[id as keyof typeof WINDOW_TITLES] : id;
  }

  function contentFor(id: string): ReactNode {
    const slug = projectSlugFromWindowId(id);
    if (slug) {
      const p = projects.find((x) => x.slug === slug);
      if (!p) return null;
      return (
        <article>
          <p>
            {p.summary}
            <PlaceholderBadge show={p.placeholder} />
          </p>
          <ProjectMeta project={p} />
          {bodies[p.slug]}
        </article>
      );
    }
    switch (id) {
      case 'about':
        return (
          <>
            <ProfileBlock profile={profile} />
            <h3>Elsewhere</h3>
            <ContactBlock profile={profile} />
          </>
        );
      case 'episodes':
        return (
          <ul>
            {projects.map((p) => (
              <li key={p.slug}>
                <h3>
                  {/* A real link (middle-click, copy address), upgraded to open a window. */}
                  <a
                    href={`/work/${p.slug}`}
                    className="inline-flex items-center py-2"
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                      e.preventDefault();
                      open(projectWindowId(p.slug));
                    }}
                  >
                    {p.title}
                  </a>
                </h3>
                <p>{p.summary}</p>
                <ProjectMeta project={p} />
              </li>
            ))}
          </ul>
        );
      case 'timeline':
        return <TimelineBlock entries={timeline} />;
      default:
        return null;
    }
  }

  return (
    <WMContext.Provider value={store}>
      <div className="flex h-dvh flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between gap-2 border-b bg-(--color-surface) pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]">
          <span className="px-3 font-bold">Kris OS</span>
          <span className="truncate" aria-live="polite">
            {focusedTitle}
          </span>
          <ModeSwitch />
        </header>

        <main id="main" tabIndex={-1} ref={mainRef} className="relative min-h-0 flex-1">
          <div className="h-full overflow-auto p-4">
            <h1>
              {profile.name}
              <PlaceholderBadge show={profile.placeholder} />
            </h1>
            <p>{profile.tagline}</p>
            <ul aria-label="Desktop">
              {STATIC_WINDOW_IDS.map((id) => (
                <li key={id}>
                  <button type="button" className="px-3" onClick={() => open(id)}>
                    {WINDOW_TITLES[id]}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {renderedIds.map((id) => (
            <Window key={id} id={id} title={titleFor(id)} autoFocus={!initialIds.has(id)}>
              {contentFor(id)}
            </Window>
          ))}
        </main>

        <Dock items={dockItems} />
      </div>
    </WMContext.Provider>
  );
}
