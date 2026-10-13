import { NextResponse, type NextRequest } from 'next/server';
import {
  MODE_COOKIE,
  MODE_COOKIE_MAX_AGE,
  MODE_QUERY,
  parseMode,
  resolveMode,
} from '@/lib/mode/mode';

// Resolves the mode (?mode= → cookie → default) and rewrites to the matching
// statically generated variant: `/work/x` → `/clean/work/x`. The URL the user
// sees never changes, and both variants are plain static HTML (no cookies()
// read in the page, so no dynamic rendering and no flash of the wrong mode).
export function proxy(request: NextRequest) {
  const { nextUrl, cookies } = request;
  const query = parseMode(nextUrl.searchParams.get(MODE_QUERY));
  const mode = resolveMode({ query, cookie: cookies.get(MODE_COOKIE)?.value });

  const url = nextUrl.clone();
  url.pathname = `/${mode}${nextUrl.pathname === '/' ? '' : nextUrl.pathname}`;
  const response = NextResponse.rewrite(url);

  // An explicit ?mode= (e.g. a shared link) becomes the visitor's preference.
  if (query && cookies.get(MODE_COOKIE)?.value !== query) {
    response.cookies.set(MODE_COOKIE, query, {
      path: '/',
      maxAge: MODE_COOKIE_MAX_AGE,
      sameSite: 'lax',
    });
  }
  return response;
}

export const config = {
  // Skip Next internals and anything with a file extension (sitemap.xml, robots.txt, ...).
  matcher: ['/((?!_next/|api/|.*\\..*).*)'],
};
