'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ModeSwitch } from '@/components/shared/ModeSwitch';

export interface NavLink {
  href: string;
  label: string;
}

// Wide screens: inline links. Narrow screens: a real <button> opens a native
// modal <dialog>, which gives us focus containment, inert background and
// Esc-to-close without a focus-trap library. `close` fires for every way of
// dismissing it, so `aria-expanded` can't drift.
export function CleanNav({ name, links }: { name: string; links: NavLink[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <header className="flex items-center justify-between gap-4 p-4">
      <Link href="/" className="inline-flex items-center font-bold">
        {name}
      </Link>

      <nav aria-label="Primary" className="hidden items-center gap-4 md:flex">
        {links.map((l) => (
          <a key={l.href} href={l.href} className="inline-flex items-center">
            {l.label}
          </a>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <ModeSwitch />
      </div>

      <button
        type="button"
        className="md:hidden"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => {
          dialogRef.current?.showModal();
          setOpen(true);
        }}
      >
        Menu
      </button>

      <dialog
        ref={dialogRef}
        id="mobile-menu"
        aria-label="Menu"
        onClose={() => setOpen(false)}
        className="m-0 h-dvh w-full max-w-none bg-(--color-surface) p-4 text-(--color-ink) md:hidden"
      >
        <button type="button" onClick={() => dialogRef.current?.close()}>
          Close menu
        </button>
        <nav aria-label="Mobile">
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="flex items-center py-3"
                  onClick={() => dialogRef.current?.close()}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </dialog>
    </header>
  );
}
