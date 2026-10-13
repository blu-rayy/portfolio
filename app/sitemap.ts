import type { MetadataRoute } from 'next';
import { loadProjects } from '@/lib/content/load';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, priority: 1 },
    ...loadProjects().map((p) => ({
      url: `${SITE_URL}/work/${p.slug}`,
      lastModified: p.date,
      priority: 0.7,
    })),
  ];
}
