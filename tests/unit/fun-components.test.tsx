import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dock } from '@/components/fun/Dock';
import { Window } from '@/components/fun/Window';
import { WMContext } from '@/components/fun/WMContext';
import { createWMStore } from '@/lib/wm/store';

const ITEMS = [
  { id: 'about', label: 'About' },
  { id: 'timeline', label: 'Timeline' },
];

function setup() {
  const store = createWMStore();
  render(
    <WMContext.Provider value={store}>
      <Dock items={ITEMS} />
    </WMContext.Provider>,
  );
  return store;
}

describe('Dock', () => {
  it('opens a window on click, restores a minimized one, focuses an open one', async () => {
    const user = userEvent.setup();
    const store = setup();

    await user.click(screen.getByRole('button', { name: 'About' }));
    expect(store.getState().focusedId).toBe('about');

    store.getState().dispatch({ type: 'minimize', id: 'about' });
    await user.click(screen.getByRole('button', { name: /About/ }));
    expect(store.getState().windows.about?.minimized).toBe(false);

    await user.click(screen.getByRole('button', { name: 'Timeline' }));
    await user.click(screen.getByRole('button', { name: /About/ }));
    expect(store.getState().focusedId).toBe('about');
    expect(store.getState().order).toEqual(['timeline', 'about']);
  });
});

describe('Window', () => {
  it('closes on Escape and labels itself by its title', async () => {
    const user = userEvent.setup();
    const store = createWMStore();
    store.getState().dispatch({ type: 'open', id: 'about' });

    render(
      <WMContext.Provider value={store}>
        <Window id="about" title="About" autoFocus>
          hello
        </Window>
      </WMContext.Provider>,
    );

    const dialog = screen.getByRole('dialog', { name: 'About' });
    expect(dialog).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(store.getState().windows.about).toBeUndefined();
  });

  it('close button closes the window', async () => {
    const user = userEvent.setup();
    const store = createWMStore();
    store.getState().dispatch({ type: 'open', id: 'about' });
    render(
      <WMContext.Provider value={store}>
        <Window id="about" title="About" autoFocus={false}>
          hello
        </Window>
      </WMContext.Provider>,
    );
    await user.click(screen.getByRole('button', { name: 'Close About' }));
    expect(store.getState().windows.about).toBeUndefined();
  });
});
