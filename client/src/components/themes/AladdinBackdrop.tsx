// Credentials: an Arabian night. A palace of onion domes and minarets rises beside a
// crescent moon, Aladdin glides across the sky on a magic carpet, and a lamp on the dunes
// lets out a curl of glittering smoke.

const stars = Array.from({ length: 70 }, (_, i) => ({
  x: (i * 229) % 1600,
  y: (i * 83) % 470,
  r: i % 9 === 0 ? 1.5 : 0.75,
  delay: (i % 12) * 0.5,
}));

const sparks = Array.from({ length: 12 }, (_, i) => ({
  x: (i % 4) * 9 - 14,
  delay: i * 0.45,
}));

function Dome({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  // An onion dome: swells out, then pinches to a finial.
  const r = w / 2;
  return (
    <g>
      <path
        d={`M${x - r} ${y} C ${x - r} ${y - h * 0.55}, ${x - r * 1.25} ${y - h * 0.62}, ${x} ${y - h} C ${x + r * 1.25} ${y - h * 0.62}, ${x + r} ${y - h * 0.55}, ${x + r} ${y} Z`}
        className="palace-dome"
      />
      <path d={`M${x} ${y - h} V${y - h - 18}`} className="palace-finial" />
      <circle cx={x} cy={y - h - 22} r="3.5" className="palace-orb" />
    </g>
  );
}

function Minaret({ x, base, top, w }: { x: number; base: number; top: number; w: number }) {
  return (
    <g>
      <rect x={x - w / 2} y={top} width={w} height={base - top} className="palace-wall" />
      <rect x={x - w / 2 - 6} y={top + 40} width={w + 12} height="7" className="palace-trim" />
      <rect
        x={x - w / 2 - 4}
        y={top + (base - top) * 0.55}
        width={w + 8}
        height="6"
        className="palace-trim"
      />
      <rect x={x - 4} y={top + 60} width="8" height="16" rx="4" className="palace-window" />
      <Dome x={x} y={top} w={w + 8} h={w * 1.3} />
    </g>
  );
}

function Arch({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <path
      d={`M${x} ${y} V${y - h + w / 2} Q ${x} ${y - h - w * 0.15} ${x + w / 2} ${y - h - w * 0.35} Q ${x + w} ${y - h - w * 0.15} ${x + w} ${y - h + w / 2} V${y} Z`}
      className="palace-window"
    />
  );
}

function Palm({ x, y, s, flip }: { x: number; y: number; s: number; flip?: boolean }) {
  const d = flip ? -1 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * d} ${s})`} className="palm">
      <path d="M0 0 C 6 -60 -4 -120 10 -170" className="palm-trunk" />
      {[
        'M10 -170 C 40 -190 70 -180 92 -150',
        'M10 -170 C 50 -170 72 -140 80 -112',
        'M10 -170 C -20 -195 -55 -185 -78 -158',
        'M10 -170 C -25 -172 -48 -146 -58 -118',
        'M10 -170 C 20 -205 50 -222 72 -214',
        'M10 -170 C 0 -208 -30 -222 -52 -216',
      ].map((leaf) => (
        <path key={leaf} d={leaf} className="palm-leaf" />
      ))}
    </g>
  );
}

export function AladdinBackdrop() {
  const ground = 760;
  return (
    <svg
      className="theme-art aladdin-art"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMaxYMax slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ad-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b0b10" />
          <stop offset="0.55" stopColor="#17141a" />
          <stop offset="0.82" stopColor="#3a2a1c" />
          <stop offset="1" stopColor="#5a3f25" />
        </linearGradient>
        <radialGradient id="ad-moon-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f3e7d3" stopOpacity="0.4" />
          <stop offset="1" stopColor="#f3e7d3" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ad-palace" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3127" />
          <stop offset="1" stopColor="#1c1814" />
        </linearGradient>
        <linearGradient id="ad-dome" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9c29c" />
          <stop offset="0.55" stopColor="#8f7654" />
          <stop offset="1" stopColor="#3a2e1f" />
        </linearGradient>
        <linearGradient id="ad-dune" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a3622" />
          <stop offset="1" stopColor="#120e0a" />
        </linearGradient>
        <linearGradient id="ad-carpet" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8f3f2e" />
          <stop offset="1" stopColor="#6b2c22" />
        </linearGradient>
        <radialGradient id="ad-lamp-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f3e7d3" stopOpacity="0.55" />
          <stop offset="1" stopColor="#c8a97e" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1600" height="900" fill="url(#ad-sky)" />
      <g className="theme-stars">
        {stars.map((star, i) => (
          <circle
            key={i}
            cx={star.x}
            cy={star.y}
            r={star.r}
            style={{ animationDelay: `${star.delay}s` }}
          />
        ))}
      </g>
      <path d="M1500 60 L1340 150" className="shooting-star" />
      <path d="M900 40 L760 118" className="shooting-star shooting-star-late" />

      {/* Crescent moon */}
      <circle cx="1060" cy="170" r="150" fill="url(#ad-moon-glow)" />
      <path d="M1060 98 A 72 72 0 1 0 1112 222 A 58 58 0 1 1 1060 98 Z" className="ad-moon" />

      {/* Palace */}
      <g className="palace">
        <Minaret x={1150} base={ground} top={360} w={34} />
        <Minaret x={1530} base={ground} top={330} w={36} />
        <rect
          x="1200"
          y="520"
          width="300"
          height={ground - 520}
          fill="url(#ad-palace)"
          className="palace-wall-outline"
        />
        <rect
          x="1180"
          y="600"
          width="70"
          height={ground - 600}
          fill="url(#ad-palace)"
          className="palace-wall-outline"
        />
        <rect
          x="1450"
          y="600"
          width="70"
          height={ground - 600}
          fill="url(#ad-palace)"
          className="palace-wall-outline"
        />
        <path
          d={`M1200 520 ${Array.from({ length: 15 }, () => 'h10 v-10 h10 v10').join(' ')}`}
          className="palace-crenel"
        />
        <Dome x={1350} y={520} w={150} h={170} />
        <Dome x={1245} y={530} w={64} h={84} />
        <Dome x={1455} y={530} w={64} h={84} />
        <rect
          x="1300"
          y="470"
          width="100"
          height="50"
          fill="url(#ad-palace)"
          className="palace-wall-outline"
        />
        <Arch x={1325} y={ground} w={50} h={92} />
        {[1222, 1262, 1420, 1460].map((x) => (
          <Arch key={x} x={x} y={640} w={18} h={44} />
        ))}
        {[1318, 1342, 1366].map((x) => (
          <Arch key={x} x={x} y={512} w={12} h={26} />
        ))}
        <rect x="1196" y="700" width="34" height="5" className="palace-trim" />
        <rect x="1470" y="700" width="34" height="5" className="palace-trim" />
      </g>

      {/* Dunes and palms */}
      <path
        d="M0 740 C 300 700 620 760 920 728 S 1400 744 1600 740 V900 H0 Z"
        fill="url(#ad-dune)"
        opacity="0.85"
      />
      <Palm x={1100} y={ground + 6} s={0.9} />
      <Palm x={1590} y={ground + 4} s={1.05} flip />
      <Palm x={1060} y={ground + 12} s={0.62} flip />
      <path
        d="M0 800 C 340 760 700 830 1040 790 S 1440 800 1600 790 V900 H0 Z"
        fill="url(#ad-dune)"
      />
      <path d="M0 800 C 340 760 700 830 1040 790 S 1440 800 1600 790" className="ad-ridge" />

      {/* The magic lamp */}
      <g transform="translate(330 812) scale(1.5)" className="lamp">
        <circle r="70" fill="url(#ad-lamp-glow)" className="lamp-glow" />
        <path d="M-44 0 C -40 -22 30 -22 34 0 Z" className="lamp-body" />
        <path d="M34 -6 C 52 -10 64 -22 78 -30 C 70 -16 58 -2 36 2" className="lamp-body" />
        <path d="M-44 -6 C -64 -10 -64 -30 -46 -28" className="lamp-handle" />
        <path d="M-12 -16 C -10 -28 6 -28 8 -16 Z" className="lamp-body" />
        <circle cx="-2" cy="-30" r="3" className="palace-orb" />
        <rect x="-26" y="0" width="44" height="6" rx="2" className="lamp-base" />
        <path
          d="M78 -30 C 96 -70 60 -100 90 -150 C 118 -196 70 -230 104 -280"
          className="lamp-smoke"
        />
        {sparks.map((spark, i) => (
          <circle
            key={i}
            cx={84 + spark.x}
            cy="-40"
            r="1.8"
            className="lamp-spark"
            style={{ animationDelay: `${spark.delay}s` }}
          />
        ))}
      </g>

      {/* Aladdin on the flying carpet */}
      <g className="carpet-flight">
        <g className="carpet-bob">
          <g transform="scale(1.8)">
            <g className="rider">
              <path
                d="M18 -6 C 16 -26 22 -40 34 -42 C 46 -40 50 -26 48 -6 Z"
                className="rider-vest"
              />
              <circle cx="34" cy="-52" r="9" className="rider-skin" />
              <path d="M24 -56 C 28 -66 40 -66 44 -58 Z" className="rider-hat" />
              <path d="M46 -34 C 58 -30 64 -36 70 -44" className="rider-arm" />
              <path d="M22 -10 C 10 -6 4 -2 -2 0" className="rider-arm" />
            </g>
            <path
              d="M-30 0 L 96 0 L 104 10 L -22 10 Z"
              fill="url(#ad-carpet)"
              className="carpet carpet-wave"
            />
            <path d="M-24 3 H 98 M-20 7 H 101" className="carpet-pattern" />
            {[-28, -24, -20, 100, 104, 108].map((x, i) => (
              <path
                key={x}
                d={`M${x} ${i < 3 ? 2 + i * 3 : 2 + (i - 3) * 3} l${i < 3 ? -8 : 8} 2`}
                className="carpet-tassel"
              />
            ))}
          </g>
        </g>
        <path d="M-60 12 C -170 4 -300 26 -460 6" className="carpet-trail" />
      </g>
    </svg>
  );
}
