// Kristian, the mascot. Concept art drawn in code from the mascot whiteboard;
// swap for Kris's hand-drawn SVGs later, keeping the same viewBoxes and moods:
//   full body  200 x 260 (vacuuming 300 x 260), feet on the bottom edge
//   peek       200 x 170, hands on the bottom edge
//
// Every SVG carries its own <defs>. Pass a distinct `idPrefix` when two
// drawings can be on the page at once so their pattern/filter ids don't clash.

import type { ReactNode } from 'react';

export const KRISTIAN_MOODS = [
  'idle',
  'happy',
  'surprised',
  'vacuuming',
  'sleepy',
  'sad',
  'done',
  'confused',
] as const;
export type KristianMood = (typeof KRISTIAN_MOODS)[number];

/** What each mood is for (alt text, and the reference for wiring new states). */
export const MOOD_LABELS: Record<KristianMood, string> = {
  idle: 'Kristian smiling calmly',
  happy: 'Kristian grinning and waving',
  surprised: 'Kristian wide-eyed with his mouth open',
  vacuuming: 'Kristian vacuuming up the clouds',
  sleepy: 'Kristian dozing off',
  sad: 'Kristian frowning, holding a 404 sign',
  done: 'Kristian winking with a thumbs up',
  confused: 'Kristian scratching his head',
};

const INK = '#151515';
const SKIN_LINE = '#9c6b47';

const ids = (p: string) => ({
  cray: `${p}-cray`,
  denim: `${p}-denim`,
  skin: `${p}-skin`,
  khaki: `${p}-khaki`,
});
type Ids = ReturnType<typeof ids>;

function Defs({ id }: { id: Ids }) {
  return (
    <defs>
      <filter id={id.cray} x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="1.1"
          numOctaves="2"
          seed="3"
          result="n"
        />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" />
      </filter>
      <pattern
        id={id.denim}
        width="7"
        height="7"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(-35)"
      >
        <rect width="7" height="7" fill="#4f7fc0" />
        <line x1="0" y1="0" x2="0" y2="7" stroke="#3b67a6" strokeWidth="2.5" />
      </pattern>
      <pattern
        id={id.skin}
        width="6"
        height="6"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(30)"
      >
        <rect width="6" height="6" fill="#e3ae86" />
        <line x1="0" y1="0" x2="0" y2="6" stroke="#d49a6f" strokeWidth="2" />
      </pattern>
      <pattern
        id={id.khaki}
        width="6"
        height="6"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(-20)"
      >
        <rect width="6" height="6" fill="#d2ba8e" />
        <line x1="0" y1="0" x2="0" y2="6" stroke="#bfa474" strokeWidth="2" />
      </pattern>
    </defs>
  );
}

// ---------- shared parts (head centred at 100,94) ----------------------------

function Head({ id }: { id: Ids }) {
  return (
    <>
      <circle
        cx="62"
        cy="96"
        r="7"
        fill={`url(#${id.skin})`}
        stroke={SKIN_LINE}
        strokeWidth="2"
      />
      <circle
        cx="138"
        cy="96"
        r="7"
        fill={`url(#${id.skin})`}
        stroke={SKIN_LINE}
        strokeWidth="2"
      />
      <circle
        cx="100"
        cy="94"
        r="38"
        fill={`url(#${id.skin})`}
        stroke={SKIN_LINE}
        strokeWidth="2.5"
      />
      <circle cx="76" cy="110" r="6" fill="#f08a8a" opacity=".55" />
      <circle cx="124" cy="110" r="6" fill="#f08a8a" opacity=".55" />
    </>
  );
}

function Hair() {
  return (
    <g fill="#2b1e16">
      <circle cx="66" cy="74" r="13" />
      <circle cx="72" cy="56" r="15" />
      <circle cx="88" cy="45" r="16" />
      <circle cx="106" cy="42" r="16" />
      <circle cx="124" cy="49" r="15" />
      <circle cx="134" cy="66" r="13" />
      <circle cx="98" cy="60" r="18" />
      <circle cx="118" cy="64" r="12" />
      <circle cx="80" cy="66" r="12" />
      <path
        d="M70 52 q6 -8 12 0 q6 -8 12 0 q6 -8 12 0 q6 -8 12 0 q6 -8 12 0"
        stroke="#5a4232"
        strokeWidth="2.5"
        fill="none"
      />
      <path
        d="M78 40 q5 -6 10 0 q5 -6 10 0 q5 -6 10 0"
        stroke="#5a4232"
        strokeWidth="2.5"
        fill="none"
      />
    </g>
  );
}

