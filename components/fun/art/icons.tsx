// Dock / app icons: 1.6px ink stroke on a 24px grid, no fills (Foundations §04).
import type { StaticWindowId } from '@/lib/wm/windows';

const PATHS: Record<StaticWindowId | 'project', React.ReactNode> = {
  welcome: <path d="M4 5h16v12H4zM9 21h6M12 17v4" />,
  works: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="1" />
      <path d="M8 2l4 4 4-4" />
    </>
  ),
  me: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h5" />
      <circle cx="15" cy="16" r="2" />
    </>
  ),
  skills: (
    <>
      <rect x="3" y="8" width="18" height="12" rx="1" />
      <path d="M8 8V5h8v3M3 13h18M11 12v2h2v-2" />
    </>
  ),
  guestbook: (
    <>
      <path d="M5 3h12l2 2v16H5z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </>
  ),
  contact: (
    <>
      <path d="M3 6h18v12H3z" />
      <path d="M3 6l9 7 9-7" />
    </>
  ),
  project: (
    <>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M15 3v4h4M9 12h7M9 15h7M9 18h4" />
    </>
  ),
};

export function AppIcon({
  id,
  size = 26,
}: {
  id: StaticWindowId | 'project';
  size?: number;
}) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[id]}
    </svg>
  );
}

export function SunGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="4" fill="var(--orange)" />
      <path
        d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6L13 13M3 13l1.4-1.4M11.6 4.4L13 3"
        stroke="var(--orange)"
        strokeWidth="1.5"
      />
    </svg>
  );
}
