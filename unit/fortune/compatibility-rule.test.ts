import { describe, expect, test } from 'vitest';
import { FORTUNE_COMPATIBILITY_CONSENT_STORAGE_KEY_SUFFIX } from '@/features/fortune/constants/fortune-compatibility-consent.constant';
import {
  FORTUNE_COMPATIBILITY_STAR_SIGN_RELATION_COPY,
  FORTUNE_COMPATIBILITY_TTI_RELATION_COPY,
} from '@/features/fortune/constants/fortune-compatibility-copy.constant';
import {
  FORTUNE_COMPATIBILITY_STAR_SIGN_SAME_COPY,
  FORTUNE_COMPATIBILITY_TTI_SAME_COPY,
} from '@/features/fortune/constants/fortune-compatibility-same-copy.constant';
import { FORTUNE_COMPATIBILITY_STAR_SIGN_ELEMENTS } from '@/features/fortune/constants/fortune-compatibility-star-sign.constant';
import { FORTUNE_STAR_SIGNS } from '@/features/fortune/constants/fortune-star-sign.constant';
import { FORTUNE_ZODIAC } from '@/features/fortune/constants/fortune-zodiac.constant';
import {
  createFortuneCompatibilityFlowReducer,
  FORTUNE_COMPATIBILITY_FLOW_INITIAL_STATE,
} from '@/features/fortune/hooks/use-compatibility-flow.hook';
import type {
  FortuneStarSignKeyType,
  FortuneTtiKeyType,
  FortuneYmdType,
} from '@/features/fortune/types/fortune.type';
import type { FortuneCompatibilityGradeKeyType } from '@/features/fortune/types/fortune-compatibility.type';
import { resolveFortuneBirth } from '@/features/fortune/utils/fortune-birth.util';
import {
  createFortuneCompatibilityStarSignPairKey,
  createFortuneCompatibilityTtiPairKey,
  listFortuneCompatibilityStarSignPairKeys,
  listFortuneCompatibilityTtiPairKeys,
  resolveFortuneCompatibilityStarSign,
  resolveFortuneCompatibilityStarSignCopy,
  resolveFortuneCompatibilityTti,
  resolveFortuneCompatibilityTtiCopy,
} from '@/features/fortune/utils/fortune-compatibility.util';
import {
  fromJulianDayNumber,
  toJulianDayNumber,
} from '@/features/fortune/utils/fortune-date.util';
import { getSolarTermTime } from '@/features/fortune/utils/fortune-solar-term.util';
import {
  determineFortuneStarSign,
  resolveFortuneStarSignWithTime,
} from '@/features/fortune/utils/fortune-star-sign.util';
import {
  determineFortuneTti,
  getTtiKeyByYear,
  resolveFortuneTtiWithTime,
} from '@/features/fortune/utils/fortune-tti.util';

/** 만 14세 이상이 되는 기기 시계(2028년생까지) */
const LATE_TODAY: FortuneYmdType = { year: 2060, month: 6, day: 1 };
const LICHUN_INDEX = 2;

const TTI_KEYS = FORTUNE_ZODIAC.map((z) => z.key);
const STAR_KEYS = FORTUNE_STAR_SIGNS.map((s) => s.key);

function countBy<T extends string>(
  items: readonly T[]
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) out[item] = (out[item] ?? 0) + 1;
  return out;
}

function shift(ymd: FortuneYmdType, days: number): FortuneYmdType {
  return fromJulianDayNumber(toJulianDayNumber(ymd) + days);
}

