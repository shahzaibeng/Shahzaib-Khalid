import { MotionConfig } from 'framer-motion';
import type { PropsWithChildren } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './ThemeProvider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      {/* Framer Motion follows the device reduced-motion setting. */}
      <MotionConfig reducedMotion="user">
        <BrowserRouter>{children}</BrowserRouter>
      </MotionConfig>
    </ThemeProvider>
  );
}
