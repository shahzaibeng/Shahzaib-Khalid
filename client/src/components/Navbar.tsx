import { useEffect, useRef, useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import { site } from '../config/site';
import { Logo } from './Logo';
import { ResumeLink } from './ResumeLink';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };
    media.addEventListener('change', closeOnDesktop);
    return () => media.removeEventListener('change', closeOnDesktop);
  }, []);

  function navigationLinks(mobile = false) {
    return site.navigation.map(({ id, label }, index) => (
      <Link
        key={id}
        to={`/#${id}`}
        onClick={() => setMenuOpen(false)}
        className={mobile ? 'mobile-nav-link' : 'nav-link'}
        data-symbiote-target
        aria-current={
          location.pathname === '/' && location.hash === `#${id}` ? 'location' : undefined
        }
      >
        <span className="nav-index" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="nav-label">{label}</span>
      </Link>
    ));
  }

  return (
    <header className="site-header night">
      <nav
        aria-label="Main navigation"
        className="nav-pill"
        data-open={menuOpen}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && menuOpen) {
            setMenuOpen(false);
            menuButton.current?.focus();
          }
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false);
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            className="brand-link"
            data-symbiote-target
            aria-label={`${site.name} — home`}
            onClick={() => setMenuOpen(false)}
          >
            <Logo className="h-7 w-auto shrink-0 text-ink" />
            <span className="hidden whitespace-nowrap text-[15px] font-semibold tracking-[-0.02em] sm:inline lg:hidden">
              {site.name}
            </span>
          </Link>
          <div className="hidden items-center gap-1 lg:flex">{navigationLinks()}</div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {site.availableForWork && (
              <Link
                to="/#status"
                className="available-pill hidden sm:inline-flex"
                data-symbiote-target
                aria-label="Available for work — see status"
                onClick={() => setMenuOpen(false)}
              >
                <span className="hud-live" aria-hidden="true" />
                Available
              </Link>
            )}
            <div className="hidden border-l border-white/10 pl-4 sm:block">
              <ResumeLink />
            </div>
            <ThemeToggle />
            <button
              ref={menuButton}
              type="button"
              className="icon-button lg:hidden"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? (
                <FiX size={21} aria-hidden="true" />
              ) : (
                <FiMenu size={21} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
        <div
          id="mobile-navigation"
          hidden={!menuOpen}
          className="mt-3 border-t border-white/10 pb-2 pt-3 lg:hidden"
        >
          <div className="grid gap-1">{navigationLinks(true)}</div>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3 sm:hidden">
            <ResumeLink />
            {site.availableForWork && (
              <Link
                to="/#status"
                className="available-pill"
                data-symbiote-target
                onClick={() => setMenuOpen(false)}
              >
                <span className="hud-live" aria-hidden="true" />
                Available
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
