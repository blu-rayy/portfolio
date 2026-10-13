import { z } from 'zod';

const isoDate = z.iso.date();
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be kebab-case');

export const PROJECT_STATUSES = ['shipped', 'in-progress', 'coursework'] as const;

export const projectSchema = z.object({
  title: z.string().min(1),
  slug,
  summary: z.string().min(1),
  status: z.enum(PROJECT_STATUSES),
  date: isoDate,
  stack: z.array(z.string().min(1)).min(1),
  featured: z.boolean().default(false),
  episode: z.number().int().positive(),
  links: z
    .object({
      github: z.url().optional(),
      live: z.url().optional(),
      caseStudy: z.url().optional(),
    })
    .default({}),
  /** Marks sample content that must be replaced before launch. */
  placeholder: z.boolean().default(false),
});

export const timelineEntrySchema = z.object({
  date: z.string().regex(/^\d{4}(-\d{2})?$/, 'use YYYY or YYYY-MM'),
  role: z.string().min(1),
  org: z.string().min(1),
  description: z.string().min(1),
  placeholder: z.boolean().default(false),
});
export const timelineSchema = z.array(timelineEntrySchema).min(1);

export const profileSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().min(1),
  bio: z.string().min(1),
  currently: z.string().min(1),
  openTo: z.array(z.string().min(1)),
  location: z.string().min(1),
  socials: z.array(z.object({ label: z.string().min(1), url: z.url() })),
  resume: z.string().startsWith('/'),
  placeholder: z.boolean().default(false),
});

export type ProjectFrontmatter = z.infer<typeof projectSchema>;
export type Project = ProjectFrontmatter & { body: string };
export type TimelineEntry = z.infer<typeof timelineEntrySchema>;
export type Profile = z.infer<typeof profileSchema>;

/** Everything the two renderers need. Plain, serializable data only. */
export interface SiteContent {
  profile: Profile;
  projects: Project[];
  timeline: TimelineEntry[];
}
