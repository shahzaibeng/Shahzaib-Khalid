import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

export function NotFoundPage() {
  return (
    <div className="page-container pb-24 pt-40 sm:pb-36 sm:pt-48">
      <p className="eyebrow">404 / A little off the path</p>
      <h1 className="mt-7 font-display text-5xl tracking-tight sm:text-7xl">Nothing here, yet.</h1>
      <p className="mt-6 max-w-md leading-7 text-muted">
        This page may have moved, or the address may be incomplete. Let’s get you back home.
      </p>
      <Link to="/" className="button-primary mt-8 w-fit" data-symbiote-target>
        <FiArrowLeft aria-hidden="true" />
        Back to home
      </Link>
    </div>
  );
}