function Glasses() {
  return (
    <g fill="none" stroke={INK} strokeWidth="3.5">
      <circle cx="84" cy="95" r="12" />
      <circle cx="116" cy="95" r="12" />
      <path d="M96 94 h8 M72 93 L63 90 M128 93 L137 90" />
    </g>
  );
}

const line = {
  stroke: INK,
  strokeWidth: 3,
  fill: 'none',
  strokeLinecap: 'round' as const,
};

/** Eyes, brows and mouth for each mood. `curious` is the peek's resting face. */
const FACES: Record<KristianMood | 'curious', ReactNode> = {
  curious: (
    <>
      <circle cx="89" cy="93" r="3.8" fill={INK} />
      <circle cx="121" cy="93" r="3.8" fill={INK} />
      <path d="M76 78 q8 -5 16 -1 M108 77 q8 -4 16 1" {...line} />
      <path d="M94 116 q8 5 16 -1" {...line} />
    </>
  ),
  idle: (
    <>
      <circle cx="84" cy="96" r="3.5" fill={INK} />
      <circle cx="116" cy="96" r="3.5" fill={INK} />
      <path d="M90 116 q10 7 20 0" {...line} />
    </>
  ),
  happy: (
    <>
      <path d="M78 98 q6 -8 12 0 M110 98 q6 -8 12 0" {...line} />
      <path
        d="M86 112 q14 18 28 0 Z"
        fill="#b8342f"
        stroke={INK}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </>
  ),
  surprised: (
    <>
      <circle cx="84" cy="95" r="6.5" fill={INK} />
      <circle cx="116" cy="95" r="6.5" fill={INK} />
      <circle cx="86" cy="93" r="2" fill="#fff" />
      <circle cx="118" cy="93" r="2" fill="#fff" />
      <ellipse cx="100" cy="118" rx="6" ry="8" fill={INK} />
    </>
  ),
  vacuuming: (
    <>
      <path d="M78 92 l12 3 M122 92 l-12 3" {...line} />
      <circle cx="85" cy="99" r="3" fill={INK} />
      <circle cx="115" cy="99" r="3" fill={INK} />
      <path d="M92 118 h16" {...line} />
    </>
  ),
  sleepy: (
    <>
      <path d="M78 96 q6 5 12 0 M110 96 q6 5 12 0" {...line} />
      <ellipse cx="100" cy="118" rx="3.5" ry="4" fill={INK} />
    </>
  ),
  sad: (
    <>
      <path d="M76 82 L90 78 M124 82 L110 78" {...line} />
      <circle cx="84" cy="99" r="3.5" fill={INK} />
      <circle cx="116" cy="99" r="3.5" fill={INK} />
      <path d="M90 122 q10 -8 20 0" {...line} />
      <path d="M80 110 q-4 8 0 11 q4 -3 0 -11 z" fill="#8dbbe8" />
    </>
  ),
  done: (
    <>
      <path d="M78 96 q6 -6 12 0" {...line} />
      <circle cx="116" cy="95" r="3.5" fill={INK} />
      <path d="M86 112 q14 14 28 0" {...line} />
    </>
  ),
  confused: (
    <>
      <circle cx="84" cy="96" r="5.5" fill={INK} />
      <circle cx="116" cy="97" r="2.5" fill={INK} />
      <path d="M110 84 L124 88" {...line} />
      <path d="M88 118 q4 -5 8 0 t8 0 t8 0" {...line} />
    </>
  ),
};

/** Little marks around the head: zz, ?, sparkles, motion lines. */
function Extras({ mood }: { mood: KristianMood }) {
  switch (mood) {
    case 'happy':
      return (
        <path
          d="M170 70 l8 -8 M176 82 l10 -2 M166 62 l2 -10"
          stroke="#f08a3c"
          strokeWidth="3"
          strokeLinecap="round"
        />
      );
    case 'surprised':
      return (
        <path
          d="M160 34 v20 M174 40 l-6 18 M148 42 l4 16"
          stroke="#d63c3c"
          strokeWidth="4"
          strokeLinecap="round"
        />
      );
    case 'sleepy':
      return (
        <g fontFamily="Gaegu, cursive" fontWeight="700" fill="#1b4f9c">
          <text x="150" y="44" fontSize="30">
            z
          </text>
          <text x="168" y="26" fontSize="22">
            z
          </text>
        </g>
      );
    case 'done':
      return (
        <g fill="#ffd25e">
          <path d="M30 40 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 z" />
          <path d="M150 34 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 z" />
        </g>
      );
    case 'confused':
      return (
        <text
          x="148"
          y="50"
          fontFamily="Gaegu, cursive"
          fontWeight="700"
          fontSize="44"
          fill="#f08a3c"
        >
          ?
        </text>
      );
    default:
      return null;
  }
}

// ---------- full body ----------------------------------------------------------

