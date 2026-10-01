// Systems: a Mars colony at dusk, laid out like a system architecture. A ringed planet hangs
// over the mountains; each structure is a layer of the stack, joined by pipelines that carry
// data, with an uplink beaming to the planet.

const stars = Array.from({ length: 60 }, (_, i) => ({
  x: (i * 211) % 1600,
  y: (i * 97) % 380,
  r: i % 8 === 0 ? 1.3 : 0.7,
  delay: (i % 10) * 0.6,
}));

const dust = Array.from({ length: 30 }, (_, i) => ({
  y: 600 + ((i * 41) % 260),
  r: i % 5 === 0 ? 1.6 : 0.9,
  delay: (i * 1.3) % 16,
  duration: 14 + (i % 6) * 3,
}));

const craters: [number, number, number][] = [
  [140, 840, 46],
  [420, 812, 22],
  [690, 868, 60],
  [1040, 852, 30],
  [1300, 878, 52],
  [1500, 830, 20],
  [260, 772, 14],
];

// Pipeline joining the structures; data pulses travel along it.
const pipeline =
  'M820 752 H912 Q930 752 935 742 M1025 742 Q1032 752 1050 752 H1068 M1212 752 H1255 M1325 752 H1380 M1460 752 H1500';

function Label({
  x,
  y,
  tx,
  ty,
  code,
  name,
}: {
  x: number;
  y: number;
  tx: number;
  ty: number;
  code: string;
  name: string;
}) {
  return (
    <g className="mars-label">
      <path d={`M${x} ${y}L${x} ${ty + 8}L${tx} ${ty + 8}`} className="mars-leader" />
      <circle cx={x} cy={y} r="2.4" className="mars-anchor" />
      <text x={tx} y={ty} className="mars-code">
        {code}
      </text>
      <text x={tx} y={ty + 22} className="mars-name">
        {name}
      </text>
    </g>
  );
}

