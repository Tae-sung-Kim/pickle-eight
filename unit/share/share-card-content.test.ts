import { describe, expect, expectTypeOf, it } from 'vitest';
import { SHARE_CARD_LIST_LIMITS } from '@/constants/share.constant';
import { FORTUNE_COMPATIBILITY_GRADE_NAMES } from '@/features/fortune/constants/fortune-compatibility-grade.constant';
import type { FortuneCompatibilityShareInputType } from '@/features/fortune/types/fortune-compatibility.type';
import { buildFortuneCompatibilityShareCard } from '@/features/fortune/utils/fortune-compatibility-share.util';
import { luckyDrawLotsNumberTemplate } from '@/features/lucky-draw/constants/lucky-draw-share.constant';
import {
  buildLadderShareCard,
  buildLotsShareCard,
  buildRouletteShareCard,
} from '@/features/lucky-draw/utils/lucky-draw-share.util';
import {
  buildMealShareCard,
  type MealShareInputType,
} from '@/features/meal/utils/meal-share.util';

function flattenStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(flattenStrings);
  if (value && typeof value === 'object')
    return Object.values(value).flatMap(flattenStrings);
  return [];
}

const names = (n: number, prefix = '이름') =>
  Array.from(
    { length: n },
    (_, i) => `${prefix}${String.fromCharCode(0xac00 + i)}`
  );

describe('AC-7: 입력 타입에 개인정보 키가 없다', () => {
  it('뭐 먹지 입력은 mealLabel, menuName만', () => {
    expectTypeOf<keyof MealShareInputType>().toEqualTypeOf<
      'mealLabel' | 'menuName'
    >();
  });
  it('궁합 입력에 생년월일, 날짜, 시각 키가 없다', () => {
    expectTypeOf<keyof FortuneCompatibilityShareInputType>().toEqualTypeOf<
      'kind' | 'firstName' | 'secondName' | 'gradeKey' | 'summary'
    >();
  });
  it('운빨 뽑기 builder 입력에 질문, 동네 키가 없다', () => {
    type Ladder = Parameters<typeof buildLadderShareCard>[0];
    type Roulette = Parameters<typeof buildRouletteShareCard>[0];
    type Lots = Parameters<typeof buildLotsShareCard>[0];
    expectTypeOf<keyof Ladder>().toEqualTypeOf<'rows' | 'isMasked'>();
    expectTypeOf<keyof Roulette>().toEqualTypeOf<
      'pickedLabel' | 'candidates' | 'isMasked' | 'shouldIncludeCandidates'
    >();
    expectTypeOf<keyof Lots>().toEqualTypeOf<'openedCards'>();
  });
});

describe('AC-7: 뭐 먹지 카드', () => {
  it('결과 없으면 null, 있으면 입력 값과 고정 문구만', () => {
    expect(buildMealShareCard(null)).toBeNull();
    const card = buildMealShareCard({
      mealLabel: '점심',
      menuName: '김치찌개',
    });
    expect(card?.body).toEqual({ mealLabel: '점심', menuName: '김치찌개' });
    expect(flattenStrings(card).some((s) => /\d/.test(s))).toBe(false);
  });
});

describe('AC-7: 궁합 카드', () => {
  const gradeKey = Object.keys(
    FORTUNE_COMPATIBILITY_GRADE_NAMES
  )[0] as FortuneCompatibilityShareInputType['gradeKey'];
  it.each(['tti', 'starSign'] as const)('%s 출력에 숫자가 없다', (kind) => {
    expect(buildFortuneCompatibilityShareCard(null)).toBeNull();
    const card = buildFortuneCompatibilityShareCard({
      kind,
      firstName: '쥐띠',
      secondName: '소띠',
      gradeKey,
      summary: '서로 편안하게 맞는 편입니다.',
    });
    expect(card?.body.gradeName).toBe(
      FORTUNE_COMPATIBILITY_GRADE_NAMES[gradeKey]
    );
    expect(Object.keys(card?.body ?? {}).sort()).toEqual([
      'firstName',
      'gradeName',
      'secondName',
      'summary',
    ]);
    expect(flattenStrings(card).filter((s) => /\d/.test(s))).toEqual([
      // pathname 외 숫자 없음
    ]);
  });
});