const ARM = { stroke: '#4f7fc0', strokeWidth: 15, strokeLinecap: 'round' as const };

type ArmPose = 'down' | 'up' | 'out' | 'scratch';

function Arm({ side, pose, id }: { side: 'l' | 'r'; pose: ArmPose; id: Ids }) {
  const hand = (cx: number, cy: number) => (
    <circle
      cx={cx}
      cy={cy}
      r="8"
      fill={`url(#${id.skin})`}
      stroke={SKIN_LINE}
      strokeWidth="2"
    />
  );
  // Right-side poses are the left ones mirrored around x = 100.
  const m = (x: number) => (side === 'l' ? x : 200 - x);
  switch (pose) {
    case 'down':
      return (
        <g>
          <path d={`M${m(60)} 142 L${m(44)} 196`} {...ARM} />
          {hand(m(43), 202)}
        </g>
      );
    case 'up':
      return (
        <g>
          <path d={`M${m(60)} 142 L${m(32)} 102`} {...ARM} />
          {hand(m(29), 96)}
        </g>
      );
    case 'out':
      return (
        <g>
          <path d={`M${m(60)} 142 L${m(26)} 156`} {...ARM} />
          {hand(m(20), 158)}
        </g>
      );
    case 'scratch':
      return (
        <g>
          <path d={`M${m(60)} 142 Q${m(34)} 116 ${m(54)} 76`} {...ARM} fill="none" />
          {hand(m(58), 70)}
        </g>
      );
  }
}

function Torso({ id }: { id: Ids }) {
  return (
    <>
      <rect
        x="68"
        y="200"
        width="28"
        height="44"
        fill={`url(#${id.khaki})`}
        stroke="#6b5434"
        strokeWidth="2.5"
      />
      <rect
        x="104"
        y="200"
        width="28"
        height="44"
        fill={`url(#${id.khaki})`}
        stroke="#6b5434"
        strokeWidth="2.5"
      />
      <ellipse cx="80" cy="248" rx="17" ry="7" fill="#2b2b33" />
      <ellipse cx="120" cy="248" rx="17" ry="7" fill="#2b2b33" />
      <path
        d="M56 136 Q100 120 144 136 L152 210 L48 210 Z"
        fill={`url(#${id.denim})`}
        stroke="#23457e"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M86 128 L114 128 L100 180 Z"
        fill="#fff"
        stroke="#9aa6b8"
        strokeWidth="2"
      />
      <path
        d="M86 128 L78 160 M114 128 L122 160"
        stroke="#23457e"
        strokeWidth="3"
        fill="none"
      />
      <path
        d="M96 132 L104 132 L108 182 L100 192 L92 182 Z"
        fill="#d63c3c"
        stroke="#8e2020"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M93 147 L107 141 M93 162 L108 156 M94 177 L107 171"
        stroke="#1b2a55"
        strokeWidth="3.5"
      />
      <rect
        x="120"
        y="164"
        width="18"
        height="14"
        fill="none"
        stroke="#23457e"
        strokeWidth="2.5"
      />
      <path d="M100 210 V200" stroke="#23457e" strokeWidth="2" />
    </>
  );
}

const POSES: Record<KristianMood, [ArmPose, ArmPose]> = {
  idle: ['down', 'down'],
  happy: ['down', 'up'],
  surprised: ['out', 'out'],
  vacuuming: ['down', 'out'],
  sleepy: ['down', 'down'],
  sad: ['down', 'down'],
  done: ['down', 'up'],
  confused: ['scratch', 'down'],
};

/** The vacuum, drawn behind (cleaner + hose) and in front (wand + nozzle). */
function VacuumBack() {
  return (
    <>
      <rect
        x="200"
        y="196"
        width="70"
        height="44"
        rx="14"
        fill="#f08a3c"
        stroke="#8a3a10"
        strokeWidth="3"
      />
      <circle cx="214" cy="244" r="7" fill="#2b2b33" />
      <circle cx="256" cy="244" r="7" fill="#2b2b33" />
      <path
        d="M206 206 C 170 210, 176 170, 180 158"
        stroke="#5a5f6e"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
    </>
  );
}
function VacuumFront() {
  return (
    <>
      <path
        d="M180 156 L254 118"
        stroke="#8a8f9c"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* data-nozzle marks where the wash animation should pull windows toward */}
      <rect
        data-nozzle=""
        x="250"
        y="104"
        width="24"
        height="18"
        rx="3"
        fill="#f08a3c"
        stroke="#8a3a10"
        strokeWidth="2.5"
        transform="rotate(-27 262 113)"
      />
      <path
        d="M272 82 c-8 0 -10 -10 -2 -12 c2 -8 14 -9 18 -2 c6 -6 16 -2 16 5 c8 -1 10 9 2 9 z"
        fill="#f6ebd8"
        stroke="#8dbbe8"
        strokeWidth="2.5"
      />
      <path
        d="M262 70 l12 8 M268 56 l10 12"
        stroke="#8dbbe8"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </>
  );
}

