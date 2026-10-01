// Status: golden hour over the desert. A low sun rises slowly behind layered dunes, heat
// shimmers above the horizon, and sand drifts on the wind.

const grains = Array.from({ length: 26 }, (_, i) => ({
  y: 690 + ((i * 47) % 190),
  r: i % 4 === 0 ? 1.6 : 1,
  delay: (i * 0.9) % 12,
  duration: 9 + (i % 5) * 2,
}));

export function DesertBackdrop() {
  return (
    <svg
      className="theme-art desert-art"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="desert-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0e0d0c" />
          <stop offset="0.45" stopColor="#2b2116" />
          <stop offset="0.7" stopColor="#6b4f30" />
          <stop offset="0.78" stopColor="#a8804f" />
        </linearGradient>
        <radialGradient id="desert-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff4e0" />
          <stop offset="0.55" stopColor="#f3e7d3" />
          <stop offset="1" stopColor="#d9c29c" />
        </radialGradient>
        <radialGradient id="desert-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f3e7d3" stopOpacity="0.5" />
          <stop offset="0.4" stopColor="#c8a97e" stopOpacity="0.18" />
          <stop offset="1" stopColor="#c8a97e" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dune-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8f6f47" />
          <stop offset="1" stopColor="#5f4a2e" />
        </linearGradient>
        <linearGradient id="dune-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5f4a2e" />
          <stop offset="1" stopColor="#3a2e1f" />
        </linearGradient>
        <linearGradient id="dune-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2e2418" />
          <stop offset="1" stopColor="#14110d" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#desert-sky)" />
      <g className="desert-sun">
        <circle cx="1170" cy="640" r="260" fill="url(#desert-glow)" />
        <circle cx="1170" cy="640" r="84" fill="url(#desert-sun)" />
      </g>
      <g className="desert-shimmer">
        <path d="M720 662 H1600" />
        <path d="M800 670 H1600" />
        <path d="M680 678 H1600" />
      </g>
      <path
        d="M0 690 C 220 650 420 700 640 668 S 1040 640 1260 664 S 1520 650 1600 660 V 900 H 0 Z"
        fill="url(#dune-far)"
      />
      <path
        d="M0 740 C 260 690 520 760 820 716 S 1240 700 1600 726 V 900 H 0 Z"
        fill="url(#dune-mid)"
      />
      <path d="M0 740 C 260 690 520 760 820 716 S 1240 700 1600 726" className="dune-ridge" />
      <path
        d="M0 820 C 300 760 640 840 980 786 S 1420 780 1600 800 V 900 H 0 Z"
        fill="url(#dune-near)"
      />
      <path
        d="M0 820 C 300 760 640 840 980 786 S 1420 780 1600 800"
        className="dune-ridge dune-ridge-near"
      />
      <g className="desert-grains">
        {grains.map((grain, i) => (
          <circle
            key={i}
            cx="-20"
            cy={grain.y}
            r={grain.r}
            style={{ animationDelay: `${-grain.delay}s`, animationDuration: `${grain.duration}s` }}
          />
        ))}
      </g>
    </svg>
  );
}
