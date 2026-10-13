'use client';

import { createContext, useContext } from 'react';
import type { WMStore } from '@/lib/wm/store';

export const WMContext = createContext<WMStore | null>(null);

export function useWM(): WMStore {
  const store = useContext(WMContext);
  if (!store) throw new Error('useWM must be used inside <FunDesktop>');
  return store;
}
