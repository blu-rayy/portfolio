import type { Anchor } from './reducer';

// Maps window ids <-> URLs. Pure, so it is unit-tested and shared by the server
// (deep links) and the client (history sync).
//
//   welcome                                  ->  /            (the home window)
//   works | me | skills | guestbook | contact ->  /?window=<id>
//   project:<slug>                           ->  /work/<slug>

export const STATIC_WINDOW_IDS = [
  'welcome',
  'works',
  'me',
  'skills',
  'guestbook',
  'contact',
] as const;
export type StaticWindowId = (typeof STATIC_WINDOW_IDS)[number];

/** Open on a first visit to `/`. Its URL is the bare `/`. */
export const HOME_WINDOW_ID: StaticWindowId = 'welcome';

const PROJECT_PREFIX = 'project:';
const WORK_PATH = /^\/work\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/;

export const projectWindowId = (slug: string) => `${PROJECT_PREFIX}${slug}`;

export function projectSlugFromWindowId(id: string): string | null {
  return id.startsWith(PROJECT_PREFIX) ? id.slice(PROJECT_PREFIX.length) : null;
}

export function isStaticWindowId(id: string): id is StaticWindowId {
  return (STATIC_WINDOW_IDS as readonly string[]).includes(id);
}

export function isKnownWindowId(id: string, projectSlugs: readonly string[]): boolean {
  const slug = projectSlugFromWindowId(id);
  return slug !== null ? projectSlugs.includes(slug) : isStaticWindowId(id);
}

/** Window id described by a location, or null when it shows the bare desktop. */
export function windowIdFromLocation(pathname: string, search: string): string | null {
  const work = WORK_PATH.exec(pathname);
  if (work) return projectWindowId(work[1]!);
  if (pathname === '/') {
    const id = new URLSearchParams(search).get('window');
    if (id && isStaticWindowId(id)) return id;
  }
  return null;
}

/**
 * URL for a focused window (or the bare desktop for null). The home window
 * lives at `/` too. Other query params, such as `?mode=`, are preserved.
 */
export function urlForWindow(id: string | null, currentSearch = ''): string {
  const params = new URLSearchParams(currentSearch);
  params.delete('window');
  const slug = id ? projectSlugFromWindowId(id) : null;
  let path = '/';
  if (slug) path = `/work/${slug}`;
  else if (id && id !== HOME_WINDOW_ID) params.set('window', id);
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

/** Accessible window names. The title bar shows them in uppercase. */
export const WINDOW_TITLES: Record<StaticWindowId, string> = {
  welcome: 'Welcome.txt',
  works: 'Works',
  me: 'Me',
  skills: 'Skills',
  guestbook: 'Guestbook',
  contact: 'Contact',
};

/** Short labels for the dock and the phone home screen. */
export const DOCK_LABELS: Record<StaticWindowId, string> = {
  welcome: 'welcome',
  works: 'works',
  me: 'me',
  skills: 'skills',
  guestbook: 'guestbook',
  contact: 'contact',
};

export interface WindowDefaults {
  width: number;
  height: number;
  /**
   * Where it opens, as fractions of the free area (0.5/0.5 = centred). Windows
   * are spread around the desktop so opening several doesn't stack them all in
   * the middle. Null cascades instead (used when many can be open at once).
   */
  anchor: Anchor | null;
}

const STATIC_DEFAULTS: Record<StaticWindowId, WindowDefaults> = {
  welcome: { width: 660, height: 440, anchor: { x: 0.5, y: 0.5 } },
  works: { width: 900, height: 640, anchor: { x: 0.12, y: 0.15 } },
  me: { width: 760, height: 600, anchor: { x: 0.9, y: 0.08 } },
  skills: { width: 640, height: 480, anchor: { x: 0.05, y: 0.9 } },
  guestbook: { width: 580, height: 460, anchor: { x: 0.92, y: 0.85 } },
  contact: { width: 560, height: 440, anchor: { x: 0.55, y: 0.78 } },
};
const PROJECT_DEFAULTS: WindowDefaults = { width: 780, height: 620, anchor: null };

/** Size and placement a window opens with when the caller doesn't say. */
export function windowDefaultsFor(id: string): WindowDefaults {
  return isStaticWindowId(id) ? STATIC_DEFAULTS[id] : PROJECT_DEFAULTS;
}
