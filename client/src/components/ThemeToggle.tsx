import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { theme, setPreference } = useTheme();
  const nextTheme = theme === 'light' ? 'dark' : 'light';
  return (
    <button
      type="button"
      className="icon-button"
      data-symbiote-target
      onClick={() => setPreference(nextTheme)}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
    >
      {theme === 'light' ? (
        <FiMoon aria-hidden="true" size={18} />
      ) : (
        <FiSun aria-hidden="true" size={18} />
      )}
    </button>
  );
}
