import {
  MODE_COOKIE,
  MODE_COOKIE_MAX_AGE,
  MODE_QUERY,
  parseMode,
  type Mode,
} from './mode';

// Every mode switch goes through `transitionToMode`. The wash / mess animation
// plugs in later via `registerTransitionEffect` without touching any caller.

export interface TransitionContext {
  from: Mode;
  to: Mode;
}
export type TransitionEffect = (ctx: TransitionContext) => Promise<void> | void;
export type Navigate = (url: string) => void;

let effect: TransitionEffect | null = null;
let navigate: Navigate | null = null;
let inFlight = false;

/** Plug in an animation that runs *before* the new mode is swapped in. */
export function registerTransitionEffect(fn: TransitionEffect): () => void {
  effect = fn;
  return () => {
    if (effect === fn) effect = null;
  };
}

/** Called once by `ModeRoot` so transitions can use the Next router. */
export function registerNavigator(fn: Navigate): () => void {
  navigate = fn;
  return () => {
    if (navigate === fn) navigate = null;
  };
}

export function getCurrentMode(): Mode | null {
  return parseMode(document.documentElement.dataset.mode);
}

export function persistMode(mode: Mode): void {
  document.cookie = `${MODE_COOKIE}=${mode}; path=/; max-age=${MODE_COOKIE_MAX_AGE}; samesite=lax`;
}

/** Same URL with `?mode=` set. Preserves path, other params and hash. */
export function withMode(href: string, mode: Mode): string {
  const url = new URL(href, 'http://local');
  url.searchParams.set(MODE_QUERY, mode);
  return `${url.pathname}${url.search}${url.hash}`;
}

export async function transitionToMode(next: Mode): Promise<void> {
  const from = getCurrentMode();
  if (inFlight || from === next) return;
  inFlight = true;
  try {
    persistMode(next);
    await effect?.({ from: from ?? next, to: next });
    const target = withMode(window.location.href, next);
    if (navigate) navigate(target);
    else window.location.assign(target);
  } finally {
    inFlight = false;
  }
}
