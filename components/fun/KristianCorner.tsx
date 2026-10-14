'use client';

import { useEffect, useState } from 'react';
import { transitionToMode } from '@/lib/mode/transition';
import { KristianPeek, type KristianMood } from './art/Kristian';

/** No input for this long and Kristian dozes off. Any input wakes him. */
export const SLEEP_AFTER_MS = 60_000;
/** How long the "surprised" face shows after a click before the wash starts. */
export const SURPRISE_MS = 350;

const WAKE_EVENTS = [
  'pointermove',
  'pointerdown',
  'keydown',
  'wheel',
  'touchstart',
] as const;

interface KristianCornerProps {
  name: string;
  bubble: string;
}

/**
 * Kristian peeking from the corner. Moods: curious (idle) → happy on
 * hover/focus → sleepy after a minute of no input → surprised when clicked,
 * then the site washes.
 */
export function KristianCorner({ name, bubble }: KristianCornerProps) {
  const [mood, setMood] = useState<KristianMood>('idle');

  useEffect(() => {
    let timer = window.setTimeout(
      () => setMood((m) => (m === 'idle' ? 'sleepy' : m)),
      SLEEP_AFTER_MS,
    );
    const wake = () => {
      window.clearTimeout(timer);
      setMood((m) => (m === 'sleepy' ? 'idle' : m));
      timer = window.setTimeout(
        () => setMood((m) => (m === 'idle' ? 'sleepy' : m)),
        SLEEP_AFTER_MS,
      );
    };
    for (const e of WAKE_EVENTS) window.addEventListener(e, wake, { passive: true });
    return () => {
      window.clearTimeout(timer);
      for (const e of WAKE_EVENTS) window.removeEventListener(e, wake);
    };
  }, []);

  function wash() {
    if (mood === 'surprised') return;
    setMood('surprised');
    window.setTimeout(() => void transitionToMode('clean'), SURPRISE_MS);
  }

  return (
    // Kristian sits under the windows: they can cover him, never the reverse.
    <div className="kristian">
      <button
        type="button"
        className="kristian-btn"
        aria-label={`${name}: wash this site`}
        onClick={wash}
      >
        <KristianPeek
          className="kristian-art"
          mood={mood}
          hoverMood={mood === 'surprised' ? undefined : 'happy'}
        />
      </button>
      <p aria-hidden="true" className="bubble">
        {bubble}
      </p>
    </div>
  );
}
