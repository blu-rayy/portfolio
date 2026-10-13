import { describe, expect, it } from 'vitest';
import {
  clampPosition,
  createInitialState,
  wmReducer,
  type WMAction,
  type WMState,
} from '@/lib/wm/reducer';
import { selectRenderedWindowIds } from '@/lib/wm/selectors';

const run = (actions: WMAction[], from: WMState = createInitialState()) =>
  actions.reduce(wmReducer, from);

const open = (
  id: string,
  extra: Partial<Extract<WMAction, { type: 'open' }>> = {},
): WMAction => ({
  type: 'open',
  id,
  ...extra,
});

describe('open', () => {
  it('adds a focused window on top', () => {
    const s = run([open('a'), open('b')]);
    expect(Object.keys(s.windows)).toEqual(['a', 'b']);
    expect(s.order).toEqual(['a', 'b']);
    expect(s.focusedId).toBe('b');
  });

  it('cascades default positions', () => {
    const s = run([open('a'), open('b')]);
    expect(s.windows.b!.x).toBeGreaterThan(s.windows.a!.x);
    expect(s.windows.b!.y).toBeGreaterThan(s.windows.a!.y);
  });

  it('re-opening raises and restores instead of duplicating', () => {
    const s = run([open('a'), open('b'), { type: 'minimize', id: 'a' }, open('a')]);
    expect(s.order).toEqual(['b', 'a']);
    expect(s.windows.a!.minimized).toBe(false);
    expect(s.focusedId).toBe('a');
    expect(Object.keys(s.windows)).toHaveLength(2);
  });

  it('clamps an explicit position into the viewport', () => {
    const s = run([open('a', { x: 5000, y: 5000, width: 400, height: 300 })]);
    const v = s.viewport;
    expect(s.windows.a!.x).toBe(v.width - 400);
    expect(s.windows.a!.y).toBe(v.height - v.insetBottom - 300);
  });
});

describe('close', () => {
  it('removes the window and focuses the next topmost', () => {
    const s = run([open('a'), open('b'), open('c'), { type: 'close', id: 'c' }]);
    expect(s.order).toEqual(['a', 'b']);
    expect(s.focusedId).toBe('b');
  });

  it('skips minimized windows when choosing the next focus', () => {
    const s = run([
      open('a'),
      open('b'),
      open('c'),
      { type: 'minimize', id: 'b' },
      { type: 'close', id: 'c' },
    ]);
    expect(s.focusedId).toBe('a');
  });

  it('leaves focus alone when closing an unfocused window', () => {
    const s = run([open('a'), open('b'), { type: 'close', id: 'a' }]);
    expect(s.focusedId).toBe('b');
  });

  it('clears focus when the last window closes', () => {
    const s = run([open('a'), { type: 'close', id: 'a' }]);
    expect(s.focusedId).toBeNull();
    expect(s.order).toEqual([]);
  });

  it('is a no-op for unknown ids (same reference)', () => {
    const s = run([open('a')]);
    expect(wmReducer(s, { type: 'close', id: 'zzz' })).toBe(s);
  });
});

describe('focus', () => {
  it('raises the window to the top of the z-order', () => {
    const s = run([open('a'), open('b'), open('c'), { type: 'focus', id: 'a' }]);
    expect(s.order).toEqual(['b', 'c', 'a']);
    expect(s.focusedId).toBe('a');
  });

  it('is a no-op when already focused and on top', () => {
    const s = run([open('a'), open('b')]);
    expect(wmReducer(s, { type: 'focus', id: 'b' })).toBe(s);
  });

  it('ignores minimized and unknown windows', () => {
    const s = run([open('a'), open('b'), { type: 'minimize', id: 'a' }]);
    expect(wmReducer(s, { type: 'focus', id: 'a' })).toBe(s);
    expect(wmReducer(s, { type: 'focus', id: 'nope' })).toBe(s);
  });
});

describe('minimize / restore', () => {
  it('minimizing the focused window focuses the next visible one', () => {
    const s = run([open('a'), open('b'), { type: 'minimize', id: 'b' }]);
    expect(s.windows.b!.minimized).toBe(true);
    expect(s.focusedId).toBe('a');
  });

  it('minimizing the only window leaves nothing focused but keeps it open', () => {
    const s = run([open('a'), { type: 'minimize', id: 'a' }]);
    expect(s.focusedId).toBeNull();
    expect(s.windows.a).toBeDefined();
  });

  it('restore un-minimizes, raises and focuses', () => {
    const s = run([
      open('a'),
      open('b'),
      { type: 'minimize', id: 'a' },
      { type: 'restore', id: 'a' },
    ]);
    expect(s.windows.a!.minimized).toBe(false);
    expect(s.order.at(-1)).toBe('a');
    expect(s.focusedId).toBe('a');
  });
});

