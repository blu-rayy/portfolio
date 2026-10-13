'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { useStore } from 'zustand';
import { useWM } from './WMContext';

interface WindowProps {
  id: string;
  title: string;
  children: ReactNode;
  /** Move focus into the window when it becomes focused (skipped on first paint). */
  autoFocus: boolean;
}

/**
 * One window. Windowed (≥ lg): absolutely positioned from `--x/--y/--w/--h`,
 * draggable by its title bar. Compact (< lg): CSS makes it fill the desktop and
 * non-focused windows are hidden, so SSR output is already correct.
 */
export function Window({ id, title, children, autoFocus }: WindowProps) {
  const store = useWM();
  const win = useStore(store, (s) => s.windows[id]);
  const focused = useStore(store, (s) => s.focusedId === id);
  const layout = useStore(store, (s) => s.layout);
  const rootRef = useRef<HTMLElement>(null);
  const drag = useRef<{ pointerId: number; dx: number; dy: number } | null>(null);

  // Keyboard: focus moves into the window when it opens / is focused.
  useEffect(() => {
    if (focused && autoFocus) rootRef.current?.focus({ preventScroll: true });
  }, [focused, autoFocus]);

  if (!win) return null;
  const { dispatch, requestClose } = store.getState();
  const titleId = `win-title-${id.replace(/[^a-z0-9]/gi, '-')}`;

  const onTitlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dispatch({ type: 'focus', id });
    // Dragging is a windowed-only feature; ignore buttons inside the title bar.
    if (layout !== 'windowed' || e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button')) return;
    const current = store.getState().windows[id];
    if (!current) return;
    drag.current = {
      pointerId: e.pointerId,
      dx: e.clientX - current.x,
      dy: e.clientY - current.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onTitlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    dispatch({ type: 'move', id, x: e.clientX - d.dx, y: e.clientY - d.dy });
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointerId === e.pointerId) drag.current = null;
  };

  const style = {
    '--x': `${win.x}px`,
    '--y': `${win.y}px`,
    '--w': `${win.width}px`,
    '--h': `${win.height}px`,
  } as CSSProperties;

  return (
    <section
      ref={rootRef}
      role="dialog"
      aria-labelledby={titleId}
      tabIndex={-1}
      data-window={id}
      data-focused={focused}
      style={style}
      onPointerDownCapture={() => dispatch({ type: 'focus', id })}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          requestClose(id);
        }
      }}
      className={[
        'flex flex-col overflow-hidden border bg-(--color-surface) text-(--color-ink)',
        // compact (default, < lg): fill the desktop; hide unfocused pre-hydration
        'absolute inset-0 data-[focused=false]:hidden',
        // windowed (>= lg)
        'lg:inset-auto lg:top-(--y) lg:left-(--x) lg:h-(--h) lg:w-(--w) lg:max-h-full lg:max-w-full lg:data-[focused=false]:flex',
      ].join(' ')}
    >
      <div
        data-titlebar
        className="flex items-center justify-between border-b lg:cursor-grab lg:touch-none"
        onPointerDown={onTitlePointerDown}
        onPointerMove={onTitlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <h2 id={titleId} className="px-3 select-none">
          {title}
        </h2>
        <div className="flex">
          <button
            type="button"
            aria-label={`Minimize ${title}`}
            onClick={() => dispatch({ type: 'minimize', id })}
          >
            –
          </button>
          <button
            type="button"
            aria-label={`Close ${title}`}
            onClick={() => requestClose(id)}
          >
            ×
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-4">{children}</div>
    </section>
  );
}
