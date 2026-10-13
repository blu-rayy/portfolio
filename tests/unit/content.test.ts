import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { loadProfile, loadProjects, loadTimeline } from '@/lib/content/load';
import { projectSchema } from '@/lib/content/schemas';

describe('content', () => {
  it('loads and validates every collection', () => {
    expect(loadProfile().name).toBeTruthy();
    expect(loadProjects().length).toBeGreaterThanOrEqual(2);
    expect(loadTimeline().length).toBeGreaterThanOrEqual(2);
  });

  it('orders projects by episode', () => {
    const eps = loadProjects().map((p) => p.episode);
    expect(eps).toEqual([...eps].sort((a, b) => a - b));
  });

  it('rejects invalid frontmatter', () => {
    const r = projectSchema.safeParse({ title: 'x', slug: 'Not Kebab', status: 'nope' });
    expect(r.success).toBe(false);
  });
});
