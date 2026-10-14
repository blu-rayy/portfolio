// Pure window-manager reducer. No React, no DOM, no side effects.
//
// One state shape powers both presentations:
//   "windowed": every open window is rendered, overlapping, draggable.
//   "compact" : only the focused window is rendered, full-screen, like a phone app.
// Switching layout never touches `windows`, `order` or `focusedId`, so no window
// is lost on resize/rotation. That's the whole trick: compact is a presentation
// choice, not a second app.

export type Layout = 'windowed' | 'compact';
export type WindowId = string;

export interface Viewport {
  width: number;
  height: number;
  /** Space reserved at the top (menu bar) that windows may not cover. */
  insetTop: number;
  /** Space reserved at the bottom (dock) that windows may not cover. */
  insetBottom: number;
}

export interface Anchor {
  x: number;
  y: number;
}

export interface WindowState {
  id: WindowId;
  x: number;
  y: number;
  width: number;
  height: number;
  /**
   * Where the window sits in the usable area, as fractions: (0, 0) top-left,
   * (0.5, 0.5) centred, (1, 1) bottom-right. While set, the position follows
   * the viewport on resize; the first drag clears it.
   */
  anchor: Anchor | null;
}

export interface WMState {
  /** Every open window. */
  windows: Record<WindowId, WindowState>;
  /** Z-order, back to front: the last item is the topmost window. */
  order: WindowId[];
  focusedId: WindowId | null;
  layout: Layout;
  viewport: Viewport;
}

export type WMAction =
  | {
      type: 'open';
      id: WindowId;
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      /** Open at this spot of the desktop and keep it there until moved. */
      anchor?: Anchor;
    }
  | { type: 'close'; id: WindowId }
  | { type: 'focus'; id: WindowId }
  | { type: 'move'; id: WindowId; x: number; y: number }
  | { type: 'setLayout'; layout: Layout }
  | { type: 'setViewport'; viewport: Partial<Viewport> };

export const DEFAULT_WINDOW_SIZE = { width: 420, height: 320 } as const;
const CASCADE_ORIGIN = { x: 48, y: 64 } as const;
const CASCADE_STEP = 28;
const CASCADE_SLOTS = 8;

export const DEFAULT_VIEWPORT: Viewport = {
  width: 1280,
  height: 800,
  insetTop: 0,
  insetBottom: 0,
};

export function createInitialState(overrides: Partial<WMState> = {}): WMState {
  return {
    windows: {},
    order: [],
    focusedId: null,
    layout: 'windowed',
    viewport: DEFAULT_VIEWPORT,
    ...overrides,
  };
}

/**
 * Keep a window fully inside the usable viewport area. If the window is larger
 * than the area it is pinned to the top-left edge (CSS caps its size).
 */
export function clampPosition(
  x: number,
  y: number,
  width: number,
  height: number,
  v: Viewport,
): { x: number; y: number } {
  const maxX = Math.max(0, v.width - width);
  const minY = v.insetTop;
  const maxY = Math.max(minY, v.height - v.insetBottom - height);
  return {
    x: Math.min(Math.max(Math.round(x), 0), maxX),
    y: Math.min(Math.max(Math.round(y), minY), maxY),
  };
}

/** Window placed at `anchor` of the usable area, clamped to stay on screen. */
export function anchoredPosition(
  anchor: Anchor,
  width: number,
  height: number,
  v: Viewport,
): { x: number; y: number } {
  const usable = v.height - v.insetTop - v.insetBottom;
  return clampPosition(
    (v.width - width) * anchor.x,
    v.insetTop + (usable - height) * anchor.y,
    width,
    height,
    v,
  );
}

function bringToFront(order: WindowId[], id: WindowId): WindowId[] {
  return [...order.filter((w) => w !== id), id];
}

function withWindow(state: WMState, id: WindowId, patch: Partial<WindowState>): WMState {
  const w = state.windows[id];
  if (!w) return state;
  return { ...state, windows: { ...state.windows, [id]: { ...w, ...patch } } };
}

function reclamp(state: WMState): WMState {
  let changed = false;
  const windows: Record<WindowId, WindowState> = {};
  for (const w of Object.values(state.windows)) {
    const { x, y } = w.anchor
      ? anchoredPosition(w.anchor, w.width, w.height, state.viewport)
      : clampPosition(w.x, w.y, w.width, w.height, state.viewport);
    if (x !== w.x || y !== w.y) changed = true;
    windows[w.id] = x === w.x && y === w.y ? w : { ...w, x, y };
  }
  return changed ? { ...state, windows } : state;
}

export function wmReducer(state: WMState, action: WMAction): WMState {
  switch (action.type) {
    case 'open': {
      const existing = state.windows[action.id];
      if (existing) {
        // Opening an already-open window just raises it.
        return {
          ...state,
          order: bringToFront(state.order, action.id),
          focusedId: action.id,
        };
      }
      const width = action.width ?? DEFAULT_WINDOW_SIZE.width;
      const height = action.height ?? DEFAULT_WINDOW_SIZE.height;
      const slot = state.order.length % CASCADE_SLOTS;
      const anchor =
        action.anchor && action.x === undefined && action.y === undefined
          ? action.anchor
          : null;
      const { x, y } = anchor
        ? anchoredPosition(anchor, width, height, state.viewport)
        : clampPosition(
            action.x ?? CASCADE_ORIGIN.x + slot * CASCADE_STEP,
            action.y ?? CASCADE_ORIGIN.y + slot * CASCADE_STEP,
            width,
            height,
            state.viewport,
          );
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.id]: { id: action.id, x, y, width, height, anchor },
        },
        order: [...state.order, action.id],
        focusedId: action.id,
      };
    }

    case 'close': {
      if (!state.windows[action.id]) return state;
      const windows = { ...state.windows };
      delete windows[action.id];
      const order = state.order.filter((id) => id !== action.id);
      const next: WMState = { ...state, windows, order };
      return {
        ...next,
        focusedId:
          state.focusedId === action.id ? (order.at(-1) ?? null) : state.focusedId,
      };
    }

    case 'focus': {
      if (!state.windows[action.id]) return state;
      if (state.focusedId === action.id && state.order.at(-1) === action.id) return state;
      return {
        ...state,
        order: bringToFront(state.order, action.id),
        focusedId: action.id,
      };
    }

    case 'move': {
      const w = state.windows[action.id];
      if (!w) return state;
      const { x, y } = clampPosition(
        action.x,
        action.y,
        w.width,
        w.height,
        state.viewport,
      );
      if (x === w.x && y === w.y && !w.anchor) return state;
      // Any move (drag) detaches the window from its anchor.
      return withWindow(state, action.id, { x, y, anchor: null });
    }

    case 'setLayout': {
      if (state.layout === action.layout) return state;
      return { ...state, layout: action.layout };
    }

    case 'setViewport': {
      const viewport = { ...state.viewport, ...action.viewport };
      const same = (Object.keys(viewport) as (keyof Viewport)[]).every(
        (k) => viewport[k] === state.viewport[k],
      );
      if (same) return state;
      return reclamp({ ...state, viewport });
    }
  }
}
