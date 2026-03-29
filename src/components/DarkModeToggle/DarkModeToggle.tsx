import { useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

const THEME_ICON: Record<ThemeMode, string> = {
  light: '☀️',
  dark: '🌙',
  system: '🖥️',
};

const THEME_LABEL: Record<ThemeMode, string> = {
  light: 'Light mode',
  dark: 'Dark mode',
  system: 'System mode',
};

const THEME_ORDER: ThemeMode[] = ['light', 'dark', 'system'];

function isValidThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

/**
 * Dark mode toggle button component.
 * Cycles through light, dark, and system themes.
 */
export function DarkModeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const stored: unknown = localStorage.theme;
    if (isValidThemeMode(stored)) {
      return stored;
    }
    return document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light';
  });

  const handleToggle = () => {
    const currentIndex = THEME_ORDER.indexOf(theme);
    const nextTheme = THEME_ORDER[(currentIndex + 1) % THEME_ORDER.length];

    setTheme(nextTheme);

    if (nextTheme === 'system') {
      delete localStorage.theme;
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      localStorage.theme = nextTheme;
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const getNextTheme = () => {
    const currentIndex = THEME_ORDER.indexOf(theme);
    return THEME_ORDER[(currentIndex + 1) % THEME_ORDER.length];
  };

  const nextTheme = getNextTheme();

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={theme === 'dark'}
      aria-label={`Switch to ${THEME_LABEL[nextTheme]}`}
      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
      title={`Current: ${THEME_LABEL[theme]}`}
    >
      {THEME_ICON[theme]}
    </button>
  );
}
