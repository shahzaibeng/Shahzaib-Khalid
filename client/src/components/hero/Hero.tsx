import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FiArrowUpRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { heroHud, heroMetrics } from '../../config/content';
import { ChatSession } from '../../lib/assistant';
import { site } from '../../config/site';
import { ParticleField } from '../effects/ParticleField';
import { AnswerDrawer } from './AnswerDrawer';
import type { Exchange } from './AnswerDrawer';
import { AskBar } from './AskBar';
import { CodeWindow } from './CodeWindow';
import { CountUp } from './CountUp';

const ease = [0.22, 1, 0.36, 1] as const;
const container: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  shown: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease } },
};

export function Hero() {
  const [active, setActive] = useState(0);
  // While the visitor is reading the editor, it stays on the current file.
  const [held, setHeld] = useState(false);
  const select = useCallback((index: number) => setActive(index), []);
  const [thread, setThread] = useState<Exchange[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const nextId = useRef(0);
  // One conversation per visit, so follow-ups like "and Docker?" keep their context.
  const session = useRef(new ChatSession());
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // The answer is worked out at once, then revealed after a short "thinking" pause of
  // 1.5–2.5 s that steps through what the assistant is doing.
  const ask = useCallback((question: string) => {
    const id = nextId.current++;
    const answer = session.current.ask(question);
    const delay = 1500 + Math.random() * 1000;
    const patch = (change: Partial<Exchange>) =>
      setThread((current) =>
        current.map((item) => (item.id === id ? { ...item, ...change } : item)),
      );
    setThread((current) => [...current, { id, question, step: 0 }]);
    setDrawerOpen(true);
    timers.current.push(
      setTimeout(() => patch({ step: 1 }), delay / 3),
      setTimeout(() => patch({ step: 2 }), (delay * 2) / 3),
      setTimeout(() => patch({ answer }), delay),
    );
  }, []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <section className="hero" aria-labelledby="intro-title">
      <ParticleField />
      <div className="hero-vignette" aria-hidden="true" />
      <div className="hero-inner">
        <div className="hero-grid">
          <motion.div className="hero-copy" variants={container} initial="hidden" animate="shown">
            <div className="hero-copy-glow" aria-hidden="true" />

            <motion.p variants={item} className="hud-command">
              <span>{heroHud.tag}</span>
            </motion.p>

            <motion.h1 variants={item} id="intro-title" className="hero-name">
              <span className="hero-name-text">{site.name}</span>
              <span className="hero-name-dot">.</span>
            </motion.h1>

            <motion.div variants={item}>
              <AskBar onAsk={ask} />
            </motion.div>

            <motion.div variants={item} className="mt-10 flex flex-wrap gap-4">
              <Link to="/#projects" className="hero-cta hero-cta-primary" data-symbiote-target>
                Explore Systems
                <FiArrowUpRight aria-hidden="true" size={17} />
              </Link>
              <Link to="/#contact" className="hero-cta hero-cta-secondary" data-symbiote-target>
                Contact
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            id="hero-code"
            className="min-w-0"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.35, ease }}
            onPointerEnter={() => setHeld(true)}
            onPointerLeave={() => setHeld(false)}
          >
            <CodeWindow active={active} onSelect={select} held={held} />
          </motion.div>
        </div>

        <motion.dl
          className="hero-metrics"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease }}
        >
          {heroMetrics.map((metric) => (
            <div key={metric.label} className="hero-metric">
              <dt>{metric.label}</dt>
              <dd>
                {'value' in metric ? (
                  <>
                    <CountUp
                      value={metric.value}
                      decimals={'decimals' in metric ? metric.decimals : 0}
                    />
                    {metric.suffix}
                  </>
                ) : (
                  metric.text
                )}
              </dd>
            </div>
          ))}
        </motion.dl>
      </div>
      <AnswerDrawer open={drawerOpen} thread={thread} onAsk={ask} onClose={closeDrawer} />
    </section>
  );
}
