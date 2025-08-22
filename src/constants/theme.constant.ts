import { ThemeColorsType, ThemeVariantType } from '@/types';

export const THEME: Readonly<Record<ThemeVariantType, ThemeColorsType>> = {
  light: {
    primary: '#16a34a',
    primaryAlt: '#22c55e',
    success: '#16a34a',
    warning: '#f59e0b',
    info: '#0284c7',
    destructive: '#dc2626',
  },
  dark: {
    primary: '#4ade80',
    primaryAlt: '#22c55e',
    success: '#4ade80',
    warning: '#fbbf24',
    info: '#38bdf8',
    destructive: '#dc2626',
  },
};
