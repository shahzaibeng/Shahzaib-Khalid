import { Hero } from '../components/hero/Hero';
import { SectionOverlay } from '../components/SectionOverlay';

// The home page is one locked screen; every section opens in an overlay from the navbar.
export function HomePage() {
  return (
    <div id="top" tabIndex={-1} className="focus:outline-none">
      <Hero />
      <SectionOverlay />
    </div>
  );
}
