import { createStore, type StoreApi } from 'zustand/vanilla';
import {
  createInitialState,
  wmReducer,
  type WMAction,
  type WMState,
  type WindowId,
} from './reducer';

export interface WMStoreState extends WMState {
  dispatch: (action: WMAction) => void;
  /**
   * Close from the UI (button / Esc). When history sync is attached this goes
   * through `history.back()` so the browser stack stays truthful.
   */
  requestClose: (id: WindowId) => void;
}

export type WMStore = StoreApi<WMStoreState>;

export function createWMStore(initial: Partial<WMState> = {}): WMStore {
  return createStore<WMStoreState>()((set, get) => ({
    ...createInitialState(initial),
    dispatch: (action) =>
      set((state) => {
        const next = wmReducer(state, action);
        return next === state ? state : next;
      }),
    requestClose: (id) => get().dispatch({ type: 'close', id }),
  }));
}

// The store is a module-level singleton in the browser. Next remounts the
// desktop when history navigation crosses between `/` and `/work/[slug]`
// (different pages); a singleton keeps open windows alive across that.
// On the server we always build a fresh store so requests never share state.
let clientStore: WMStore | undefined;

export function getWMStore(initial: Partial<WMState> = {}): WMStore {
  if (typeof window === 'undefined') return createWMStore(initial);
  clientStore ??= createWMStore(initial);
  return clientStore;
}
