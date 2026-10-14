import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import {
  funCopySchema,
  skillsSchema,
  profileSchema,
  projectSchema,
  timelineSchema,
  type FunCopy,
  type Profile,
  type SkillGroup,
  type Project,
  type SiteContent,
  type TimelineEntry,
} from './schemas';

// Content is validated whenever it is loaded. Pages call these loaders at
// build time, so invalid frontmatter fails `next build` with a readable error.

const CONTENT_DIR = path.join(process.cwd(), 'content');

function readJson(file: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8'));
}

export function loadProjects(): Project[] {
  const dir = path.join(CONTENT_DIR, 'projects');
  const projects = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
      const parsed = projectSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(
          `Invalid frontmatter in content/projects/${file}:\n${parsed.error.message}`,
        );
      }
      if (`${parsed.data.slug}.mdx` !== file) {
        throw new Error(
          `content/projects/${file}: slug "${parsed.data.slug}" must match the filename`,
        );
      }
      return { ...parsed.data, body: content.trim() };
    })
    .sort((a, b) => a.episode - b.episode);

  const seen = new Set<number>();
  for (const p of projects) {
    if (seen.has(p.episode))
      throw new Error(`Duplicate project episode number: ${p.episode}`);
    seen.add(p.episode);
  }
  return projects;
}

export function loadProject(slug: string): Project | undefined {
  return loadProjects().find((p) => p.slug === slug);
}

export function loadTimeline(): TimelineEntry[] {
  const parsed = timelineSchema.safeParse(readJson('timeline.json'));
  if (!parsed.success)
    throw new Error(`Invalid content/timeline.json:\n${parsed.error.message}`);
  return [...parsed.data].sort((a, b) => b.date.localeCompare(a.date));
}

export function loadProfile(): Profile {
  const parsed = profileSchema.safeParse(readJson('profile.json'));
  if (!parsed.success)
    throw new Error(`Invalid content/profile.json:\n${parsed.error.message}`);
  return parsed.data;
}

export function loadSkills(): SkillGroup[] {
  const parsed = skillsSchema.safeParse(readJson('skills.json'));
  if (!parsed.success)
    throw new Error(`Invalid content/skills.json:\n${parsed.error.message}`);
  return parsed.data;
}

export function loadFunCopy(): FunCopy {
  const parsed = funCopySchema.safeParse(readJson('fun.json'));
  if (!parsed.success)
    throw new Error(`Invalid content/fun.json:\n${parsed.error.message}`);
  return parsed.data;
}

export function loadSiteContent(): SiteContent {
  return {
    profile: loadProfile(),
    projects: loadProjects(),
    timeline: loadTimeline(),
    skills: loadSkills(),
    fun: loadFunCopy(),
  };
}
