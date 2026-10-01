// Skills: deep space behind the black-hole panel — faint stars and a warm nebula haze.

const stars = Array.from({ length: 70 }, (_, i) => ({
  x: (i * 223) % 1600,
  y: (i * 131) % 900,
  r: i % 9 === 0 ? 1.5 : 0.7,
  delay: (i % 11) * 0.6,
}));

export function SpaceBackdrop() {
  return (
    <svg
      className="theme-art space-art"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="space-haze" cx="0.75" cy="0.35" r="0.6">
          <stop offset="0" stopColor="#3a2e1f" stopOpacity="0.55" />
          <stop offset="1" stopColor="#3a2e1f" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill="#08080a" />
      <rect width="1600" height="900" fill="url(#space-haze)" />
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
    </svg>
  );
}