describe('사다리 카드', () => {
  it('빈 입력은 null, 가림이면 참가자만 가리고 결과는 그대로', () => {
    expect(buildLadderShareCard({ rows: [], isMasked: true })).toBeNull();
    const rows = [{ name: '김철수', result: '커피' }];
    expect(
      buildLadderShareCard({ rows, isMasked: true })?.body.rows[0]
    ).toEqual({ left: '김**', right: '커피' });
    expect(
      buildLadderShareCard({ rows, isMasked: false })?.body.rows[0]
    ).toEqual({ left: '김철수', right: '커피' });
  });
  it('한도 초과는 줄이고 hiddenCount를 남긴다', () => {
    const limit = SHARE_CARD_LIST_LIMITS.ladderRows;
    const make = (n: number) =>
      names(n).map((name) => ({ name, result: '결과' }));
    const at = buildLadderShareCard({ rows: make(limit), isMasked: false });
    expect(at?.body.rows).toHaveLength(limit);
    expect(at?.body.hiddenCount).toBe(0);
    const over = buildLadderShareCard({
      rows: make(limit + 1),
      isMasked: false,
    });
    expect(over?.body.rows).toHaveLength(limit);
    expect(over?.body.hiddenCount).toBe(1);
  });
});

describe('돌림판 카드', () => {
  const base = {
    candidates: ['가나다', '라마바', '사아자'],
    isMasked: false,
    shouldIncludeCandidates: true,
  };
  it('공개 전(pickedLabel null)은 null', () => {
    expect(buildRouletteShareCard({ ...base, pickedLabel: null })).toBeNull();
  });
  it('가림과 후보 옵션 반영', () => {
    const masked = buildRouletteShareCard({
      ...base,
      pickedLabel: '가나다',
      isMasked: true,
    });
    expect(masked?.body.picked).toBe('가**');
    expect(masked?.body.candidates).toEqual(['가**', '라**', '사**']);
    const noCand = buildRouletteShareCard({
      ...base,
      pickedLabel: '가나다',
      shouldIncludeCandidates: false,
    });
    expect(noCand?.body.candidates).toBeNull();
    expect(noCand?.body.hiddenCount).toBe(0);
    expect(flattenStrings(noCand).join('|')).not.toContain('라마바');
  });
  it('후보 한도 초과는 줄이고 hiddenCount', () => {
    const limit = SHARE_CARD_LIST_LIMITS.rouletteCandidates;
    const card = buildRouletteShareCard({
      ...base,
      pickedLabel: '가나다',
      candidates: names(limit + 3),
    });
    expect(card?.body.candidates).toHaveLength(limit);
    expect(card?.body.hiddenCount).toBe(3);
  });
});

describe('제비뽑기 카드', () => {
  it('빈 입력은 null, 열린 카드만 번호 템플릿으로', () => {
    expect(buildLotsShareCard({ openedCards: [] })).toBeNull();
    const card = buildLotsShareCard({
      openedCards: [
        { position: 2, label: '커피' },
        { position: 0, label: '꽝' },
      ],
    });
    expect(card?.body.rows).toEqual([
      { left: luckyDrawLotsNumberTemplate.replace('{n}', '3'), right: '커피' },
      { left: luckyDrawLotsNumberTemplate.replace('{n}', '1'), right: '꽝' },
    ]);
    expect(card?.body.hiddenCount).toBe(0);
  });
  it('항목은 가리지 않고 한도 초과는 hiddenCount', () => {
    const limit = SHARE_CARD_LIST_LIMITS.lotsRows;
    const openedCards = Array.from({ length: limit + 2 }, (_, i) => ({
      position: i,
      label: `항목${i}`,
    }));
    const card = buildLotsShareCard({ openedCards });
    expect(card?.body.rows).toHaveLength(limit);
    expect(card?.body.rows[0].right).toBe('항목0');
    expect(card?.body.hiddenCount).toBe(2);
  });
});
