'use client';

import { useState, type ReactNode } from 'react';
import type { Project, SiteContent } from '@/lib/content/schemas';
import { PROJECT_STATUSES } from '@/lib/content/schemas';
import {
  ContactBlock,
  PlaceholderBadge,
  ProfileBlock,
  ProjectMeta,
  SkillsBlock,
  TimelineBlock,
} from '@/components/shared/blocks';
import { projectWindowId } from '@/lib/wm/windows';

// What lives inside each window's white panel. Copy comes from /content.

type Open = (id: string) => void;

/** A real link (middle-click, copy address) upgraded to open a window. */
function WindowLink({
  href,
  windowId,
  open,
  className,
  children,
}: {
  href: string;
  windowId: string;
  open: Open;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        open(windowId);
      }}
    >
      {children}
    </a>
  );
}

export function WelcomeContent({
  content,
  open,
  headingLevel = 1,
}: {
  content: SiteContent;
  open: Open;
  /** The phone home card and the desktop window both carry the page's h1. */
  headingLevel?: 1 | 2;
}) {
  const { fun, profile } = content;
  const H = headingLevel === 1 ? 'h1' : 'h2';
  return (
    <div className="well-pad">
      <div className="welcome-top">
        <H className="welcome-h1">
          {fun.welcome.greeting}
          <em>{fun.welcome.headline}</em>
        </H>
        <div className="polaroid">
          <div className="polaroid-img">{fun.welcome.photoAlt}</div>
        </div>
      </div>
      <p className="welcome-intro">{fun.welcome.intro}</p>
      <p className="sr-only">
        {profile.name}. {profile.tagline}
        <PlaceholderBadge show={profile.placeholder} />
      </p>
      <div className="btn-row">
        <WindowLink
          href="/?window=works"
          windowId="works"
          open={open}
          className="btn btn-primary"
        >
          {fun.welcome.buttons.works}
        </WindowLink>
        <WindowLink
          href="/?window=me"
          windowId="me"
          open={open}
          className="btn max-lg:hidden"
        >
          {fun.welcome.buttons.me}
        </WindowLink>
        <WindowLink
          href="/?window=contact"
          windowId="contact"
          open={open}
          className="btn"
        >
          {fun.welcome.buttons.contact}
        </WindowLink>
      </div>
    </div>
  );
}

const STATUS_LABEL: Record<Project['status'], string> = {
  shipped: 'shipped',
  'in-progress': 'in progress',
  coursework: 'school',
};

export function WorksContent({ content, open }: { content: SiteContent; open: Open }) {
  const [filter, setFilter] = useState<Project['status'] | 'all'>('all');
  const shown = [...content.projects]
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((p) => filter === 'all' || p.status === filter);
  const filters = ['all', ...PROJECT_STATUSES] as const;

  return (
    <div className="well-pad">
      <div role="group" aria-label="Filter works" className="tabs">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            className="tab"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : STATUS_LABEL[f]}
          </button>
        ))}
      </div>
      <p className="works-intro">{content.fun.worksIntro}</p>
      <ul aria-label="Works">
        {shown.map((p) => (
          <li key={p.slug}>
            <WindowLink
              href={`/work/${p.slug}`}
              windowId={projectWindowId(p.slug)}
              open={open}
              className="work-row"
            >
              <span className="work-thumb" aria-hidden="true">
                ep. {String(p.episode).padStart(2, '0')}
              </span>
              <span className="min-w-0">
                <span className="work-title">{p.title}</span>
                <span className="work-summary">{p.summary}</span>
                <span className="work-meta">
                  <span className={`status status-${p.status}`}>
                    {STATUS_LABEL[p.status]}
                  </span>
                  <time dateTime={p.date}>{p.date.slice(0, 7)}</time>
                  <span>{p.stack.join(' · ')}</span>
                </span>
              </span>
            </WindowLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MeContent({ content }: { content: SiteContent }) {
  const { profile, timeline } = content;
  return (
    <div className="well-pad">
      <h2>
        {profile.name}
        <PlaceholderBadge show={profile.placeholder} />
      </h2>
      <ProfileBlock profile={profile} />
      <h3 className="section-label">Timeline</h3>
      <TimelineBlock entries={timeline} />
    </div>
  );
}

export function SkillsContent({ content }: { content: SiteContent }) {
  return (
    <div className="well-pad">
      <SkillsBlock groups={content.skills} />
    </div>
  );
}

export function GuestbookContent({ content }: { content: SiteContent }) {
  return (
    <div className="well-pad">
      <p>{content.fun.guestbook}</p>
    </div>
  );
}

export function ContactContent({ content }: { content: SiteContent }) {
  return (
    <div className="well-pad">
      <ContactBlock profile={content.profile} />
    </div>
  );
}

export function ProjectContent({ project, body }: { project: Project; body: ReactNode }) {
  return (
    <article className="well-pad">
      <p>
        {project.summary}
        <PlaceholderBadge show={project.placeholder} />
      </p>
      <ProjectMeta project={project} />
      {body}
    </article>
  );
}
