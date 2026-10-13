// Single source of truth for the windowed/compact breakpoint.
//
// Hydration strategy: the server can't know the viewport, so the first paint is
// decided purely by CSS media queries (Tailwind `lg:` / `max-lg:` = width >= /
// < 64rem, the same boundary as below). After mount we read matchMedia and sync
// the store's `layout`, which only changes *what React mounts* (compact mounts
// just the focused window). Because CSS and JS agree on the boundary there is no
// flash or layout jump.
export const WINDOWED_MIN_WIDTH_REM = 64; // 1024px at the default font size
export const COMPACT_MEDIA_QUERY = `(width < ${WINDOWED_MIN_WIDTH_REM}rem)`;
