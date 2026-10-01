import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { FiX } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import type { OverlayId } from '../lib/assistant';
import { Footer } from './Footer';
import { AboutSection } from './sections/AboutSection';
import { BlogSection } from './sections/BlogSection';
import { ContactSection } from './sections/ContactSection';
import { CredentialsSection } from './sections/CredentialsSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { SkillsSection } from './sections/SkillsSection';
import { StatusSection } from './sections/StatusSection';
import { WorkLayers } from './sections/WorkLayers';
import { DesertBackdrop } from './themes/DesertBackdrop';
import { DimensionBackdrop } from './themes/DimensionBackdrop';
import { PyramidsBackdrop } from './themes/PyramidsBackdrop';
import { MarsBackdrop } from './themes/MarsBackdrop';
import { SpaceBackdrop } from './themes/SpaceBackdrop';
import { SystemsIntro } from './sections/SystemsIntro';

type Theme = 'pyramids' | 'space' | 'mars' | 'dimension' | 'desert';

const backdrops: Record<Theme, () => JSX.Element> = {
  pyramids: PyramidsBackdrop,
  space: SpaceBackdrop,
  mars: MarsBackdrop,
  dimension: DimensionBackdrop,
  desert: DesertBackdrop,
};

// Each hash opens one overlay with its own theme. Related sections share a panel.
const overlays: Record<
  OverlayId | 'blog' | 'layers',
  { title: string; theme: Theme; content: ReactNode }
> = {
  about: {
    title: 'Architecture',
    theme: 'pyramids',
    content: [<AboutSection key="a" />, <WorkLayers key="l" />, <ExperienceSection key="e" />],
  },
  layers: {
    title: 'Architecture',
    theme: 'pyramids',
    content: [<WorkLayers key="l" />, <ExperienceSection key="e" />, <AboutSection key="a" />],
  },
  experience: {
    title: 'Architecture',
    theme: 'pyramids',
    content: [<ExperienceSection key="e" />, <WorkLayers key="l" />, <AboutSection key="a" />],
  },
  skills: { title: 'Skills', theme: 'space', content: <SkillsSection /> },
  projects: {
    title: 'Systems',
    theme: 'mars',
    content: [<SystemsIntro key="i" />, <ProjectsSection key="p" />, <BlogSection key="b" />],
  },
  blog: {
    title: 'Systems',
    theme: 'mars',
    content: [<BlogSection key="b" />, <ProjectsSection key="p" />],
  },
  credentials: { title: 'Credentials', theme: 'dimension', content: <CredentialsSection /> },
  status: {
    title: 'Status',
    theme: 'desert',
    content: [<StatusSection key="st" />, <ContactSection key="c" />],
  },
  contact: {
    title: 'Contact',
    theme: 'desert',
    content: [<ContactSection key="c" />, <StatusSection key="st" />],
  },
};

/** Full-screen panel for the section named in the URL hash; the home page itself never scrolls. */
export function SectionOverlay() {
  const location = useLocation();
  const navigate = useNavigate();
  const id = location.hash.slice(1) as keyof typeof overlays;
  const overlay = overlays[id];
  const Backdrop = overlay ? backdrops[overlay.theme] : null;

  useEffect(() => {
    if (!overlay) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') navigate('/');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [overlay, navigate]);

  return (
    <AnimatePresence>
      {overlay && (
        <motion.div
          key="overlay"
          className="section-overlay night"
          data-theme={overlay.theme}
          role="dialog"
          aria-modal="true"
          aria-label={overlay.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="overlay-backdrop" data-theme={overlay.theme} aria-hidden="true">
            {Backdrop && <Backdrop />}
          </div>
          <motion.div
            className="overlay-panel night"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              className="overlay-close"
              onClick={() => navigate('/')}
              aria-label={`Close ${overlay.title}`}
              data-symbiote-target
            >
              <FiX size={18} aria-hidden="true" />
              <span>Close</span>
            </button>
            <div className="page-container">{overlay.content}</div>
            <Footer />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
