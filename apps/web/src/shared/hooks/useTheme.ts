import { useThemeStore } from '../stores/useThemeStore';

export function useTheme() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useThemeStore();

  return {
    theme,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
    setTheme,
    toggleTheme
  };
}
