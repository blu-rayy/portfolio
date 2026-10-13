import Link from 'next/link';
import type { Project } from '@/lib/content/schemas';
import { PlaceholderBadge, ProjectMeta } from '@/components/shared/blocks';
import { ProjectBody } from '@/components/shared/ProjectBody';
import { ModeSwitch } from '@/components/shared/ModeSwitch';

/** Clean-mode project detail page. */
export function CleanProject({ project }: { project: Project }) {
  return (
    <>
      <header className="flex items-center justify-between gap-4 p-4">
        <Link href="/" className="inline-flex items-center">
          ← All projects
        </Link>
        <ModeSwitch />
      </header>
      <main id="main" tabIndex={-1} className="mx-auto max-w-3xl px-4 pb-16">
        <article>
          <h1>
            {project.title}
            <PlaceholderBadge show={project.placeholder} />
          </h1>
          <p>{project.summary}</p>
          <ProjectMeta project={project} />
          <ProjectBody project={project} />
        </article>
      </main>
    </>
  );
}
