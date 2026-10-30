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
    primary: '#2d6a3e',
    primaryAlt: '#3e8a52',
    success: '#2d6a3e',
    warning: '#d9a21b',
    info: '#3b73b8',
    destructive: '#b23a48',
  },
  dark: {
    primary: '#6fbf84',
    primaryAlt: '#3e8a52',
    success: '#6fbf84',
    warning: '#e8b93a',
    info: '#6b9bd6',
    destructive: '#e0707c',
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
