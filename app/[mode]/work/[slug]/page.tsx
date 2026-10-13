import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CleanProject } from '@/components/clean/CleanProject';
import { FunDesktop } from '@/components/fun/FunDesktop';
import { ProjectBody } from '@/components/shared/ProjectBody';
import { loadProject, loadProjects, loadSiteContent } from '@/lib/content/load';
import { MODES, parseMode } from '@/lib/mode/mode';
import { projectWindowId } from '@/lib/wm/windows';

type Params = Promise<{ mode: string; slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return MODES.flatMap((mode) => loadProjects().map((p) => ({ mode, slug: p.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const project = loadProject((await params).slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: { title: project.title, description: project.summary, type: 'article' },
  };
}

export default async function WorkPage({ params }: { params: Params }) {
  const { mode: rawMode, slug } = await params;
  const mode = parseMode(rawMode);
  const project = loadProject(slug);
  if (!project) notFound();

  if (mode === 'clean') return <CleanProject project={project} />;

  const content = loadSiteContent();
  const bodies = Object.fromEntries(
    content.projects.map((p) => [p.slug, <ProjectBody key={p.slug} project={p} />]),
  );
  return (
    <FunDesktop
      content={content}
      bodies={bodies}
      initialWindowId={projectWindowId(slug)}
    />
  );
}
