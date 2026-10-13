import Link from 'next/link';
import type { SiteContent } from '@/lib/content/schemas';
import {
  ContactBlock,
  PlaceholderBadge,
  ProfileBlock,
  ProjectMeta,
  TimelineBlock,
} from '@/components/shared/blocks';
import { CleanNav } from './CleanNav';

const NAV = [
  { href: '#about', label: 'About' },
  { href: '#projects', label: 'Projects' },
  { href: '#timeline', label: 'Timeline' },
  { href: '#contact', label: 'Contact' },
];

/** Clean mode: a stacked, single-column page. Mobile-first. */
export function CleanSite({ content }: { content: SiteContent }) {
  const { profile, projects, timeline } = content;
  return (
    <>
      <CleanNav name={profile.name} links={NAV} />
      <main id="main" tabIndex={-1} className="mx-auto max-w-3xl px-4 pb-16">
        <section id="about" aria-labelledby="about-h" className="scroll-mt-20 py-6">
          <h1 id="about-h">
            {profile.name}
            <PlaceholderBadge show={profile.placeholder} />
          </h1>
          <ProfileBlock profile={profile} />
        </section>

        <section id="projects" aria-labelledby="projects-h" className="scroll-mt-20 py-6">
          <h2 id="projects-h">Projects</h2>
          <ul>
            {projects.map((p) => (
              <li key={p.slug}>
                <article>
                  <h3>
                    <Link
                      href={`/work/${p.slug}`}
                      className="inline-flex items-center py-2"
                    >
                      {p.title}
                    </Link>
                  </h3>
                  <p>{p.summary}</p>
                  <ProjectMeta project={p} />
                </article>
              </li>
            ))}
          </ul>
        </section>

        <section id="timeline" aria-labelledby="timeline-h" className="scroll-mt-20 py-6">
          <h2 id="timeline-h">Timeline</h2>
          <TimelineBlock entries={timeline} />
        </section>

        <section id="contact" aria-labelledby="contact-h" className="scroll-mt-20 py-6">
          <h2 id="contact-h">Contact</h2>
          <ContactBlock profile={profile} />
        </section>
      </main>
      <footer className="p-4">
        <small>© {profile.name}</small>
      </footer>
    </>
  );
}
