import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from './ui/button';
import { useTypedTranslation } from '../hooks/useTypedTranslation';

const THEME_ORDER = ['light', 'dark', 'system'] as const;
type ThemeName = (typeof THEME_ORDER)[number];

const THEME_ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

/**
 * Cycles light → dark → system. The current choice is announced via the
 * accessible name, so screen reader users always know which theme is active.
 */
export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useTypedTranslation();

  // next-themes resolves the stored theme after mount; render a placeholder
  // until then so the icon doesn't flicker.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const current: ThemeName = THEME_ORDER.includes(theme as ThemeName) ? (theme as ThemeName) : 'system';
  const next = THEME_ORDER[(THEME_ORDER.indexOf(current) + 1) % THEME_ORDER.length];
  const Icon = THEME_ICONS[current];
  const label = t('theme.toggle', {
    current: t(`theme.${current}`),
    next: t(`theme.${next}`),
  });

  if (!mounted) {
    return <Button variant="outline" size="icon" disabled aria-hidden="true"/>;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => {
        setTheme(next);
      }}
      aria-label={label}
      title={label}
    >
      <Icon aria-hidden="true"/>
    </Button>
  );
};
