import React from 'react';
import { useThemeContext } from '../store/themeContext';

const SunIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
    <path
      fill="currentColor"
      d="M12 18a6 6 0 1 1 0-12a6 6 0 0 1 0 12Zm0-15a1 1 0 0 1 1 1v1.2a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1Zm0 16.8a1 1 0 0 1 1 1V22a1 1 0 1 1-2 0v-1.2a1 1 0 0 1 1-1ZM4 11a1 1 0 1 1 0 2H2.8a1 1 0 1 1 0-2H4Zm17.2 0a1 1 0 1 1 0 2H20a1 1 0 1 1 0-2h1.2ZM6.4 5a1 1 0 0 1 1.4 0l.85.85a1 1 0 0 1-1.42 1.42L6.4 6.4A1 1 0 0 1 6.4 5Zm10.23 10.23a1 1 0 0 1 1.41 0l.85.85a1 1 0 1 1-1.42 1.42l-.84-.85a1 1 0 0 1 0-1.42ZM18.9 5a1 1 0 0 1 0 1.4l-.85.85a1 1 0 0 1-1.42-1.42l.85-.85a1 1 0 0 1 1.42 0ZM8.66 15.23a1 1 0 0 1 0 1.41l-.84.85a1 1 0 0 1-1.42-1.42l.85-.84a1 1 0 0 1 1.41 0Z"
    />
  </svg>
);

const MoonIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
    <path
      fill="currentColor"
      d="M20.78 14.76A9 9 0 0 1 9.23 3.22a1 1 0 0 0-1.2-1.52A11 11 0 1 0 22.3 15.97a1 1 0 0 0-1.52-1.2Z"
    />
  </svg>
);

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeContext();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="group rounded-full border border-neutral-200 bg-white/90 p-2.5 text-neutral-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-orange-300 hover:text-orange-600 dark:border-neutral-700 dark:bg-neutral-900/90 dark:text-neutral-100 dark:hover:border-amber-500 dark:hover:text-amber-300"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light theme' : 'Dark theme'}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
};

export default ThemeToggle;
