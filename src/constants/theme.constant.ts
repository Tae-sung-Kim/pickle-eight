import {
  BookOpenText,
  Circle,
  type LucideIcon,
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
  dream: BookOpenText,
  meal: Utensils,
};

// 색 값은 globals.css의 --menu-* 토큰에서 온다
export const SECTION_ICON_COLOR: Record<MenuSectionKeyType, string> = {
  lotto: 'text-menu-lotto',
  tarot: 'text-menu-tarot',
  fortune: 'text-menu-fortune',
  dream: 'text-menu-dream',
  meal: 'text-menu-meal',
} as const;

export const SECTION_BADGE_COLOR: Record<MenuSectionKeyType, string> = {
  lotto: 'bg-menu-lotto/10 text-menu-lotto border-menu-lotto/20',
  tarot: 'bg-menu-tarot/10 text-menu-tarot border-menu-tarot/20',
  fortune: 'bg-menu-fortune/10 text-foreground border-menu-fortune/40',
  dream: 'bg-menu-dream/10 text-menu-dream border-menu-dream/20',
  meal: 'bg-menu-meal/10 text-menu-meal border-menu-meal/20',
} as const;

export const BACKGROUND_COLORS: Record<MenuSectionKeyType, string> = {
  lotto: 'bg-background',
  tarot: 'bg-background',
  fortune: 'bg-background',
  dream: 'bg-background',
  meal: 'bg-background',
};
