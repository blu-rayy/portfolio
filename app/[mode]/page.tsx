import { CleanSite } from '@/components/clean/CleanSite';
import { FunDesktop } from '@/components/fun/FunDesktop';
import { ProjectBody } from '@/components/shared/ProjectBody';
import { loadSiteContent } from '@/lib/content/load';
import { parseMode } from '@/lib/mode/mode';

export default async function HomePage({
  params,
}: {
  params: Promise<{ mode: string }>;
}) {
  const mode = parseMode((await params).mode);
  const content = loadSiteContent();

  if (mode === 'clean') return <CleanSite content={content} />;

  const bodies = Object.fromEntries(
    content.projects.map((p) => [p.slug, <ProjectBody key={p.slug} project={p} />]),
  );
  return <FunDesktop content={content} bodies={bodies} />;
}
