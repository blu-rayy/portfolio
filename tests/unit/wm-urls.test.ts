import { describe, expect, it } from 'vitest';
import {
  isKnownWindowId,
  projectWindowId,
  urlForWindow,
  windowIdFromLocation,
} from '@/lib/wm/windows';

describe('window <-> url mapping', () => {
  it('parses ?window= on the root path', () => {
    expect(windowIdFromLocation('/', '?window=episodes')).toBe('episodes');
    expect(windowIdFromLocation('/', '?window=bogus')).toBeNull();
    expect(windowIdFromLocation('/', '')).toBeNull();
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
    expect(urlForWindow('about')).toBe('/?window=about');
    expect(urlForWindow(projectWindowId('x-y'))).toBe('/work/x-y');
    expect(urlForWindow('about', '?mode=fun')).toBe('/?mode=fun&window=about');
    expect(urlForWindow(null, '?window=about&mode=fun')).toBe('/?mode=fun');
    expect(urlForWindow('project:p', '?mode=fun&window=about')).toBe('/work/p?mode=fun');
  });

  it('knows which ids are valid', () => {
    expect(isKnownWindowId('about', [])).toBe(true);
    expect(isKnownWindowId('project:a', ['a'])).toBe(true);
    expect(isKnownWindowId('project:b', ['a'])).toBe(false);
  });
});
