'use client';

import { transitionToMode } from '@/lib/mode/transition';
import { useMode } from './ModeRoot';

/** Placeholder for the mascot: "wash" goes fun → clean, "make a mess" goes back. */
export function ModeSwitch({ className }: { className?: string }) {
  const mode = useMode();
  const next = mode === 'fun' ? 'clean' : 'fun';
  return (
    <button
      type="button"
      className={className}
      data-testid="mode-switch"
      onClick={() => void transitionToMode(next)}
    >
      {mode === 'fun' ? 'Wash' : 'Make a mess'}
    </button>
  );
}
