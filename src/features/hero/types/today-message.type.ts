import { ReactNode } from 'react';

export type MealType = '아침' | '점심' | '저녁' | '간식';
export type TodayMessageType = 'fortune' | 'cheer' | 'todo' | 'menu';

export type TodayMessageCardType = {
  title: string;
  icon: ReactNode;
  titleColorClass: string;
  iconBorderClass: string;
  surfaceClass?: string;
  message: string;
  fileName: string;
  shareTitle: string;
  ariaLabel: string;
};
