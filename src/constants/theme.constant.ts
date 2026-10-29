import {
  Circle,
  type LucideIcon,
  MapPin,
  Moon,
  Star,
  Utensils,
} from 'lucide-react';
import type { MenuSectionKeyType } from '@/types/menu.type';
import type { ThemeColorsType, ThemeVariantType } from '@/types/theme.type';

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

export const SECTION_ICONS: Record<MenuSectionKeyType, LucideIcon> = {
  lotto: Circle,
  tarot: Moon,
  fortune: Star,
  lunch: Utensils,
  where: MapPin,
};

export const SECTION_ICON_COLOR: Record<MenuSectionKeyType, string> = {
  lotto: 'text-primary',
  tarot: 'text-violet-600',
  fortune: 'text-amber-600',
  lunch: 'text-orange-600',
  where: 'text-sky-600',
} as const;

export const SECTION_BADGE_COLOR: Record<MenuSectionKeyType, string> = {
  lotto: 'bg-primary/10 text-primary border-primary/20',
  tarot: 'bg-violet-600/10 text-violet-600 border-violet-600/20',
  fortune: 'bg-amber-600/10 text-amber-600 border-amber-600/20',
  lunch: 'bg-orange-600/10 text-orange-600 border-orange-600/20',
  where: 'bg-sky-600/10 text-sky-600 border-sky-600/20',
} as const;

export const BACKGROUND_COLORS: Record<MenuSectionKeyType, string> = {
  lotto: 'bg-background',
  tarot: 'bg-background',
  fortune: 'bg-background',
  lunch: 'bg-background',
  where: 'bg-background',
};
