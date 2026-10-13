// Mode primitives shared by the proxy (edge), server components and the client.
// Keep this file free of Node/DOM APIs.

export const MODES = ['fun', 'clean'] as const;
export type Mode = (typeof MODES)[number];

export const DEFAULT_MODE: Mode = 'fun';
export const MODE_COOKIE = 'mode';
export const MODE_QUERY = 'mode';
export const MODE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function parseMode(value: unknown): Mode | null {
  return typeof value === 'string' && (MODES as readonly string[]).includes(value)
    ? (value as Mode)
    : null;
}

/** `?mode=` query → cookie → default. */
export function resolveMode(input: {
  query?: string | null;
  cookie?: string | null;
}): Mode {
  return parseMode(input.query) ?? parseMode(input.cookie) ?? DEFAULT_MODE;
}
