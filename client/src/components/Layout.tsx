import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { SocialDock } from './SocialDock';
import { VenomCursor } from './effects/VenomCursor';

export function Layout() {
  const location = useLocation();
  const home = location.pathname === '/';

  // The home page never scrolls; its sections live in overlays.
  useEffect(() => {
    document.documentElement.classList.toggle('home-locked', home);
    return () => document.documentElement.classList.remove('home-locked');
  }, [home]);

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    // React Router updates the hash without performing native anchor scrolling.
    const target = document.getElementById(location.hash.slice(1));
    target?.scrollIntoView({ block: 'start' });
    target?.focus({ preventScroll: true });
  }, [location.key, location.hash]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <SocialDock />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      {/* On the home page the footer lives at the bottom of each overlay instead. */}
      {!home && <Footer />}
      <VenomCursor />
    </div>
  );
}
