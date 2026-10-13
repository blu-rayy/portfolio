import type { WMStore } from './store';
import { isKnownWindowId, urlForWindow, windowIdFromLocation } from './windows';

// Keeps the browser history stack and the window manager in step.
//
// Model: every history entry we create records the window it *opened*
// (`state.wm.opened`) and its position (`state.wm.idx`). Going back past an
// entry closes the window it opened; going forward past it opens it again.
// That is what makes Android back / iOS swipe-back close the top window
// instead of leaving the site.
//
// Focus changes that don't open anything use replaceState, so they never add
// history entries.

interface Entry {
  idx: number;
  opened: string | null;
}

const KEY = 'wm';

function readEntry(state: unknown): Entry | null {
  const wm = (state as Record<string, unknown> | null)?.[KEY] as Entry | undefined;
  return wm && typeof wm.idx === 'number' ? wm : null;
}

function withEntry(state: unknown, entry: Entry): Record<string, unknown> {
  // Preserve whatever the framework stored in history.state.
  return { ...((state as Record<string, unknown> | null) ?? {}), [KEY]: entry };
}

export interface HistorySyncOptions {
  /** Project slugs, used to ignore unknown ids in URLs. */
  projectSlugs: readonly string[];
  win?: Window;
}

// Survives re-attachment (the desktop remounts when Next navigates between pages).
let lastEntry: Entry | null = null;

export function attachHistorySync(store: WMStore, opts: HistorySyncOptions): () => void {
  const win = opts.win ?? window;
  const { history, location } = win;
  const isKnown = (id: string | null): id is string =>
    id !== null && isKnownWindowId(id, opts.projectSlugs);

  // Set while we are applying a change that came *from* the URL, so the store
  // subscription below doesn't push the same change back into history.
  let applying = false;
  const apply = (fn: () => void) => {
    applying = true;
    try {
      fn();
    } finally {
      applying = false;
    }
  };

  const currentEntry = (): Entry =>
    lastEntry ?? readEntry(history.state) ?? { idx: 0, opened: null };

  // --- init: adopt the current URL ------------------------------------------
  const initialId = windowIdFromLocation(location.pathname, location.search);
  apply(() => {
    if (isKnown(initialId) && !store.getState().windows[initialId]) {
      store.getState().dispatch({ type: 'open', id: initialId });
    }
  });
  const fromHistory = readEntry(history.state);
  lastEntry = fromHistory ?? { idx: 0, opened: null };
  if (!fromHistory) history.replaceState(withEntry(history.state, lastEntry), '');

  // --- store -> history -------------------------------------------------------
  let prev = store.getState();
  const unsubscribe = store.subscribe((state) => {
    const before = prev;
    prev = state;
    if (applying) return;

    const openedId = Object.keys(state.windows).find((id) => !(id in before.windows));
    const url = urlForWindow(state.focusedId, location.search);

    if (openedId) {
      const entry: Entry = { idx: currentEntry().idx + 1, opened: openedId };
      lastEntry = entry;
      history.pushState(withEntry(history.state, entry), '', url);
    } else if (state.focusedId !== before.focusedId) {
      history.replaceState(withEntry(history.state, currentEntry()), '', url);
    }
  });

  // UI close: if the current entry opened this window, go back so history and
  // state stay in lock-step; otherwise just close it and fix up the URL.
  const originalRequestClose = store.getState().requestClose;
  store.setState({
    requestClose: (id) => {
      if (currentEntry().opened === id && currentEntry().idx > 0) {
        history.back();
      } else {
        store.getState().dispatch({ type: 'close', id });
      }
    },
  });

  // --- history -> store ---------------------------------------------------
  const onPopState = (event: PopStateEvent) => {
    const from = currentEntry();
    const to = readEntry(event.state) ?? { idx: 0, opened: null };
    lastEntry = to;

    apply(() => {
      const { dispatch, windows } = store.getState();
      if (to.idx < from.idx) {
        if (from.opened && windows[from.opened])
          dispatch({ type: 'close', id: from.opened });
      } else if (to.idx > from.idx) {
        if (isKnown(to.opened)) dispatch({ type: 'open', id: to.opened });
      }

      // The URL must describe the focused window; correct it if it drifted
      // (e.g. we went back onto an entry whose window was already closed).
      const state = store.getState();
      const urlId = windowIdFromLocation(location.pathname, location.search);
      if (urlId && state.windows[urlId] && urlId !== state.focusedId) {
        dispatch({ type: 'focus', id: urlId });
      }
      const focused = store.getState().focusedId;
      if (windowIdFromLocation(location.pathname, location.search) !== focused) {
        history.replaceState(
          withEntry(history.state, lastEntry!),
          '',
          urlForWindow(focused, location.search),
        );
      }
      prev = store.getState();
    });
  };
  win.addEventListener('popstate', onPopState);

  return () => {
    win.removeEventListener('popstate', onPopState);
    unsubscribe();
    store.setState({ requestClose: originalRequestClose });
  };
}

/** Test helper: forget remembered history position between tests. */
export function resetHistorySyncForTests(): void {
  lastEntry = null;
}
