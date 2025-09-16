import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const THEME_OPTIONS = [
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
] as const;

type ThemeValue = (typeof THEME_OPTIONS)[number]['value'];

interface ThemeSwitcherProps {
    className?: string;
    fullWidth?: boolean;
}

export function ThemeSwitcher({ className, fullWidth }: ThemeSwitcherProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedValue = (mounted ? theme : undefined) ?? 'system';

  const ActiveIcon = useMemo(() => {
    if (!mounted) return Monitor;
    if (resolvedTheme === 'dark') return Moon;
    return Sun;
  }, [mounted, resolvedTheme]);

  return (
    <Select value={selectedValue} onValueChange={(value: ThemeValue) => setTheme(value)}>
      <SelectTrigger
        size="sm"
        className={cn(
          'justify-between gap-2',
          fullWidth ? 'w-full' : 'w-36',
          className,
        )}
        aria-label="Select theme"
      >
        <div className="flex items-center gap-2">
          <ActiveIcon className="size-4" aria-hidden="true" />
          <SelectValue placeholder="Theme" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {THEME_OPTIONS.map(({ value, label, Icon }) => (
          <SelectItem key={value} value={value}>
            <span className="flex items-center gap-2">
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

