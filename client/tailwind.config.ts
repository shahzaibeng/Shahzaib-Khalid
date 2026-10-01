import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

// Hex values live in globals.css; semantic names keep components theme-independent.
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        ink: 'var(--color-text)',
        muted: 'var(--color-muted)',
        primary: 'var(--color-primary)',
        accent: 'var(--color-accent)',
        highlight: 'var(--color-highlight)',
        border: 'var(--color-border)',
      },
      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces Variable', 'Fraunces', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [
    // `symbiote:` styles an element while the cursor has latched onto it,
    // e.g. <a data-symbiote-target className="symbiote:text-white">.
    plugin(({ addVariant }) => addVariant('symbiote', '&[data-symbiote-active="true"]')),
  ],
} satisfies Config;
