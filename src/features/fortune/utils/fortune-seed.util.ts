import {
  FORTUNE_SCORE_HIGH_MIN,
  FORTUNE_SCORE_MAX,
  FORTUNE_SCORE_MID_MIN,
  FORTUNE_SCORE_MIN,
} from '@/features/fortune/constants/fortune-score.constant';
import type { FortuneBandType } from '@/features/fortune/types/fortune.type';

const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;
const UINT32_RANGE = 4294967296;

/** FNV-1a 32비트. 문자열의 UTF-16 코드 단위로 계산(브라우저 간 동일) */
export function hashFortuneSeed(text: string): number {
  let hash = FNV_OFFSET_BASIS;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }
  return hash >>> 0;
}

/** mulberry32. 0 이상 1 미만 실수를 내는 결정적 난수 */
export function createFortuneRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / UINT32_RANGE;
  };
}

/** 30~95 정수. 30 + round(((r1 + r2) / 2) * 65). 두 균등난수 평균이라 가운데가 많고 극단이 적다 */
export function toFortuneScore(r1: number, r2: number): number {
  const span = FORTUNE_SCORE_MAX - FORTUNE_SCORE_MIN;
  return FORTUNE_SCORE_MIN + Math.round(((r1 + r2) / 2) * span);
}

/** 75~95 high, 55~74 mid, 30~54 low */
export function getFortuneBand(score: number): FortuneBandType {
  if (score >= FORTUNE_SCORE_HIGH_MIN) {
    return 'high';
  }
  if (score >= FORTUNE_SCORE_MID_MIN) {
    return 'mid';
  }
  return 'low';
}

/** 0, 1, 2 */
export function pickFortuneVariant(r: number): 0 | 1 | 2 {
  const index = Math.floor(r * 3);
  if (index <= 0) {
    return 0;
  }
  return index >= 2 ? 2 : 1;
}
