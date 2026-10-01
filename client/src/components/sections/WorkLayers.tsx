import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { delivery, skillGroups, workLayers } from '../../config/content';
import { skillIcons } from '../../lib/skillIcons';
import { Section } from './Section';

const skillsOf = (title: string) =>
  skillGroups.find((group) => group.title === title)?.skills ?? [];

// Apex first in the data (Interface); the pyramid draws Data at the base.
const tiers = [
  ...workLayers.map((layer) => ({ ...layer })),
  { name: 'Delivery', group: delivery.group, detail: delivery.detail },
];

const APEX: [number, number] = [300, 24];
const BASE_Y = 372;
const HALF = 270;
const RIDGE = 46; // the ridge sits right of centre, so the pyramid reads as 3D
const GAP = 7;

function halfWidth(y: number) {
  return (HALF * (y - APEX[1])) / (BASE_Y - APEX[1]);
}
function ridgeX(y: number) {
  return APEX[0] + (RIDGE * (y - APEX[1])) / (BASE_Y - APEX[1]);
}

// Tier boundaries as fractions of the height; the apex gets more room for its label.
const BOUNDS = [0, 0.34, 0.56, 0.78, 1];

function tierFaces(index: number) {
  const span = BASE_Y - APEX[1];
  const top = APEX[1] + BOUNDS[index] * span + (index ? GAP / 2 : 0);
  const bottom = APEX[1] + BOUNDS[index + 1] * span - GAP / 2;
  const [x] = APEX;
  const lit = [
    [ridgeX(top), top],
    [ridgeX(bottom), bottom],
    [x - halfWidth(bottom), bottom],
    [x - halfWidth(top), top],
  ];
  const shade = [
    [ridgeX(top), top],
    [x + halfWidth(top), top],
    [x + halfWidth(bottom), bottom],
    [ridgeX(bottom), bottom],
  ];
  const toPath = (points: number[][]) =>
    `M${points.map((p) => p.map((n) => n.toFixed(1)).join(' ')).join('L')}Z`;
  return {
    lit: toPath(lit),
    shade: toPath(shade),
    labelY: index === 0 ? top + (bottom - top) * 0.68 : (top + bottom) / 2,
    // Centred on the lit face.
    labelX:
      (x -
        halfWidth(index === 0 ? top + (bottom - top) * 0.68 : (top + bottom) / 2) +
        ridgeX((top + bottom) / 2)) /
      2,
  };
}

/** The four layers a feature passes through, drawn as a pyramid on a delivery platform. */
export function WorkLayers() {
  const [active, setActive] = useState(workLayers.length - 1);
  const [touched, setTouched] = useState(false);
  const reduced = useReducedMotion();
  const tier = tiers[active];

  // Until the visitor picks a tier, a light climbs the pyramid from the base to the apex.
  useEffect(() => {
    if (touched || reduced) return;
    const timer = setInterval(
      () => setActive((current) => (current <= 0 ? tiers.length - 1 : current - 1)),
      2600,
    );
    return () => clearInterval(timer);
  }, [touched, reduced]);

  const choose = (index: number) => {
    setTouched(true);
    setActive(index);
  };

  return (
    <Section id="layers" label="How I build" title="The layers I work across.">
      <div className="pyramid-layout">
        <div className="pyramid-figure">
          <svg viewBox="0 0 600 420" className="pyramid-svg" aria-hidden="true">
            <defs>
              <linearGradient id="tier-lit" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#d9c29c" />
                <stop offset="1" stopColor="#8f7654" />
              </linearGradient>
              <linearGradient id="tier-shade" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#3a3127" />
                <stop offset="1" stopColor="#1c1a17" />
              </linearGradient>
            </defs>
            {workLayers.map((layer, index) => {
              const faces = tierFaces(index);
              return (
                <g
                  key={layer.name}
                  className="pyramid-tier"
                  data-active={index === active || undefined}
                  onClick={() => choose(index)}
                  onPointerEnter={() => choose(index)}
                >
                  <path d={faces.shade} fill="url(#tier-shade)" />
                  <path d={faces.lit} fill="url(#tier-lit)" className="pyramid-tier-lit" />
                  <text
                    x={faces.labelX}
                    y={faces.labelY + 5}
                    textAnchor="middle"
                    className="pyramid-tier-label"
                  >
                    {layer.name}
                  </text>
                </g>
              );
            })}
            <g
              className="pyramid-tier pyramid-platform"
              data-active={active === tiers.length - 1 || undefined}
              onClick={() => choose(tiers.length - 1)}
              onPointerEnter={() => choose(tiers.length - 1)}
            >
              <path
                d={`M${APEX[0] - HALF - 22} ${BASE_Y + 10}H${APEX[0] + HALF + 22}L${APEX[0] + HALF + 4} ${BASE_Y + 36}H${APEX[0] - HALF - 4}Z`}
              />
              <text x={APEX[0]} y={BASE_Y + 28} textAnchor="middle" className="pyramid-tier-label">
                Delivery
              </text>
            </g>
          </svg>
          <div className="pyramid-picker" role="group" aria-label="Choose a layer">
            {tiers.map((item, index) => (
              <button
                key={item.name}
                type="button"
                className="pyramid-pick"
                aria-pressed={index === active}
                data-symbiote-target
                onClick={() => choose(index)}
                onFocus={() => choose(index)}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
        <div className="pyramid-detail" aria-live="polite" data-symbiote-target="card">
          <AnimatePresence mode="wait">
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <p className="pyramid-detail-index">
                {active === tiers.length - 1
                  ? 'Foundation'
                  : `Layer ${String(workLayers.length - active).padStart(2, '0')} of ${String(workLayers.length).padStart(2, '0')}`}
              </p>
              <h3 className="pyramid-detail-name">{tier.name}</h3>
              <p className="pyramid-detail-text">{tier.detail}</p>
              <ul className="layer-tools" aria-label={`${tier.name} tools`}>
                {skillsOf(tier.group).map((skill) => {
                  const Icon = skillIcons[skill];
                  return (
                    <li key={skill}>
                      {Icon && <Icon aria-hidden="true" />}
                      <span>{skill}</span>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}
