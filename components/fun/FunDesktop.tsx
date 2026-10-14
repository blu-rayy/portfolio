'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { SiteContent } from '@/lib/content/schemas';
import { ModeSwitch } from '@/components/shared/ModeSwitch';
import { attachHistorySync } from '@/lib/wm/history-sync';
import { COMPACT_MEDIA_QUERY } from '@/lib/wm/layout';
import { createInitialState, wmReducer } from '@/lib/wm/reducer';
import { selectRenderedWindowIds } from '@/lib/wm/selectors';
import { getWMStore, withDefaults } from '@/lib/wm/store';
import {
  DOCK_LABELS,
  HOME_WINDOW_ID,
  projectSlugFromWindowId,
  STATIC_WINDOW_IDS,
  WINDOW_TITLES,
} from '@/lib/wm/windows';
import { Sky } from './art/Sky';
import { AppIcon, SunGlyph } from './art/icons';
import { Clock } from './Clock';
import { KristianCorner } from './KristianCorner';
import { Dock, type DockItem } from './Dock';
import { Window } from './Window';
import {
  ContactContent,
  GuestbookContent,
  MeContent,
  ProjectContent,
  SkillsContent,
  WelcomeContent,
  WorksContent,
} from './WindowContents';
import { WMContext } from './WMContext';

interface FunDesktopProps {
  content: SiteContent;
  /** Pre-rendered MDX bodies (server components), keyed by project slug. */
  bodies: Record<string, ReactNode>;
  /**
   * Window to open on first render, e.g. for the `/work/[slug]` deep link.
   * Defaults to the home window (WELCOME.TXT) on `/`.
   */
  initialWindowId?: string | null;
}

export function FunDesktop({
  content,
  bodies,
  initialWindowId = HOME_WINDOW_ID,
}: FunDesktopProps) {
  const { profile, projects, fun } = content;
  const slugs = useMemo(() => projects.map((p) => p.slug), [projects]);

  // Seed state identically on server and client so hydration matches.
  const [store] = useState(() =>
    getWMStore(
      initialWindowId
        ? wmReducer(
            createInitialState(),
            withDefaults({ type: 'open', id: initialWindowId }),
          )
        : {},
    ),
  );

  // Windows already open on first paint don't steal focus from the skip link.
  const [initialIds] = useState(() => new Set(Object.keys(store.getState().windows)));

  const mainRef = useRef<HTMLElement>(null);
  const layout = useStore(store, (s) => s.layout);
  const renderedIds = useStore(store, useShallow(selectRenderedWindowIds));
  // On phones the home window *is* the home screen, not a full-screen window.
  const windowIds =
    layout === 'compact'
      ? renderedIds.filter((id) => id !== HOME_WINDOW_ID)
      : renderedIds;

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
  const open = (id: string) => store.getState().dispatch({ type: 'open', id });

  const dockItems: DockItem[] = [
    ...STATIC_WINDOW_IDS.map((id) => ({ id: id as string, label: DOCK_LABELS[id] })),
    ...openIds
      .filter((id) => projectSlugFromWindowId(id) !== null)
      .map((id) => ({
        id,
        label: projects.find((p) => p.slug === projectSlugFromWindowId(id))?.title ?? id,
      })),
  ];

  function titleFor(id: string): string {
    const slug = projectSlugFromWindowId(id);
    if (slug) return projects.find((p) => p.slug === slug)?.title ?? id;
    return id in WINDOW_TITLES ? WINDOW_TITLES[id as keyof typeof WINDOW_TITLES] : id;
  }

  function contentFor(id: string): ReactNode {
    const slug = projectSlugFromWindowId(id);
    if (slug) {
      const p = projects.find((x) => x.slug === slug);
      return p ? <ProjectContent project={p} body={bodies[p.slug]} /> : null;
    }
    switch (id) {
      case 'welcome':
        return <WelcomeContent content={content} open={open} />;
      case 'works':
        return <WorksContent content={content} open={open} />;
      case 'me':
        return <MeContent content={content} />;
      case 'skills':
        return <SkillsContent content={content} />;
      case 'guestbook':
        return <GuestbookContent content={content} />;
      case 'contact':
        return <ContactContent content={content} />;
      default:
        return null;
    }
  }

  function statusFor(id: string): ReactNode {
    if (id === 'welcome')
      return (
        <>
          <span>{fun.welcome.tip}</span>
          <span>{fun.welcome.tipMascot}</span>
        </>
      );
    if (id === 'works') return <span>[{projects.length}] works</span>;
    return null;
  }

  // Phone home screen apps: every window except home, plus résumé / GitHub links.
  const github = profile.socials.find((s) => /github/i.test(s.label));

  return (
    <WMContext.Provider value={store}>
      <div className="desk">
        <Sky />

        <header className="menubar">
          <Link href="/" className="menubar-logo">
            <SunGlyph />
            {fun.osName}
          </Link>
          <div className="flex items-stretch">
            <ModeSwitch
              className="menubar-wash max-lg:hidden"
              washLabel={fun.washLabel}
            />
            <Clock />
          </div>
        </header>

        <KristianCorner name={fun.mascot.name} bubble={fun.mascot.bubble} />

        <main id="main" tabIndex={-1} ref={mainRef} className="desk-main">
          {/* phone home screen (compact only; CSS hides it on wide screens) */}
          <div className="home lg:hidden">
            <section className="home-card" aria-labelledby="home-card-title">
              <div className="home-card-bar">
                <span id="home-card-title" className="win-title !text-[13px]">
                  {WINDOW_TITLES.welcome}
                </span>
              </div>
              <div className="well">
                {/* Only one of the two h1s is ever rendered visible (CSS breakpoint). */}
                <WelcomeContent content={content} open={open} />
              </div>
            </section>
            <ul className="apps" aria-label="Apps">
              {STATIC_WINDOW_IDS.filter((id) => id !== HOME_WINDOW_ID).map((id) => (
                <li key={id}>
                  <button type="button" className="app" onClick={() => open(id)}>
                    <span className="app-tile">
                      <AppIcon id={id} size={28} />
                    </span>
                    {DOCK_LABELS[id]}
                  </button>
                </li>
              ))}
              <li>
                <a className="app" href={profile.resume}>
                  <span className="app-tile">
                    <AppIcon id="project" size={28} />
                  </span>
                  résumé
                </a>
              </li>
              {github ? (
                <li>
                  <a className="app" href={github.url} rel="noopener noreferrer">
                    <span className="app-tile">
                      <svg
                        aria-hidden="true"
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      >
                        <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13 6l-2 12" />
                      </svg>
                    </span>
                    github
                  </a>
                </li>
              ) : null}
            </ul>
          </div>

          <p className="sticky" aria-hidden="true">
            {fun.sticky}
          </p>

          {windowIds.map((id) => (
            <Window
              key={id}
              id={id}
              title={titleFor(id)}
              status={statusFor(id)}
              autoFocus={!initialIds.has(id)}
            >
              {contentFor(id)}
            </Window>
          ))}
        </main>

        <Dock items={dockItems} />
      </div>
    </WMContext.Provider>
  );
}
