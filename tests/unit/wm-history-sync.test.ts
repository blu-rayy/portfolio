import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { attachHistorySync, resetHistorySyncForTests } from '@/lib/wm/history-sync';
import { createWMStore, type WMStore } from '@/lib/wm/store';

const SLUGS = ['alpha', 'beta'];
const tick = () => new Promise((r) => setTimeout(r, 20));

let store: WMStore;
let detach: () => void;

function attach() {
  detach = attachHistorySync(store, { projectSlugs: SLUGS });
}

beforeEach(() => {
  resetHistorySyncForTests();
  window.history.replaceState(null, '', '/');
  store = createWMStore();
});
afterEach(() => detach?.());

const open = (id: string) => store.getState().dispatch({ type: 'open', id });
const ids = () => Object.keys(store.getState().windows);

describe('history sync', () => {
  it('opens the window described by the initial URL', () => {
    window.history.replaceState(null, '', '/work/alpha');
    attach();
    expect(store.getState().focusedId).toBe('project:alpha');
  });

  it('ignores unknown windows in the URL', () => {
    window.history.replaceState(null, '', '/work/nope');
    attach();
    expect(ids()).toEqual([]);
  });

  it('opening pushes a history entry and updates the URL', () => {
    attach();
    const before = window.history.length;
    open('me');
    expect(window.location.search).toBe('?window=me');
    expect(window.history.length).toBe(before + 1);
  });

  it('back closes the window that was opened', async () => {
    attach();
    open('me');
    window.history.back();
    await tick();
    expect(ids()).toEqual([]);
    expect(window.location.search).toBe('');
  });

  it('back closes only the most recent window; forward re-opens it', async () => {
    attach();
    open('me');
    open('works');
    window.history.back();
    await tick();
    expect(ids()).toEqual(['me']);
    expect(store.getState().focusedId).toBe('me');
    window.history.forward();
    await tick();
    expect(store.getState().focusedId).toBe('works');
    expect(ids().sort()).toEqual(['me', 'works']);
  });

  it('requestClose goes through history when the entry opened that window', async () => {
    attach();
    open('me');
    store.getState().requestClose('me');
    await tick();
    expect(ids()).toEqual([]);
    expect(window.location.search).toBe('');
  });

  it('closing a window that is not the latest entry fixes the URL', async () => {
    attach();
    open('me');
    open('works');
    store.getState().requestClose('me');
    expect(store.getState().focusedId).toBe('works');
    window.history.back();
    await tick();
    // The entry we went back onto pointed at the now-closed "about" window.
    expect(ids()).toEqual([]);
    expect(window.location.search).toBe('');
  });

  it('focus changes replace instead of pushing', () => {
    attach();
    open('me');
    open('works');
    const len = window.history.length;
    store.getState().dispatch({ type: 'focus', id: 'me' });
    expect(window.history.length).toBe(len);
    expect(window.location.search).toBe('?window=me');
  });
});