describe('AC-5 띠 궁합 규칙', () => {
  const keys = listFortuneCompatibilityTtiPairKeys();

  test('78조합, 중복 없음, 입력 순서를 바꿔도 같은 키', () => {
    expect(keys).toHaveLength(78);
    expect(new Set(keys).size).toBe(78);
    for (const a of TTI_KEYS) {
      for (const b of TTI_KEYS) {
        const key = createFortuneCompatibilityTtiPairKey(a, b);
        expect(key).toBe(createFortuneCompatibilityTtiPairKey(b, a));
        expect(keys).toContain(key);
      }
    }
  });

  test('관계 개수: 같은 띠 12, 육합 6, 삼합 12, 방합 10, 충 6, 원진 6, 그 밖 26', () => {
    const relations = keys.map((key) => {
      const [a, b] = key.split('-') as [FortuneTtiKeyType, FortuneTtiKeyType];
      return resolveFortuneCompatibilityTti(a, b).relation;
    });
    expect(countBy(relations)).toEqual({
      same: 12,
      yukhap: 6,
      samhap: 12,
      banghap: 10,
      chung: 6,
      wonjin: 6,
      other: 26,
    });
  });

  test('쥐-소, 말-양은 육합(방합과 겹치면 육합이 이긴다)', () => {
    expect(resolveFortuneCompatibilityTti('rat', 'ox').relation).toBe('yukhap');
    expect(resolveFortuneCompatibilityTti('goat', 'horse').relation).toBe(
      'yukhap'
    );
  });

  test('등급 개수: 잘 맞는 편 28, 무난한 편 38, 조율이 필요한 편 12', () => {
    const grades: FortuneCompatibilityGradeKeyType[] = keys.map((key) => {
      const [a, b] = key.split('-') as [FortuneTtiKeyType, FortuneTtiKeyType];
      return resolveFortuneCompatibilityTti(a, b).grade;
    });
    expect(countBy(grades)).toEqual({ good: 28, neutral: 38, adjust: 12 });
  });

  test('78조합 모두 문구 묶음이 연결되고, 같은 띠는 전용 묶음이다', () => {
    for (const key of keys) {
      const [a, b] = key.split('-') as [FortuneTtiKeyType, FortuneTtiKeyType];
      const copy = resolveFortuneCompatibilityTtiCopy(
        a,
        b,
        FORTUNE_COMPATIBILITY_TTI_RELATION_COPY,
        FORTUNE_COMPATIBILITY_TTI_SAME_COPY
      );
      expect(copy, key).toBeDefined();
      if (a === b) {
        expect(copy).toBe(FORTUNE_COMPATIBILITY_TTI_SAME_COPY[a]);
      }
    }
  });
});

describe('AC-6 별자리 궁합 규칙', () => {
  const keys = listFortuneCompatibilityStarSignPairKeys();

  test('원소 분류: 불·흙·공기·물 각 3개', () => {
    expect(
      countBy(Object.values(FORTUNE_COMPATIBILITY_STAR_SIGN_ELEMENTS))
    ).toEqual({
      fire: 3,
      earth: 3,
      air: 3,
      water: 3,
    });
    expect(
      Object.keys(FORTUNE_COMPATIBILITY_STAR_SIGN_ELEMENTS).sort()
    ).toEqual([...STAR_KEYS].sort());
  });

  test('78조합, 입력 순서 무관', () => {
    expect(keys).toHaveLength(78);
    expect(new Set(keys).size).toBe(78);
    for (const a of STAR_KEYS) {
      for (const b of STAR_KEYS) {
        expect(createFortuneCompatibilityStarSignPairKey(a, b)).toBe(
          createFortuneCompatibilityStarSignPairKey(b, a)
        );
      }
    }
  });

  test('관계 개수: 같은 별자리 12, 같은 원소 12, 보완 18, 대립 18, 그 밖 18', () => {
    const results = keys.map((key) => {
      const [a, b] = key.split('-') as [
        FortuneStarSignKeyType,
        FortuneStarSignKeyType,
      ];
      return resolveFortuneCompatibilityStarSign(a, b);
    });
    expect(countBy(results.map((r) => r.relation))).toEqual({
      same: 12,
      sameElement: 12,
      complement: 18,
      opposite: 18,
      other: 18,
    });
    expect(countBy(results.map((r) => r.grade))).toEqual({
      good: 42,
      neutral: 18,
      adjust: 18,
    });
  });

  test('78조합 모두 문구 묶음이 연결되고, 같은 별자리는 전용 묶음이다', () => {
    for (const key of keys) {
      const [a, b] = key.split('-') as [
        FortuneStarSignKeyType,
        FortuneStarSignKeyType,
      ];
      const copy = resolveFortuneCompatibilityStarSignCopy(
        a,
        b,
        FORTUNE_COMPATIBILITY_STAR_SIGN_RELATION_COPY,
        FORTUNE_COMPATIBILITY_STAR_SIGN_SAME_COPY
      );
      expect(copy, key).toBeDefined();
      if (a === b) {
        expect(copy).toBe(FORTUNE_COMPATIBILITY_STAR_SIGN_SAME_COPY[a]);
      }
    }
  });
});

