import type { WMState, WindowId } from './reducer';

/**
 * Which windows should be mounted right now.
 * windowed: every open window, back to front.
 * compact : only the focused window; the rest stay in state.
 */
export function selectRenderedWindowIds(state: WMState): WindowId[] {
  if (state.layout === 'compact') {
    return state.focusedId ? [state.focusedId] : [];
  }
  return state.order;
}

export function selectIsOpen(state: WMState, id: WindowId): boolean {
  return id in state.windows;
}
