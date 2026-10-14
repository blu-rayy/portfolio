import { describe, expect, it } from 'vitest';
import {
  isKnownWindowId,
  projectWindowId,
  urlForWindow,
  windowDefaultsFor,
  windowIdFromLocation,
} from '@/lib/wm/windows';

describe('window <-> url mapping', () => {
  it('parses ?window= on the root path', () => {
    expect(windowIdFromLocation('/', '?window=works')).toBe('works');
    expect(windowIdFromLocation('/', '?window=bogus')).toBeNull();
    expect(windowIdFromLocation('/', '')).toBeNull();
    expect(windowIdFromLocation('/', '?window=welcome')).toBe('welcome');
  });

  it('parses /work/[slug]', () => {
    expect(windowIdFromLocation('/work/first-project', '')).toBe('project:first-project');
    expect(windowIdFromLocation('/work/first-project/', '')).toBe(
      'project:first-project',
    );
    expect(windowIdFromLocation('/work', '')).toBeNull();
  });

  it('builds urls and preserves other params', () => {
    expect(urlForWindow(null)).toBe('/');
    // The home window lives at the bare root.
    expect(urlForWindow('welcome')).toBe('/');
    expect(urlForWindow('welcome', '?mode=fun&window=me')).toBe('/?mode=fun');
    expect(urlForWindow('me')).toBe('/?window=me');
    expect(urlForWindow(projectWindowId('x-y'))).toBe('/work/x-y');
    expect(urlForWindow('me', '?mode=fun')).toBe('/?mode=fun&window=me');
    expect(urlForWindow(null, '?window=me&mode=fun')).toBe('/?mode=fun');
    expect(urlForWindow('project:p', '?mode=fun&window=me')).toBe('/work/p?mode=fun');
  });

  it('knows which ids are valid', () => {
    expect(isKnownWindowId('me', [])).toBe(true);
    expect(isKnownWindowId('project:a', ['a'])).toBe(true);
    expect(isKnownWindowId('project:b', ['a'])).toBe(false);
  });

  it('has defaults for every window', () => {
    expect(windowDefaultsFor('welcome').anchor).toEqual({ x: 0.5, y: 0.5 });
    expect(windowDefaultsFor('project:x').anchor).toBeNull();
  });

  it('spreads the static windows around the desktop', () => {
    const anchors = ['welcome', 'works', 'me', 'skills', 'guestbook', 'contact'].map(
      (id) => JSON.stringify(windowDefaultsFor(id).anchor),
    );
    expect(new Set(anchors).size).toBe(anchors.length);
  });
});

describe('store defaults', () => {
  it('fills in size and placement for known windows; explicit values win', async () => {
    const { withDefaults } = await import('@/lib/wm/store');
    expect(withDefaults({ type: 'open', id: 'works' })).toMatchObject({
      width: 900,
      anchor: { x: 0.12, y: 0.15 },
    });
    const placed = withDefaults({ type: 'open', id: 'works', x: 5, y: 5 });
    expect(placed).not.toHaveProperty('anchor', expect.anything());
    expect(withDefaults({ type: 'open', id: 'works', width: 10 })).toMatchObject({
      width: 10,
    });
  });
});