export function MarsBackdrop() {
  return (
    <svg
      className="theme-art mars-art"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMaxYMax slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="mars-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b0908" />
          <stop offset="0.45" stopColor="#1d120d" />
          <stop offset="0.66" stopColor="#4a2a1a" />
          <stop offset="0.74" stopColor="#7a4a2c" />
        </linearGradient>
        <radialGradient id="planet-body" cx="0.3" cy="0.32" r="0.8">
          <stop offset="0" stopColor="#f3e7d3" />
          <stop offset="0.45" stopColor="#d9c29c" />
          <stop offset="0.8" stopColor="#8f7654" />
          <stop offset="1" stopColor="#3a2e1f" />
        </radialGradient>
        <linearGradient id="planet-night" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.45" stopColor="#0b0908" stopOpacity="0" />
          <stop offset="1" stopColor="#0b0908" stopOpacity="0.85" />
        </linearGradient>
        <radialGradient id="planet-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.55" stopColor="#d9c29c" stopOpacity="0.22" />
          <stop offset="1" stopColor="#d9c29c" stopOpacity="0" />
        </radialGradient>
        <clipPath id="planet-clip">
          <circle r="158" />
        </clipPath>
        <clipPath id="ring-back">
          <rect x="-420" y="-200" width="840" height="200" />
        </clipPath>
        <clipPath id="ring-front">
          <rect x="-420" y="0" width="840" height="200" />
        </clipPath>
        <linearGradient id="range-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b3a22" />
          <stop offset="1" stopColor="#3d2216" />
        </linearGradient>
        <linearGradient id="range-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4d2918" />
          <stop offset="1" stopColor="#2a170f" />
        </linearGradient>
        <linearGradient id="mars-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a2f1c" />
          <stop offset="0.5" stopColor="#3a1f13" />
          <stop offset="1" stopColor="#140b07" />
        </linearGradient>
        <linearGradient id="dome-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3e7d3" stopOpacity="0.5" />
          <stop offset="1" stopColor="#8f7654" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id="module-metal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5f4a2e" />
          <stop offset="0.5" stopColor="#3a3127" />
          <stop offset="1" stopColor="#1f1a15" />
        </linearGradient>
        <radialGradient id="lab-core" cx="0.5" cy="0.6" r="0.5">
          <stop offset="0" stopColor="#fff4e0" stopOpacity="0.9" />
          <stop offset="1" stopColor="#c8a97e" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="horizon-haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c8a97e" stopOpacity="0" />
          <stop offset="0.5" stopColor="#c8a97e" stopOpacity="0.16" />
          <stop offset="1" stopColor="#c8a97e" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="1600" height="900" fill="url(#mars-sky)" />
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

      {/* The ringed planet */}
      <g transform="translate(1190 250)" className="mars-planet">
        <circle r="250" fill="url(#planet-glow)" />
        <g transform="rotate(-18)">
          <g clipPath="url(#ring-back)" className="planet-rings">
            <ellipse rx="300" ry="64" />
            <ellipse rx="272" ry="58" />
            <ellipse rx="246" ry="52" className="planet-ring-bright" />
            <ellipse rx="224" ry="47" />
          </g>
        </g>
        <circle r="158" fill="url(#planet-body)" />
        <g clipPath="url(#planet-clip)">
          <g transform="rotate(-18)" className="planet-bands">
            <rect x="-200" y="-96" width="400" height="14" />
            <rect x="-200" y="-58" width="400" height="26" className="planet-band-strong" />
            <rect x="-200" y="-10" width="400" height="10" />
            <rect x="-200" y="22" width="400" height="30" className="planet-band-strong" />
            <rect x="-200" y="74" width="400" height="12" />
            <ellipse cx="-40" cy="38" rx="26" ry="10" className="planet-storm" />
          </g>
          <circle r="158" fill="url(#planet-night)" />
        </g>
        <g transform="rotate(-18)">
          <g clipPath="url(#ring-front)" className="planet-rings">
            <ellipse rx="300" ry="64" />
            <ellipse rx="272" ry="58" />
            <ellipse rx="246" ry="52" className="planet-ring-bright" />
            <ellipse rx="224" ry="47" />
          </g>
        </g>
      </g>

      {/* Phobos and Deimos */}
      <circle cx="760" cy="130" r="13" className="mars-moon" />
      <circle cx="756" cy="127" r="13" className="mars-moon-shadow" />
      <circle cx="930" cy="300" r="6" className="mars-moon" />

      {/* Mountains: a far range, a broad shield volcano, and a nearer ridge */}
      <path
        d="M0 600 L120 560 L210 585 L330 520 L430 575 L560 540 L700 590 L820 548 L960 596 L1100 560 L1240 600 L1380 566 L1500 596 L1600 574 V720 H0 Z"
        fill="url(#range-far)"
        opacity="0.8"
      />
      <path
        d="M-40 680 C 120 640 220 560 380 548 C 470 542 520 560 560 566 C 650 580 760 640 900 662 L1100 640 L1260 668 L1420 630 L1600 664 V760 H-40 Z"
        fill="url(#range-mid)"
      />
      <path d="M330 552 C 380 544 420 545 470 552" className="mars-caldera" />
      <path
        d="M-40 680 C 120 640 220 560 380 548 C 470 542 520 560 560 566 C 650 580 760 640 900 662"
        className="mars-ridge"
      />
      <rect
        x="0"
        y="610"
        width="1600"
        height="110"
        fill="url(#horizon-haze)"
        className="mars-haze"
      />

      {/* Ground */}
      <path
        d="M0 728 C 260 712 520 742 820 730 S 1300 722 1600 734 V900 H0 Z"
        fill="url(#mars-ground)"
      />
      {craters.map(([cx, cy, r]) => (
        <g key={`${cx}-${cy}`}>
          <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.26} className="crater" />
          <path
            d={`M${cx - r} ${cy} A ${r} ${r * 0.26} 0 0 1 ${cx + r} ${cy}`}
            className="crater-rim"
          />
        </g>
      ))}
      <path d="M560 806 C 800 790 1080 796 1600 786" className="rover-track" />
      <path d="M560 814 C 800 798 1080 804 1600 794" className="rover-track" />

      {/* Colony */}
      <g className="colony">
        {/* PAD-00: landing pad */}
        <ellipse cx="820" cy="756" rx="72" ry="13" className="pad" />
        <ellipse cx="820" cy="756" rx="46" ry="8" className="pad-ring" />
        {[748, 790, 850, 892].map((x, i) => (
          <circle
            key={x}
            cx={x}
            cy={i % 3 ? 760 : 752}
            r="2.6"
            className="pad-light"
            style={{ animationDelay: `${i * 0.35}s` }}
          />
        ))}

        {/* Solar arrays */}
        {[860, 892, 924].map((x) => (
          <g key={x}>
            <path d={`M${x} 784 l24 -14 l10 6 l-24 14 Z`} className="solar" />
            <path d={`M${x + 17} 777 v12`} className="strut" />
          </g>
        ))}

        {/* HAB-01: habitat dome */}
        <path d="M920 752 A 60 60 0 0 1 1040 752 Z" fill="url(#dome-glass)" className="dome" />
        <path
          d="M940 752 A 40 52 0 0 1 1020 752 M980 692 V752 M925 730 H1035 M935 712 H1025"
          className="dome-frame"
        />
        <rect x="968" y="736" width="24" height="16" rx="3" className="window" />

        {/* LAB-02: geodesic AI lab with a glowing core */}
        <circle cx="1140" cy="740" r="56" fill="url(#lab-core)" className="lab-core" />
        <path d="M1062 752 A 78 78 0 0 1 1218 752 Z" fill="url(#dome-glass)" className="dome" />
        <path
          d="M1062 752 L1100 690 L1140 674 L1180 690 L1218 752 M1100 690 L1140 752 L1180 690 M1082 718 L1140 674 L1198 718 M1082 718 L1120 752 M1198 718 L1160 752 M1100 690 L1082 718 M1180 690 L1198 718"
          className="dome-frame"
        />

        {/* CORE-03: stacked service modules */}
        <rect
          x="1255"
          y="700"
          width="70"
          height="52"
          rx="4"
          fill="url(#module-metal)"
          className="module"
        />
        <rect
          x="1265"
          y="660"
          width="50"
          height="40"
          rx="4"
          fill="url(#module-metal)"
          className="module"
        />
        <rect
          x="1275"
          y="632"
          width="30"
          height="28"
          rx="3"
          fill="url(#module-metal)"
          className="module"
        />
        {[0, 1, 2].map((col) =>
          [0, 1].map((row) => (
            <rect
              key={`${col}-${row}`}
              x={1263 + col * 20}
              y={710 + row * 18}
              width="12"
              height="8"
              rx="1.5"
              className="window window-blink"
              style={{ animationDelay: `${(col + row * 3) * 0.7}s` }}
            />
          )),
        )}
        <rect x="1278" y="670" width="24" height="8" rx="1.5" className="window" />
        <path d="M1290 632 V610" className="strut" />
        <circle cx="1290" cy="608" r="3" className="pad-light" />

        {/* VAULT-04: half-buried data vault */}
        <path
          d="M1380 752 L1392 720 H1448 L1460 752 Z"
          fill="url(#module-metal)"
          className="module"
        />
        <rect x="1408" y="732" width="24" height="20" rx="2" className="vault-door" />
        <path d="M1412 742 H1428 M1420 734 V750" className="vault-lock" />

        {/* UPLINK: comms mast and dish aimed at the planet */}
        <path
          d="M1520 752 L1530 640 L1540 752 M1523 716 L1537 716 M1525 690 L1535 690 M1527 664 L1533 664 M1523 716 L1535 690 M1537 716 L1525 690"
          className="mast"
        />
        <g transform="translate(1530 636) rotate(-38)">
          <path d="M-22 0 A 22 22 0 0 0 22 0 Z" className="dish" />
          <path d="M0 0 V-18" className="strut" />
        </g>
        <path d="M1514 618 L1260 360" className="uplink-beam" />
        <circle cx="1530" cy="636" r="5" className="uplink-pulse" />

        {/* Pipelines between structures, carrying data */}
        <path d={pipeline} className="pipe" />
        <path d={pipeline} className="pipe-flow" pathLength={100} />

        {/* Rover */}
        <g className="rover">
          <rect x="0" y="-16" width="38" height="12" rx="3" className="rover-body" />
          <path d="M8 -16 V-26 M8 -26 H18" className="strut" />
          <circle cx="7" cy="-2" r="4.5" className="rover-wheel" />
          <circle cx="19" cy="-2" r="4.5" className="rover-wheel" />
          <circle cx="31" cy="-2" r="4.5" className="rover-wheel" />
          <circle cx="18" cy="-26" r="2" className="pad-light" />
        </g>
      </g>

      {/* Architecture labels: each structure is a layer of the system */}
      <Label x={820} y={762} tx={830} ty={826} code="PAD-00" name="Deploy · Docker" />
      <Label x={980} y={694} tx={930} ty={610} code="HAB-01" name="Interface · React" />
      <Label x={1140} y={676} tx={1090} ty={590} code="LAB-02" name="AI agents · LLMs" />
      <Label x={1290} y={606} tx={1300} ty={540} code="CORE-03" name="Services · FastAPI" />
      <Label x={1420} y={720} tx={1400} ty={650} code="VAULT-04" name="Data · PostgreSQL" />
      <g className="mars-label">
        <text x="1380" y="470" className="mars-code">
          UPLINK
        </text>
        <text x="1380" y="492" className="mars-name">
          LLM APIs · REST
        </text>
      </g>

      {/* Dust on the wind */}
      <g className="mars-dust">
        {dust.map((grain, i) => (
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
