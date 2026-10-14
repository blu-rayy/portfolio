// The fun-mode sky: a big hand-drawn orange sun and drifting crayon clouds.
// Pure decoration (aria-hidden). Shapes are drawn by hand; the only filter is
// the crayon "tooth" on the edges (fills stay solid). Motion lives in
// styles/fun.css and stops under prefers-reduced-motion.
//
// Clouds loop without a jump: every cloud has an identical twin one loop-length
// to its left. The pair slides right by exactly that length, so when the cloud
// leaves the right edge its twin is arriving at the cloud's starting spot, and
// the animation restarts on an identical frame.

const edgeFilter = (id: string) => (
  <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence
      type="fractalNoise"
      baseFrequency="1.15"
      numOctaves="2"
      seed="5"
      result="noise"
    />
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" result="rough" />
    <feMerge>
      <feMergeNode in="rough" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
);

const CLOUD_A =
  'M28 92 C8 92 4 66 24 60 C18 36 44 22 64 34 C70 12 104 4 120 24 C134 8 170 10 176 36 C200 30 222 48 212 70 C232 76 228 98 206 98 C160 102 70 100 28 92 Z';
const CLOUD_B =
  'M22 66 C4 66 4 44 22 42 C22 22 48 14 60 30 C70 10 102 10 108 30 C126 22 146 34 140 50 C158 54 156 72 136 72 C100 74 50 72 22 66 Z';

// Rendered once, in a zero-size (not display:none) svg, so both cloud layers can
// <use> the shapes at any breakpoint.
function CloudDefs() {
  return (
    <defs>
      {edgeFilter('sky-tex')}
      <g id="cloud-a" filter="url(#sky-tex)">
        <path d={CLOUD_A} fill="var(--cloud)" />
        <path
          d="M44 88 C84 93 152 93 202 88"
          fill="none"
          stroke="var(--haze)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M62 74 l14 -11 M78 80 l16 -12 M122 68 l16 -12 M140 76 l16 -12 M164 62 l12 -9 M100 84 l12 -9"
          stroke="#e6d5b6"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d={CLOUD_A.replace(/ Z$/, '').replace(
            'C160 102 70 100 28 92',
            'C160 102 70 100 30 93',
          )}
          fill="none"
          stroke="#fff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M31 96 C11 94 7 69 27 63 M67 37 C73 15 106 7 122 27 C137 11 172 14 178 39 M212 74 C231 80 228 100 204 101"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          opacity=".85"
        />
        <path
          d="M52 50 C58 40 74 37 84 43 M118 34 C124 26 138 24 146 30"
          fill="none"
          stroke="#fff"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>
      <g id="cloud-b" filter="url(#sky-tex)">
        <path d={CLOUD_B} fill="var(--cloud)" />
        <path
          d="M34 64 C64 68 106 68 136 64"
          fill="none"
          stroke="var(--haze)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M54 54 l12 -9 M70 58 l12 -9 M98 52 l12 -9 M112 58 l10 -8"
          stroke="#e6d5b6"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d={CLOUD_B.replace(/ Z$/, '').replace(
            'C100 74 50 72 22 66',
            'C100 74 50 72 24 67',
          )}
          fill="none"
          stroke="#fff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M25 70 C7 68 7 47 25 45 M63 33 C73 13 104 13 110 33 M141 53 C159 57 156 75 134 75"
          fill="none"
          stroke="#fff"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity=".85"
        />
        <path
          d="M38 36 C42 28 52 26 58 30"
          fill="none"
          stroke="#fff"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </g>
    </defs>
  );
}

interface CloudSpec {
  shape: 'a' | 'b';
  x: number;
  y: number;
  scale?: number;
  /** Seconds for one full pass across the screen. */
  seconds: number;
}

function Cloud({ c, loop }: { c: CloudSpec; loop: number }) {
  const tail = c.scale ? ` scale(${c.scale})` : '';
  return (
    <g className="sky-cloud" style={{ animationDuration: `${c.seconds}s` }}>
      <use href={`#cloud-${c.shape}`} transform={`translate(${c.x} ${c.y})${tail}`} />
      <use
        href={`#cloud-${c.shape}`}
        transform={`translate(${c.x - loop} ${c.y})${tail}`}
      />
    </g>
  );
}

