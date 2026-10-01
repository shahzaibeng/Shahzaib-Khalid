import { FiArrowUp } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { site } from '../config/site';
import { useTheme } from '../hooks/useTheme';
import { Logo } from './Logo';
import { SocialLinks } from './SocialLinks';

export function Footer() {
  const { preference, setPreference } = useTheme();
  return (
    <footer className="border-t border-border">
      <div className="page-container">
        <div className="flex flex-col justify-between gap-8 py-10 md:flex-row md:items-center">
          <div>
            <Link to="/" className="brand-link w-fit" aria-label={`${site.name} — home`}>
              <Logo className="h-6 w-auto text-ink" />
              <span className="text-sm font-semibold">{site.name}</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-muted">{site.tagline}</p>
          </div>
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-muted">
              Elsewhere on the internet
            </p>
            <SocialLinks />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-t border-border py-6 text-xs text-muted">
          <p>
            © {new Date().getFullYear()} {site.name}
          </p>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setPreference('system')}
              className="footer-action"
              disabled={preference === 'system'}
            >
              {preference === 'system' ? 'Theme follows your device' : 'Use device theme'}
            </button>
            <Link
              to="/#top"
              className="footer-action inline-flex items-center gap-2"
              data-symbiote-target
            >
              Back to top <FiArrowUp aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
