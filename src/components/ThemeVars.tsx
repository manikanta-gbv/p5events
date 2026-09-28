import { getTheme } from '@/lib/content';

/**
 * Emits the palette from content/theme.json as CSS custom properties so
 * client components and inline styles can reach the same tokens Tailwind
 * was built from. No colour is written twice.
 */
export function ThemeVars() {
  const theme = getTheme();
  const vars = Object.entries(theme.colors)
    .map(([name, value]) => `--${name}:${value}`)
    .join(';');

  return <style>{`:root{${vars}}`}</style>;
}
