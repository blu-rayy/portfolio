'use client';

import { useStore } from 'zustand';
import { isStaticWindowId } from '@/lib/wm/windows';
import { AppIcon } from './art/icons';
import { useWM } from './WMContext';

export interface DockItem {
  id: string;
  label: string;
}

/**
 * The dock. Centred tray on wide screens, full-width bottom bar on phones.
 * Every item is a real button, so it works on tap, click and keyboard
 * (nothing is hover-only). Active = orange, hover/focus = light orange.
 */
export function Dock({ items }: { items: DockItem[] }) {
  const store = useWM();
  const windows = useStore(store, (s) => s.windows);
  const focusedId = useStore(store, (s) => s.focusedId);

  const activate = (id: string) => {
    const { dispatch } = store.getState();
    const w = store.getState().windows[id];
    if (!w) dispatch({ type: 'open', id });
    else dispatch({ type: 'focus', id });
  };

  return (
    <nav aria-label="Dock" className="dock">
      <div className="dock-tray">
        {items.map((item) => {
          const w = windows[item.id];
          return (
            <button
              key={item.id}
              type="button"
              data-dock-item={item.id}
              aria-current={focusedId === item.id ? 'true' : undefined}
              onClick={() => activate(item.id)}
              className="dock-item"
            >
              <AppIcon id={isStaticWindowId(item.id) ? item.id : 'project'} />
              <span className="dock-item-label">{item.label}</span>
              {w ? <span aria-hidden className="dock-dot" /> : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
