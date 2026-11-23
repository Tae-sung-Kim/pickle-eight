import type { LuckyDrawToolKeyType } from '../types/lucky-draw.type';

export const LUCKY_DRAW_HUB_PATH = '/lucky-draw';
export const LUCKY_DRAW_TOOL_PATHS: Readonly<
  Record<LuckyDrawToolKeyType, string>
> = {
  ladder: '/lucky-draw/ladder',
  roulette: '/lucky-draw/roulette',
  lots: '/lucky-draw/lots',
};
export const LUCKY_DRAW_TOOL_LABELS: Readonly<
  Record<LuckyDrawToolKeyType, string>
> = {
  ladder: '사다리 타기',
  roulette: '돌림판',
  lots: '제비뽑기',
};