describe('move', () => {
  it('moves and clamps to the viewport', () => {
    const s = run([
      {
        type: 'setViewport',
        viewport: { width: 1000, height: 700, insetTop: 40, insetBottom: 60 },
      },
      open('a', { width: 200, height: 100 }),
      { type: 'move', id: 'a', x: -50, y: -50 },
    ]);
    expect(s.windows.a).toMatchObject({ x: 0, y: 40 });
    const s2 = wmReducer(s, { type: 'move', id: 'a', x: 9999, y: 9999 });
    expect(s2.windows.a).toMatchObject({ x: 800, y: 700 - 60 - 100 });
  });

  it('does not change z-order or focus', () => {
    const s = run([open('a'), open('b'), { type: 'move', id: 'a', x: 100, y: 100 }]);
    expect(s.order).toEqual(['a', 'b']);
    expect(s.focusedId).toBe('b');
  });
});

describe('viewport', () => {
  it('re-clamps every window when the viewport shrinks', () => {
    const s = run([
      open('a', { x: 700, y: 500, width: 300, height: 200 }),
      { type: 'setViewport', viewport: { width: 500, height: 400 } },
    ]);
    expect(s.windows.a).toMatchObject({ x: 200, y: 200 });
  });

  it('pins windows larger than the viewport to the top-left', () => {
    expect(
      clampPosition(100, 100, 900, 900, {
        width: 400,
        height: 400,
        insetTop: 30,
        insetBottom: 0,
      }),
    ).toEqual({
      x: 0,
      y: 30,
    });
  });

  it('returns the same state when nothing changes', () => {
    const s = run([open('a')]);
    expect(
      wmReducer(s, { type: 'setViewport', viewport: { width: s.viewport.width } }),
    ).toBe(s);
  });
});

describe('compact layout', () => {
  const compact = (extra: WMAction[] = []) =>
    run([{ type: 'setLayout', layout: 'compact' }, ...extra]);

  it('renders only the focused window', () => {
    const s = compact([open('a'), open('b'), open('c')]);
    expect(selectRenderedWindowIds(s)).toEqual(['c']);
    // The others are still in state.
    expect(Object.keys(s.windows)).toHaveLength(3);
  });

  it('opening a window while another is open switches to it and keeps the first', () => {
    const s = compact([open('a'), open('b')]);
    expect(s.focusedId).toBe('b');
    expect(s.windows.a).toBeDefined();
    expect(selectRenderedWindowIds(s)).toEqual(['b']);
  });

  it('closing the focused window reveals the previous one (back-button behaviour)', () => {
    const s = compact([open('a'), open('b'), { type: 'close', id: 'b' }]);
    expect(selectRenderedWindowIds(s)).toEqual(['a']);
  });

  it('renders nothing (home screen) when everything is minimized or closed', () => {
    const s = compact([open('a'), { type: 'minimize', id: 'a' }]);
    expect(selectRenderedWindowIds(s)).toEqual([]);
  });

  it('switching layouts with windows open loses nothing', () => {
    const windowed = run([open('a'), open('b'), open('c'), { type: 'focus', id: 'a' }]);
    const toCompact = wmReducer(windowed, { type: 'setLayout', layout: 'compact' });
    expect(toCompact.windows).toBe(windowed.windows);
    expect(toCompact.order).toEqual(windowed.order);
    expect(toCompact.focusedId).toBe('a');
    expect(selectRenderedWindowIds(toCompact)).toEqual(['a']);

    const back = wmReducer(toCompact, { type: 'setLayout', layout: 'windowed' });
    expect(selectRenderedWindowIds(back)).toEqual(['b', 'c', 'a']);
    expect(back.focusedId).toBe('a');
  });

  it('resizing while compact still re-clamps hidden windows', () => {
    const s = compact([
      open('a', { x: 600, y: 300, width: 300, height: 200 }),
      open('b'),
      { type: 'setViewport', viewport: { width: 390, height: 700 } },
    ]);
    expect(s.windows.a!.x).toBe(90);
  });
});
