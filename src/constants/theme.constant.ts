import { MenuSectionKeyType } from "@/types/menu.type";
import { ThemeColorsType, ThemeVariantType } from "@/types/theme.type";

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

export const SECTION_ICON_COLOR: Record<MenuSectionKeyType, string> = {
  lotto: 'text-emerald-600',
  'random-picker': 'text-sky-600',
  quiz: 'text-indigo-600',
} as const;

export const SECTION_BADGE_COLOR: Record<MenuSectionKeyType, string> = {
  lotto: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'random-picker': 'bg-sky-50 text-sky-700 border-sky-200',
  quiz: 'bg-indigo-50 text-indigo-700 border-indigo-200',
} as const;

export const BACKGROUND_COLORS: Record<MenuSectionKeyType, string> = {
  lotto: 'bg-emerald-50 dark:bg-emerald-950',
  'random-picker': 'bg-cyan-50 dark:bg-cyan-950',
  quiz: 'bg-sky-50 dark:bg-slate-950',
};
