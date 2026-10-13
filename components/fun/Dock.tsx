'use client';

import { useStore } from 'zustand';
import { useWM } from './WMContext';

export interface DockItem {
  id: string;
  label: string;
}

/**
 * The dock. On phones it is the bottom bar. Every item is a real button, so it
 * works on tap, click and keyboard (nothing is hover-only).
 */
export function Dock({ items }: { items: DockItem[] }) {
  const store = useWM();
  const windows = useStore(store, (s) => s.windows);
  const focusedId = useStore(store, (s) => s.focusedId);

  const activate = (id: string) => {
    const { dispatch } = store.getState();
    const w = store.getState().windows[id];
    if (!w) dispatch({ type: 'open', id });
    else if (w.minimized) dispatch({ type: 'restore', id });
    else dispatch({ type: 'focus', id });
  };

  return (
    <nav
      aria-label="Dock"
      className="flex shrink-0 justify-center gap-1 border-t bg-(--color-surface) pb-[env(safe-area-inset-bottom)]"
    >
      {items.map((item) => {
        const w = windows[item.id];
        return (
          <button
            key={item.id}
            type="button"
            data-dock-item={item.id}
            aria-current={focusedId === item.id ? 'true' : undefined}
            onClick={() => activate(item.id)}
            className="px-4"
          >
            {item.label}
            {w ? <span aria-hidden> •</span> : null}
            {w?.minimized ? <span className="sr-only"> (minimized)</span> : null}
          </button>
        );
      })}
    </nav>
  );
}
