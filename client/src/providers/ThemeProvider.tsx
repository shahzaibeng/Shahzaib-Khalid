import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import type { PropsWithChildren } from 'react';
import {
  applyTheme,
  readSystemTheme,
  readThemePreference,
  subscribeToSystemTheme,
  THEME_STORAGE_KEY,
} from '../lib/theme';
import type { ThemePreference } from '../lib/theme';
import { ThemeContext } from './theme-context';

export function ThemeProvider({ children }: PropsWithChildren) {
  const [preference, updatePreference] = useState(readThemePreference);
  // React rechecks the snapshot when subscribing, including changes during startup.
  const systemTheme = useSyncExternalStore(subscribeToSystemTheme, readSystemTheme);
  const theme = preference === 'system' ? systemTheme : preference;

  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY || event.key === null) {
        updatePreference(readThemePreference());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    updatePreference(next);
    try {
      if (next === 'system') localStorage.removeItem(THEME_STORAGE_KEY);
      else localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // The choice still works for this visit when storage is unavailable.
    }
  }, []);

  const value = useMemo(
    () => ({ theme, preference, setPreference }),
    [theme, preference, setPreference],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
