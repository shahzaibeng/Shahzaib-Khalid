import { lazy, Suspense } from 'react';
import { Hero } from '../components/hero/Hero';

// Section pages load on first open, so the home screen ships less code.
const SectionOverlay = lazy(() =>
  import('../components/SectionOverlay').then((module) => ({ default: module.SectionOverlay })),
);

// The home page is one locked screen; every section opens in an overlay from the navbar.
export function HomePage() {
  return (
    <div id="top" tabIndex={-1} className="focus:outline-none">
      <Hero />
      <Suspense fallback={null}>
        <SectionOverlay />
      </Suspense>
    </div>
  );
}
