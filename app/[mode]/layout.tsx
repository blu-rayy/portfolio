import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { ModeRoot } from '@/components/shared/ModeRoot';
import { loadProfile } from '@/lib/content/load';
import { MODES, parseMode } from '@/lib/mode/mode';
import { SITE_URL } from '@/lib/site';
import '@/styles/globals.css';

// The mode is a route segment: `proxy.ts` rewrites every request to /fun/* or
// /clean/* (see there). Both variants are statically generated, and <html> is
// rendered with the right `data-mode`, so there is no flash of the wrong mode.
export const dynamicParams = false;

export function generateStaticParams() {
  return MODES.map((mode) => ({ mode }));
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export function generateMetadata(): Metadata {
  const { name, tagline } = loadProfile();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: name, template: `%s | ${name}` },
    description: tagline,
    alternates: { canonical: '/' },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ mode: string }>;
}) {
  const mode = parseMode((await params).mode);
  if (!mode) notFound();

  return (
    <html lang="en" data-mode={mode}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-(--color-surface) focus:p-3"
        >
          Skip to content
        </a>
        <ModeRoot mode={mode}>{children}</ModeRoot>
      </body>
    </html>
  );
}
