import type { Profile, Project, SkillGroup, TimelineEntry } from '@/lib/content/schemas';

// Unstyled content blocks used by BOTH renderers so a field can never exist in
// only one mode. Anything that varies by mode (links vs window buttons) lives in
// components/fun and components/clean.

export function PlaceholderBadge({ show }: { show: boolean }) {
  return show ? <span data-placeholder> (placeholder)</span> : null;
}

export function ProfileBlock({ profile }: { profile: Profile }) {
  return (
    <div>
      <p>{profile.tagline}</p>
      <p>{profile.bio}</p>
      <dl>
        <dt>Currently</dt>
        <dd>{profile.currently}</dd>
        <dt>Open to</dt>
        <dd>{profile.openTo.join(', ')}</dd>
        <dt>Location</dt>
        <dd>{profile.location}</dd>
      </dl>
    </div>
  );
}

export function ContactBlock({ profile }: { profile: Profile }) {
  return (
    <ul>
      {profile.socials.map((s) => (
        <li key={s.url}>
          <a href={s.url} rel="noopener noreferrer" className="inline-block py-3">
            {s.label}
          </a>
        </li>
      ))}
      <li>
        <a href={profile.resume} className="inline-block py-3">
          Résumé
        </a>
      </li>
    </ul>
  );
}

export function TimelineBlock({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol>
      {entries.map((e) => (
        <li key={`${e.date}-${e.org}-${e.role}`}>
          <time dateTime={e.date}>{e.date}</time> — <strong>{e.role}</strong>, {e.org}
          <p>{e.description}</p>
        </li>
      ))}
    </ol>
  );
}

export function ProjectMeta({ project }: { project: Project }) {
  const { links } = project;
  return (
    <>
      <p>
        Episode {project.episode} · {project.status} ·{' '}
        <time dateTime={project.date}>{project.date}</time>
        {project.featured ? ' · featured' : ''}
      </p>
      <p>Stack: {project.stack.join(', ')}</p>
      <ul>
        {links.github && (
          <li>
            <a
              href={links.github}
              rel="noopener noreferrer"
              className="inline-block py-3"
            >
              GitHub
            </a>
          </li>
        )}
        {links.live && (
          <li>
            <a href={links.live} rel="noopener noreferrer" className="inline-block py-3">
              Live site
            </a>
          </li>
        )}
        {links.caseStudy && (
          <li>
            <a
              href={links.caseStudy}
              rel="noopener noreferrer"
              className="inline-block py-3"
            >
              Case study
            </a>
          </li>
        )}
      </ul>
    </>
  );
}

export function SkillsBlock({ groups }: { groups: SkillGroup[] }) {
  return (
    <div>
      {groups.map((g) => (
        <section key={g.group} aria-label={g.group}>
          <h3 className="section-label">
            {g.group}
            <PlaceholderBadge show={g.placeholder} />
          </h3>
          <ul className="chips">
            {g.items.map((item) => (
              <li key={item}>
                <span className="chip">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
