// Architecture: a desert night with three pyramids on the horizon. Each face is drawn in
// courses (horizontal layers), and a slow band of light sweeps across the lit faces.

const stars = Array.from({ length: 46 }, (_, i) => ({
  x: (i * 197) % 1600,
  y: (i * 89) % 420,
  r: i % 7 === 0 ? 1.4 : 0.8,
  delay: (i % 9) * 0.7,
}));

interface Pyramid {
  apex: [number, number];
  base: number; // half-width at ground
  ridge: number; // how far the ridge sits right of centre (view angle)
}

const ground = 760;
const pyramids: Pyramid[] = [
  { apex: [1190, 430], base: 300, ridge: 64 },
  { apex: [900, 535], base: 210, ridge: 44 },
  { apex: [1455, 585], base: 165, ridge: 34 },
];

function courses({ apex, base, ridge }: Pyramid, side: 'lit' | 'shade') {
  const lines: string[] = [];
  const height = ground - apex[1];
  for (let i = 1; i < 14; i++) {
    const t = i / 14;
    const y = apex[1] + height * t;
    const ridgeX = apex[0] + ridge * t;
    const edgeX = side === 'lit' ? apex[0] - base * t : apex[0] + base * t;
    lines.push(`M${ridgeX.toFixed(1)} ${y.toFixed(1)}L${edgeX.toFixed(1)} ${y.toFixed(1)}`);
  }
  return lines.join('');
}

export function PyramidsBackdrop() {
  return (
    <svg
      className="theme-art pyramids-art"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="py-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c0c0d" />
          <stop offset="0.62" stopColor="#17140f" />
          <stop offset="1" stopColor="#2a2116" />
        </linearGradient>
        <linearGradient id="py-lit" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9c29c" stopOpacity="0.55" />
          <stop offset="1" stopColor="#5f4a2e" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="py-shade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a241b" />
          <stop offset="1" stopColor="#141210" />
        </linearGradient>
        <linearGradient id="py-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2e1f" />
          <stop offset="1" stopColor="#120f0b" />
        </linearGradient>
        <linearGradient id="py-sweep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f3e7d3" stopOpacity="0" />
          <stop offset="0.5" stopColor="#f3e7d3" stopOpacity="0.28" />
          <stop offset="1" stopColor="#f3e7d3" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="py-moon" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f3e7d3" stopOpacity="0.55" />
          <stop offset="1" stopColor="#f3e7d3" stopOpacity="0" />
        </radialGradient>
        {pyramids.map((pyramid, i) => (
          <clipPath key={i} id={`py-lit-${i}`}>
            <path d={litFace(pyramid)} />
          </clipPath>
        ))}
      </defs>
      <rect width="1600" height="900" fill="url(#py-sky)" />
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
      <circle cx="1000" cy="112" r="110" fill="url(#py-moon)" />
      <circle cx="1000" cy="112" r="18" fill="#ece7df" opacity="0.85" />
      {pyramids.map((pyramid, i) => (
        <g key={i} className="pyramid">
          <path d={shadeFace(pyramid)} fill="url(#py-shade)" />
          <path d={litFace(pyramid)} fill="url(#py-lit)" />
          <path d={courses(pyramid, 'lit')} className="pyramid-course" />
          <path d={courses(pyramid, 'shade')} className="pyramid-course pyramid-course-shade" />
          <g clipPath={`url(#py-lit-${i})`}>
            <rect
              className="pyramid-sweep"
              x={pyramid.apex[0] - pyramid.base - 200}
              y={pyramid.apex[1]}
              width="200"
              height={ground - pyramid.apex[1]}
              fill="url(#py-sweep)"
              style={{ animationDelay: `${i * -3}s` }}
            />
          </g>
          <path
            d={`M${pyramid.apex[0]} ${pyramid.apex[1]}L${pyramid.apex[0] + pyramid.ridge} ${ground}`}
            className="pyramid-ridge"
          />
        </g>
      ))}
      <path
        d="M0 760 C 300 735 520 772 820 752 S 1300 740 1600 758 V 900 H 0 Z"
        fill="url(#py-sand)"
      />
      <path d="M0 800 C 260 786 540 812 900 796 S 1380 790 1600 804" className="pyramid-dune" />
    </svg>
  );
}

function litFace({ apex, base, ridge }: Pyramid) {
  return `M${apex[0]} ${apex[1]}L${apex[0] + ridge} ${ground}L${apex[0] - base} ${ground}Z`;
}

function shadeFace({ apex, base, ridge }: Pyramid) {
  return `M${apex[0]} ${apex[1]}L${apex[0] + base} ${ground}L${apex[0] + ridge} ${ground}Z`;
}
