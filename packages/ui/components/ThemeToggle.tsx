import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { useTheme } from './ThemeProvider';
import { useTypedTranslation } from '../hooks/useTypedTranslation';

interface ThemeToggleProps {
    className?: string;
    fullWidth?: boolean;
    onToggle?: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, fullWidth, onToggle }) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTypedTranslation();
  const isDark = theme === 'dark';
  const Icon = isDark ? Sun : Moon;

  const handleClick = () => {
    toggleTheme();
    onToggle?.();
  };

  const label = isDark ? t('appearance.switchToLight') : t('appearance.switchToDark');

  if (fullWidth) {
    return (
      <Button
        variant="outline"
        className={cn('w-full justify-between', className)}
        onClick={handleClick}
        type="button"
      >
        <span className="flex items-center gap-2">
          <Icon className="size-4"/>
          {label}
        </span>
        <span className="text-xs text-muted-foreground">
          {t('appearance.toggle')}
        </span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn('rounded-full', className)}
      onClick={handleClick}
      aria-label={t('appearance.toggle')}
      type="button"
    >
      <Icon className="size-4"/>
      <span className="sr-only">{label}</span>
    </Button>
  );
};
