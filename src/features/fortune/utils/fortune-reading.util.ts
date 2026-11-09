import {
  FORTUNE_LUCKY_NUMBER_MAX,
  FORTUNE_LUCKY_NUMBER_MIN,
  FORTUNE_LUCKY_TABLE,
} from '@/features/fortune/constants/fortune-lucky.constant';
import {
  FORTUNE_SCORE_MAX,
  FORTUNE_SCORE_MIN,
} from '@/features/fortune/constants/fortune-score.constant';
import type {
  FortuneCategoryKeyType,
  FortuneCategoryPoolType,
  FortuneCommonPoolType,
  FortuneLuckyType,
  FortuneReadingType,
  FortuneScoredTextType,
} from '@/features/fortune/types/fortune.type';
import {
  createFortuneRng,
  getFortuneBand,
  hashFortuneSeed,
  pickFortuneVariant,
  toFortuneScore,
} from '@/features/fortune/utils/fortune-seed.util';

/** 난수 사용 순서(design.md 4.7 확정). 바꾸면 모든 결과가 바뀐다 */
const CATEGORY_ORDER: readonly FortuneCategoryKeyType[] = [
  'total',
  'money',
  'love',
  'work',
  'health',
];

/** 사주 기본 점수 변동 폭(±15, SQ-2 안 A). baseScores 경로에서만 쓴다 */
const BASE_SCORE_SPREAD = 30;

export type BuildFortuneReadingInputType = Readonly<{
  seedText: string;
  dateKey: string;
  pool: FortuneCategoryPoolType;
  common: FortuneCommonPoolType;
  /** 사주만: 십신 기본 점수. 없으면 4.6 점수식 */
  baseScores?: Readonly<Record<FortuneCategoryKeyType, number>>;
}>;

function clampScore(score: number): number {
  return Math.min(FORTUNE_SCORE_MAX, Math.max(FORTUNE_SCORE_MIN, score));
}

function pickLucky(rng: () => number): FortuneLuckyType {
  const index = Math.min(
    FORTUNE_LUCKY_TABLE.length - 1,
    Math.floor(rng() * FORTUNE_LUCKY_TABLE.length)
  );
  const entry = FORTUNE_LUCKY_TABLE[index];
  const hasTwoNumbers = rng() >= 0.5;
  const numbers = hasTwoNumbers
    ? [...entry.numbers]
    : [
        entry.numbers[
          Math.min(entry.numbers.length - 1, Math.floor(rng() * 2))
        ],
      ];
  return {
    element: entry.element,
    color: entry.color,
    direction: entry.direction,
    numbers: numbers.filter(
      (n) => n >= FORTUNE_LUCKY_NUMBER_MIN && n <= FORTUNE_LUCKY_NUMBER_MAX
    ),
  };
}

/**
 * 시드 문자열 하나로 하루치 결과를 만든다. 같은 입력은 항상 같은 결과다.
 * 오늘 날짜의 절기를 쓰지 않으므로 2029년 이후에도 그대로 동작한다(design.md 4.10).
 */
export function buildFortuneReading(
  input: BuildFortuneReadingInputType
): FortuneReadingType {
  const rng = createFortuneRng(hashFortuneSeed(input.seedText));

  // 1. 점수
  const scores = {} as Record<FortuneCategoryKeyType, number>;
  for (const key of CATEGORY_ORDER) {
    if (input.baseScores) {
      scores[key] = clampScore(
        input.baseScores[key] + Math.round((rng() - 0.5) * BASE_SCORE_SPREAD)
      );
    } else {
      const r1 = rng();
      const r2 = rng();
      scores[key] = toFortuneScore(r1, r2);
    }
  }

  // 2. 문구 변형
  const scored = {} as Record<FortuneCategoryKeyType, FortuneScoredTextType>;
  for (const key of CATEGORY_ORDER) {
    const score = scores[key];
    const band = getFortuneBand(score);
    const variant = pickFortuneVariant(rng());
    scored[key] = { score, band, text: input.pool[key][band][variant] };
  }

  // 3. 공통 문구(구간은 총운 기준)
  const totalBand = scored.total.band;
  const summary = input.common.summary[totalBand][pickFortuneVariant(rng())];
  const advice = input.common.advice[totalBand][pickFortuneVariant(rng())];
  const caution = input.common.caution[totalBand][pickFortuneVariant(rng())];

  // 4. 행운
  const lucky = pickLucky(rng);

  return {
    dateKey: input.dateKey,
    total: scored.total,
    summary,
    money: scored.money,
    love: scored.love,
    work: scored.work,
    health: scored.health,
    lucky,
    advice,
    caution,
  };
}
