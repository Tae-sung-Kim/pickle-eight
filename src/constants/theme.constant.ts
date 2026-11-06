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

// 색 값은 globals.css의 --menu-* 토큰에서 온다
export const SECTION_ICON_COLOR: Record<MenuSectionKeyType, string> = {
  lotto: 'text-menu-lotto',
  tarot: 'text-menu-tarot',
  fortune: 'text-menu-fortune',
  lunch: 'text-menu-lunch',
  where: 'text-menu-where',
} as const;

export const SECTION_BADGE_COLOR: Record<MenuSectionKeyType, string> = {
  lotto: 'bg-menu-lotto/10 text-menu-lotto border-menu-lotto/20',
  tarot: 'bg-menu-tarot/10 text-menu-tarot border-menu-tarot/20',
  fortune: 'bg-menu-fortune/10 text-foreground border-menu-fortune/40',
  lunch: 'bg-menu-lunch/10 text-menu-lunch border-menu-lunch/20',
  where: 'bg-menu-where/10 text-menu-where border-menu-where/20',
} as const;

export const BACKGROUND_COLORS: Record<MenuSectionKeyType, string> = {
  lotto: 'bg-background',
  tarot: 'bg-background',
  fortune: 'bg-background',
  lunch: 'bg-background',
  where: 'bg-background',
};
