'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { useStore } from 'zustand';
import { useWM } from './WMContext';

interface WindowProps {
  id: string;
  title: string;
  children: ReactNode;
  /** Status bar under the white panel (counts, tips). */
  status?: ReactNode;
  /** Move focus into the window when it becomes focused (skipped on first paint). */
  autoFocus: boolean;
}

/**
 * One window: cream frame, title bar, white content panel ("well"), optional
 * status bar. Windowed (≥ lg): positioned from `--x/--y/--w/--h` (or centred
 * while `anchored`), draggable by the title bar. Compact (< lg): CSS makes it
 * fill the desktop, hides unfocused windows and swaps close for "‹ back", so
 * the server-rendered HTML is already right. Styles: styles/fun.css (.win).
 */
export function Window({ id, title, children, status, autoFocus }: WindowProps) {
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
    '--ax': win.anchor?.x ?? 0,
    '--ay': win.anchor?.y ?? 0,
  } as CSSProperties;

  return (
    <section
      ref={rootRef}
      role="dialog"
      aria-labelledby={titleId}
      tabIndex={-1}
      data-window={id}
      data-focused={focused}
      data-anchored={win.anchor !== null}
      style={style}
      onPointerDownCapture={() => dispatch({ type: 'focus', id })}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          requestClose(id);
        }
      }}
      className="win"
    >
      <div
        data-titlebar
        className="win-titlebar"
        onPointerDown={onTitlePointerDown}
        onPointerMove={onTitlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {/* windowed: close (there is deliberately no minimise) */}
        <div className="flex gap-1.5 max-lg:hidden">
          <button
            type="button"
            className="win-btn"
            aria-label={`Close ${title}`}
            onClick={() => requestClose(id)}
          >
            <svg aria-hidden="true" width="10" height="10" viewBox="0 0 10 10">
              <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
        </div>
        {/* compact: back (the phone's back gesture does the same) */}
        <button
          type="button"
          className="win-back lg:hidden"
          aria-label={`Back from ${title}`}
          onClick={() => requestClose(id)}
        >
          <svg aria-hidden="true" width="10" height="16" viewBox="0 0 10 16">
            <path d="M8 2L2 8l6 6" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          back
        </button>
        <h2 id={titleId} className="win-title">
          {title}
        </h2>
      </div>
      <div className="well">{children}</div>
      {status ? <div className="win-status">{status}</div> : null}
    </section>
  );
}
