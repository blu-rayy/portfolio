import type { WMState, WindowId } from './reducer';

/**
 * Which windows should be mounted right now.
 * windowed: every non-minimized window, back to front.
 * compact : only the focused window; the rest stay in state.
 */
export function selectRenderedWindowIds(state: WMState): WindowId[] {
  if (state.layout === 'compact') {
    const id = state.focusedId;
    return id && !state.windows[id]?.minimized ? [id] : [];
  }
  return state.order.filter((id) => !state.windows[id]?.minimized);
}

export function selectIsOpen(state: WMState, id: WindowId): boolean {
  return id in state.windows;
}
