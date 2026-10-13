import { MDXRemote } from 'next-mdx-remote/rsc';
import type { Project } from '@/lib/content/schemas';

/** Server component: compiles a project's MDX body. */
export function ProjectBody({ project }: { project: Project }) {
  return <MDXRemote source={project.body} />;
}
