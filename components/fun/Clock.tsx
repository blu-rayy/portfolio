'use client';

import { useSyncExternalStore } from 'react';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
];

/** Today's date, twenty years ago. A small Y2K joke in the menu bar. */
export const RETRO_YEARS = 20;

export function formatMenuDate(d: Date): { date: string; time: string } {
  const date = `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear() - RETRO_YEARS}`;
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return { date, time };
}

const TICK_MS = 15_000;
const subscribe = (onChange: () => void) => {
  const t = window.setInterval(onChange, TICK_MS);
  return () => window.clearInterval(t);
};
// A stable value between ticks (useSyncExternalStore compares snapshots).
const getTick = () => Math.floor(Date.now() / TICK_MS);
const getServerTick = () => null;

/**
 * The server renders an empty cell: it can't know the visitor's clock, and a
 * time baked into static HTML would cause a hydration mismatch.
 */
export function Clock() {
  const tick = useSyncExternalStore(subscribe, getTick, getServerTick);
  const f = tick === null ? null : formatMenuDate(new Date());
  return (
    <>
      <span className="menubar-cell max-sm:!border-l-0">{f?.date ?? '\u00a0'}</span>
      <span className="menubar-cell max-lg:hidden">{f?.time ?? '\u00a0'}</span>
    </>
  );
}
