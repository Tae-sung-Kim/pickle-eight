import type {
  LuckyDrawLineRuleType,
  LuckyDrawRevealModeType,
  LuckyDrawRevealToolKeyType,
} from '../types/lucky-draw.type';

export const LUCKY_DRAW_ITEM_MAX_LENGTH = 15;
export const LUCKY_DRAW_INPUT_MAX_CHARS = 1000;
export const LUCKY_DRAW_LADDER_RULE: LuckyDrawLineRuleType = {
  minCount: 2,
  maxCount: 10,
  maxLength: 15,
};
export const LUCKY_DRAW_ROULETTE_RULE: LuckyDrawLineRuleType = {
  minCount: 2,
  maxCount: 28,
  maxLength: 15,
};
export const LUCKY_DRAW_LOTS_RULE: LuckyDrawLineRuleType = {
  minCount: 2,
  maxCount: 30,
  maxLength: 15,
};
export const LUCKY_DRAW_LADDER_ROW_COUNT = 12;
export const LUCKY_DRAW_LADDER_MAX_ATTEMPTS = 64;
export const LUCKY_DRAW_ROULETTE_SPIN = { durationSec: 1.0, turns: 2 } as const;
/** 제비뽑기는 공개 방식이 없다(카드 열기로 대신) */
export const LUCKY_DRAW_REVEAL_MODES: Readonly<
  Record<LuckyDrawRevealToolKeyType, readonly LuckyDrawRevealModeType[]>
> = {
  ladder: ['all', 'hidden', 'one-by-one'],
  roulette: ['all', 'hidden'],
};
export const LUCKY_DRAW_DEFAULT_REVEAL_MODE: LuckyDrawRevealModeType = 'all';