function SadSign() {
  return (
    <g transform="rotate(8 169 191)">
      <rect
        x="146"
        y="176"
        width="46"
        height="30"
        rx="3"
        fill="#fff"
        stroke={INK}
        strokeWidth="2.5"
      />
      <text
        x="152"
        y="198"
        fontFamily="Gaegu, cursive"
        fontWeight="700"
        fontSize="20"
        fill="#d63c3c"
      >
        404
      </text>
    </g>
  );
}

function ThumbUp({ id }: { id: Ids }) {
  return (
    <rect
      x="167"
      y="78"
      width="7"
      height="14"
      rx="3"
      fill={`url(#${id.skin})`}
      stroke={SKIN_LINE}
      strokeWidth="2"
    />
  );
}

interface KristianProps {
  mood?: KristianMood;
  className?: string;
  idPrefix?: string;
  /** Decorative by default; pass a label to expose it as an image. */
  label?: string;
}

/** Kristian standing, full body. */
export function Kristian({
  mood = 'idle',
  className,
  idPrefix = 'kr',
  label,
}: KristianProps) {
  const id = ids(idPrefix);
  const [l, r] = POSES[mood];
  const wide = mood === 'vacuuming';
  return (
    <svg
      viewBox={wide ? '0 0 300 260' : '0 0 200 260'}
      className={className}
      data-mood={mood}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      <Defs id={id} />
      <g filter={`url(#${id.cray})`}>
        {wide ? <VacuumBack /> : null}
        <Torso id={id} />
        <Arm side="l" pose={l} id={id} />
        <Arm side="r" pose={r} id={id} />
        <Head id={id} />
        <Hair />
        <Glasses />
        {FACES[mood]}
        {mood === 'done' ? <ThumbUp id={id} /> : null}
        {mood === 'sad' ? <SadSign /> : null}
        {wide ? <VacuumFront /> : null}
        <Extras mood={mood} />
      </g>
    </svg>
  );
}

// ---------- peek -----------------------------------------------------------------

interface PeekProps {
  mood?: KristianMood;
  /** Face shown while hovered/focused (CSS swaps it in, no JS). */
  hoverMood?: KristianMood;
  className?: string;
  idPrefix?: string;
}

/**
 * Kristian peeking up over the bottom edge, hands gripping it. `idle` uses
 * his curious look-up face. Both faces are rendered; `.kr-face-hover` is
 * hidden until the parent is hovered or focused (see fun.css).
 */
export function KristianPeek({
  mood = 'idle',
  hoverMood,
  className,
  idPrefix = 'krp',
}: PeekProps) {
  const id = ids(idPrefix);
  const face = (m: KristianMood) => (m === 'idle' ? FACES.curious : FACES[m]);
  return (
    <svg aria-hidden="true" viewBox="0 0 200 170" className={className} data-mood={mood}>
      <Defs id={id} />
      <g filter={`url(#${id.cray})`}>
        {/* denim jacket, shirt, striped tie */}
        <path
          d="M36 172 Q44 132 100 126 Q156 132 164 172 Z"
          fill={`url(#${id.denim})`}
          stroke="#23457e"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M86 128 L114 128 L100 172 Z"
          fill="#fff"
          stroke="#9aa6b8"
          strokeWidth="2"
        />
        <path
          d="M95 133 L105 133 L108 172 L92 172 Z"
          fill="#d63c3c"
          stroke="#8e2020"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M93 150 L107 144 M93 165 L108 159" stroke="#1b2a55" strokeWidth="3.5" />
        <Head id={id} />
        <Hair />
        <Glasses />
        <g className={hoverMood ? 'kr-face' : undefined}>
          {face(mood)}
          {mood === 'vacuuming' || mood === 'sad' ? null : <Extras mood={mood} />}
        </g>
        {hoverMood ? (
          <g className="kr-face-hover">
            {face(hoverMood)}
            <Extras mood={hoverMood} />
          </g>
        ) : null}
        {/* hands gripping the edge */}
        <g fill={`url(#${id.skin})`} stroke={SKIN_LINE} strokeWidth="2">
          <ellipse cx="40" cy="160" rx="16" ry="11" />
          <ellipse cx="160" cy="160" rx="16" ry="11" />
        </g>
        <path
          d="M30 154 v10 M38 152 v12 M46 153 v11 M152 153 v11 M160 152 v12 M168 154 v10"
          stroke={SKIN_LINE}
          strokeWidth="2"
        />
      </g>
    </svg>
  );
}
