import { useId } from 'react';
import type { SVGProps } from 'react';

// A `<SK />` mark: code brackets in the symbiote gradient around a solid S and K.
export function Logo(props: SVGProps<SVGSVGElement>) {
  const gradient = useId();
  return (
    <svg viewBox="0 0 72 40" fill="none" aria-hidden="true" focusable="false" {...props}>
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="72" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#c8a97e" />
          <stop offset="1" stopColor="#8f7654" />
        </linearGradient>
      </defs>
      <g
        stroke={`url(#${gradient})`}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M13 9 4 20l9 11" />
        <path d="M49 31 54 9" />
        <path d="m59 9 9 11-9 11" />
      </g>
      <g fill="currentColor" transform="translate(17.5 6.5) scale(0.57)">
        <path d="M24 9H14a8 8 0 0 0 0 16h5a4 4 0 0 1 0 8H5v6h14a10 10 0 0 0 0-20h-5a2 2 0 0 1 0-4h10V9Z" />
        <path d="M25 9h6v12L40 9h7L35 24l12 15h-8L31 28v11h-6V9Z" />
      </g>
      <circle cx="68" cy="20" r="2.4" fill="#c8a97e" />
    </svg>
  );
}
