import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Kristian, KristianPeek, KRISTIAN_MOODS } from '@/components/fun/art/Kristian';
import {
  KristianCorner,
  SLEEP_AFTER_MS,
  SURPRISE_MS,
} from '@/components/fun/KristianCorner';

const transitionToMode = vi.fn();
vi.mock('@/lib/mode/transition', () => ({
  transitionToMode: (...args: unknown[]) => transitionToMode(...args),
}));

describe('Kristian art', () => {
  it.each(KRISTIAN_MOODS)('draws the %s mood, full body and peeking', (mood) => {
    const { container } = render(
      <>
        <Kristian mood={mood} idPrefix="a" />
        <KristianPeek mood={mood} idPrefix="b" />
      </>,
    );
    const svgs = container.querySelectorAll(`svg[data-mood="${mood}"]`);
    expect(svgs).toHaveLength(2);
  });

  it('only the vacuum has a nozzle tip (for the wash animation)', () => {
    const { container } = render(
      <>
        <Kristian mood="vacuuming" />
        <Kristian mood="idle" idPrefix="x" />
      </>,
    );
    expect(container.querySelectorAll('[data-nozzle]')).toHaveLength(1);
  });

  it('two drawings with different prefixes share no ids', () => {
    const { container } = render(
      <>
        <Kristian idPrefix="one" />
        <KristianPeek idPrefix="two" />
      </>,
    );
    const ids = [...container.querySelectorAll('[id]')].map((el) => el.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('is decorative unless labelled', () => {
    render(<Kristian mood="sad" label="Kristian is sad" />);
    expect(screen.getByRole('img', { name: 'Kristian is sad' })).toBeInTheDocument();
  });
});

describe('KristianCorner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    transitionToMode.mockClear();
  });
  afterEach(() => vi.useRealTimers());

  const art = () => document.querySelector('.kristian-art')!;

  it('dozes off after a minute without input and wakes on input', () => {
    render(<KristianCorner name="Kristian" bubble="hi" />);
    expect(art()).toHaveAttribute('data-mood', 'idle');

    act(() => vi.advanceTimersByTime(SLEEP_AFTER_MS - 1));
    expect(art()).toHaveAttribute('data-mood', 'idle');
    act(() => vi.advanceTimersByTime(1));
    expect(art()).toHaveAttribute('data-mood', 'sleepy');

    act(() => {
      window.dispatchEvent(new Event('pointermove'));
    });
    expect(art()).toHaveAttribute('data-mood', 'idle');
  });

  it('input keeps resetting the sleep timer', () => {
    render(<KristianCorner name="Kristian" bubble="hi" />);
    act(() => vi.advanceTimersByTime(SLEEP_AFTER_MS - 10));
    act(() => {
      window.dispatchEvent(new Event('keydown'));
    });
    act(() => vi.advanceTimersByTime(SLEEP_AFTER_MS - 10));
    expect(art()).toHaveAttribute('data-mood', 'idle');
  });

  it('looks surprised when clicked, then washes the site once', () => {
    render(<KristianCorner name="Kristian" bubble="hi" />);
    const button = screen.getByRole('button', { name: 'Kristian: wash this site' });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(art()).toHaveAttribute('data-mood', 'surprised');
    // No happy hover face while surprised.
    expect(document.querySelector('.kr-face-hover')).toBeNull();
    expect(transitionToMode).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(SURPRISE_MS));
    expect(transitionToMode).toHaveBeenCalledTimes(1);
    expect(transitionToMode).toHaveBeenCalledWith('clean');
  });

  it('has a happy face ready for hover/focus', () => {
    render(<KristianCorner name="Kristian" bubble="hi" />);
    expect(document.querySelector('.kr-face-hover')).not.toBeNull();
  });
});