// Starting layout from the final landing mockup. Loop length = width + both margins.
const DESKTOP_LOOP = 1820;
const DESKTOP: CloudSpec[] = [
  { shape: 'a', x: 60, y: 80, seconds: 140 },
  { shape: 'a', x: 990, y: 300, scale: 1.15, seconds: 192 },
  { shape: 'b', x: 470, y: 790, scale: 1.3, seconds: 164 },
  { shape: 'b', x: 1130, y: 760, seconds: 220 },
  { shape: 'b', x: 16, y: 470, scale: 0.9, seconds: 176 },
  { shape: 'b', x: 650, y: 22, scale: 0.8, seconds: 208 },
];
const PHONE_LOOP = 630;
const PHONE: CloudSpec[] = [
  { shape: 'b', x: 230, y: 650, seconds: 76 },
  { shape: 'b', x: 190, y: 548, scale: 0.75, seconds: 104 },
];

export function Sun({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 300 300" className={className}>
      <defs>{edgeFilter('sun-tex')}</defs>
      <g filter="url(#sun-tex)">
        <g
          className="sky-rays"
          fill="none"
          stroke="var(--orange)"
          strokeWidth="9"
          strokeLinecap="round"
        >
          <path d="M150 46 C145 33 155 22 150 8" />
          <path d="M150 254 C155 267 145 280 150 294" />
          <path d="M46 150 C33 155 22 145 8 150" />
          <path d="M254 150 C267 145 280 155 294 150" />
          <path d="M78 78 C68 71 66 58 54 51" />
          <path d="M222 78 C230 67 243 66 249 53" />
          <path d="M78 222 C67 230 66 243 53 249" />
          <path d="M222 222 C232 229 234 242 247 248" />
          <path
            d="M106 52 l-7 -17 M195 52 l7 -17 M106 248 l-7 17 M195 248 l7 17 M52 105 l-17 -7 M52 196 l-17 7 M248 105 l17 -7 M248 196 l17 7"
            strokeWidth="7"
          />
        </g>
        <path
          d="M151 61 C201 59 241 97 239 149 C237 201 199 239 147 237 C95 235 59 199 61 147 C63 99 101 63 151 61 Z"
          fill="var(--orange)"
        />
        <path
          d="M104 106 L188 90 M98 128 L204 108 M92 152 L210 132 M96 176 L206 158 M106 200 L198 184 M124 220 L180 210"
          stroke="var(--orange-deep)"
          strokeWidth="5"
          strokeLinecap="round"
          opacity=".55"
        />
        <path
          d="M153 59 C203 61 243 99 241 151 C239 203 197 241 145 239 C93 237 57 197 59 145 C61 97 99 61 141 60"
          fill="none"
          stroke="var(--orange-deep)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M149 65 C196 64 233 99 234 146"
          fill="none"
          stroke="var(--orange-deep)"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity=".7"
        />
        <path
          d="M96 110 C108 88 130 78 154 78"
          fill="none"
          stroke="#ffc89a"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M90 132 C92 124 95 118 99 113"
          fill="none"
          stroke="#ffc89a"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export function Sky() {
  return (
    <div aria-hidden="true" className="sky">
      <svg width="0" height="0" className="absolute">
        <CloudDefs />
      </svg>
      <Sun className="sky-sun" />
      {/* desktop clouds (>= lg) */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="sky-clouds sky-clouds--desktop max-lg:hidden"
      >
        {DESKTOP.map((c, i) => (
          <Cloud key={i} c={c} loop={DESKTOP_LOOP} />
        ))}
      </svg>
      {/* phone clouds (< lg) */}
      <svg
        viewBox="0 0 390 844"
        preserveAspectRatio="xMidYMax slice"
        className="sky-clouds sky-clouds--phone lg:hidden"
      >
        {PHONE.map((c, i) => (
          <Cloud key={i} c={c} loop={PHONE_LOOP} />
        ))}
      </svg>
    </div>
  );
}

/** Animation distances, exported for styles/fun.css documentation and tests. */
export const SKY_LOOPS = { desktop: DESKTOP_LOOP, phone: PHONE_LOOP } as const;