describe('문구 묶음 수와 동의 키', () => {
  test('작성 묶음: 띠 6+12, 별자리 4+12', () => {
    expect(Object.keys(FORTUNE_COMPATIBILITY_TTI_RELATION_COPY)).toHaveLength(
      6
    );
    expect(Object.keys(FORTUNE_COMPATIBILITY_TTI_SAME_COPY)).toHaveLength(12);
    expect(
      Object.keys(FORTUNE_COMPATIBILITY_STAR_SIGN_RELATION_COPY)
    ).toHaveLength(4);
    expect(Object.keys(FORTUNE_COMPATIBILITY_STAR_SIGN_SAME_COPY)).toHaveLength(
      12
    );
  });

  test('동의 저장 키 접미사', () => {
    expect(FORTUNE_COMPATIBILITY_CONSENT_STORAGE_KEY_SUFFIX).toBe(
      '_fortune_compatibility_consent_v1'
    );
  });
});

describe('AC-7 띠·별자리 판정이 기존 운세와 같다', () => {
  const reduceTti = createFortuneCompatibilityFlowReducer<FortuneTtiKeyType>({
    determine: determineFortuneTti,
    resolveWithTime: resolveFortuneTtiWithTime,
  });
  const reduceStar =
    createFortuneCompatibilityFlowReducer<FortuneStarSignKeyType>({
      determine: determineFortuneStarSign,
      resolveWithTime: resolveFortuneStarSignWithTime,
    });

  function firstKey<K extends string>(
    reduce: ReturnType<typeof createFortuneCompatibilityFlowReducer<K>>,
    solar: FortuneYmdType
  ): K | undefined {
    const next = reduce(FORTUNE_COMPATIBILITY_FLOW_INITIAL_STATE as never, {
      type: 'SUBMIT',
      input: { calendar: 'solar', ...solar, isLeapMonth: false },
      today: LATE_TODAY,
    });
    return next.step === 'second' ? next.first.key : undefined;
  }

  test('입춘 전날·다음 날은 하루 단위, 당일은 시각을 묻는다 (1920~2028 전 연도)', () => {
    for (let year = 1920; year <= 2028; year += 1) {
      const lichun = getSolarTermTime(year, LICHUN_INDEX);
      expect(lichun, String(year)).not.toBeNull();
      if (!lichun) continue;
      const day = { year, month: lichun.month, day: lichun.day };
      const prev = getTtiKeyByYear(year - 1);
      const cur = getTtiKeyByYear(year);

      expect(firstKey(reduceTti, shift(day, -1)), `${year} 전날`).toBe(prev);
      expect(firstKey(reduceTti, shift(day, 1)), `${year} 다음 날`).toBe(cur);

      const same = determineFortuneTti(day);
      expect(same.kind).toBe('need-time');
      // 당일은 첫 번째 사람이 확정되지 않는다
      expect(firstKey(reduceTti, day)).toBeUndefined();
    }
  });

  test('입춘 당일 시각 입력: 입춘 시각 직전은 전년 띠, 정각은 그해 띠', () => {
    for (const year of [1984, 2000, 2024]) {
      const lichun = getSolarTermTime(year, LICHUN_INDEX);
      if (!lichun) throw new Error('표 없음');
      const day = { year, month: lichun.month, day: lichun.day };
      const total = lichun.hour * 60 + lichun.minute;
      const before = {
        hour: Math.floor((total - 1) / 60),
        minute: (total - 1) % 60,
      };
      const at = { hour: lichun.hour, minute: lichun.minute };

      for (const [time, expected] of [
        [before, getTtiKeyByYear(year - 1)],
        [at, getTtiKeyByYear(year)],
      ] as const) {
        let state = reduceTti(
          FORTUNE_COMPATIBILITY_FLOW_INITIAL_STATE as never,
          {
            type: 'SUBMIT',
            input: { calendar: 'solar', ...day, isLeapMonth: false },
            today: LATE_TODAY,
          }
        );
        state = reduceTti(state, { type: 'SUBMIT_TIME', time });
        expect(state.step).toBe('second');
        if (state.step === 'second') {
          expect(state.first.key).toBe(expected);
          expect(state.first.key).toBe(resolveFortuneTtiWithTime(day, time));
        }
      }
    }
  });

  test('별자리 12개 경계: 전날은 이전 별자리, 다음 날은 새 별자리, 당일은 시각 질문', () => {
    const sorted = [...FORTUNE_STAR_SIGNS].sort(
      (a, b) => a.startTermIndex - b.startTermIndex
    );
    for (const year of [1984, 2000, 2024]) {
      sorted.forEach((sign, i) => {
        const prev = sorted[(i + sorted.length - 1) % sorted.length].key;
        const term = getSolarTermTime(year, sign.startTermIndex);
        if (!term) throw new Error('표 없음');
        const day = { year, month: term.month, day: term.day };
        const label = `${year} ${sign.key}`;

        expect(firstKey(reduceStar, shift(day, -1)), `${label} 전날`).toBe(
          prev
        );
        expect(firstKey(reduceStar, shift(day, 1)), `${label} 다음 날`).toBe(
          sign.key
        );
        const same = determineFortuneStarSign(day);
        expect(same.kind, `${label} 당일`).toBe('need-time');
        if (same.kind === 'need-time') {
          expect(same.before).toBe(prev);
          expect(same.after).toBe(sign.key);
        }
      });
    }
  });

  test('음력 입력은 양력 환산 날짜와 같은 띠·별자리로 판정한다', () => {
    const lunarInputs = [
      { year: 1990, month: 1, day: 1 },
      { year: 2000, month: 1, day: 1 },
      { year: 2000, month: 12, day: 15 },
      { year: 2020, month: 1, day: 15 },
      { year: 2020, month: 2, day: 1 },
    ];
    for (const lunar of lunarInputs) {
      const resolved = resolveFortuneBirth(
        { calendar: 'lunar', ...lunar, isLeapMonth: false },
        LATE_TODAY
      );
      expect(resolved.ok).toBe(true);
      if (!resolved.ok) continue;
      const viaLunar = reduceTti(
        FORTUNE_COMPATIBILITY_FLOW_INITIAL_STATE as never,
        {
          type: 'SUBMIT',
          input: { calendar: 'lunar', ...lunar, isLeapMonth: false },
          today: LATE_TODAY,
        }
      );
      expect(viaLunar.step).toBe('second');
      if (viaLunar.step === 'second') {
        expect(viaLunar.first.key).toBe(firstKey(reduceTti, resolved.solar));
      }
      const starLunar = reduceStar(
        FORTUNE_COMPATIBILITY_FLOW_INITIAL_STATE as never,
        {
          type: 'SUBMIT',
          input: { calendar: 'lunar', ...lunar, isLeapMonth: false },
          today: LATE_TODAY,
        }
      );
      expect(starLunar.step === 'second' ? starLunar.first.key : null).toBe(
        firstKey(reduceStar, resolved.solar) ?? null
      );
    }
  });
});
