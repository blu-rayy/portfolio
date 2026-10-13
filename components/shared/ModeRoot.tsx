'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { Mode } from '@/lib/mode/mode';
import { registerNavigator } from '@/lib/mode/transition';

const ModeContext = createContext<Mode>('fun');

export function useMode(): Mode {
  return useContext(ModeContext);
}

/** Provides the server-resolved mode and wires `transitionToMode` to the router. */
export function ModeRoot({ mode, children }: { mode: Mode; children: ReactNode }) {
  const router = useRouter();
  useEffect(() => registerNavigator((url) => router.replace(url)), [router]);
  return <ModeContext.Provider value={mode}>{children}</ModeContext.Provider>;
}
