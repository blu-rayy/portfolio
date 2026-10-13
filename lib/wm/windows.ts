// Maps window ids <-> URLs. Pure, so it is unit-tested and shared by the server
// (deep links) and the client (history sync).
//
//   about | episodes | timeline  ->  /?window=<id>
//   project:<slug>               ->  /work/<slug>

export const STATIC_WINDOW_IDS = ['about', 'episodes', 'timeline'] as const;
export type StaticWindowId = (typeof STATIC_WINDOW_IDS)[number];

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
 * URL for a focused window (or the bare desktop for null). Other query params,
 * such as `?mode=`, are preserved.
 */
export function urlForWindow(id: string | null, currentSearch = ''): string {
  const params = new URLSearchParams(currentSearch);
  params.delete('window');
  const slug = id ? projectSlugFromWindowId(id) : null;
  let path = '/';
  if (slug) path = `/work/${slug}`;
  else if (id) params.set('window', id);
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export const WINDOW_TITLES: Record<StaticWindowId, string> = {
  about: 'About',
  episodes: 'Episodes',
  timeline: 'Timeline',
};
