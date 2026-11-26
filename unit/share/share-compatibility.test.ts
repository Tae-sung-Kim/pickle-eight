import { describe, expect, it } from 'vitest';
import {
  FORTUNE_COMPATIBILITY_STAR_SIGN_RELATION_COPY,
  FORTUNE_COMPATIBILITY_TTI_RELATION_COPY,
} from '@/features/fortune/constants/fortune-compatibility-copy.constant';
import { FORTUNE_COMPATIBILITY_FORBIDDEN_TERMS } from '@/features/fortune/constants/fortune-compatibility-copy-rule.constant';
import { FORTUNE_COMPATIBILITY_GRADE_NAMES } from '@/features/fortune/constants/fortune-compatibility-grade.constant';
import {
  FORTUNE_COMPATIBILITY_STAR_SIGN_SAME_COPY,
  FORTUNE_COMPATIBILITY_TTI_SAME_COPY,
} from '@/features/fortune/constants/fortune-compatibility-same-copy.constant';
import { FORTUNE_COMPATIBILITY_SHARE_NOTICE } from '@/features/fortune/constants/fortune-compatibility-share.constant';
import {
  FORTUNE_FORBIDDEN_PATTERNS,
  FORTUNE_FORBIDDEN_TERMS,
} from '@/features/fortune/constants/fortune-copy-rule.constant';
import { SUMMARY_LONG_LENGTH as CARD_SUMMARY_LONG_LENGTH } from '@/features/fortune/shared/components/compatibility-share-card.component';
import type { FortuneCompatibilityShareInputType } from '@/features/fortune/types/fortune-compatibility.type';
import { buildFortuneCompatibilityShareCard } from '@/features/fortune/utils/fortune-compatibility-share.util';

const gradeKey = Object.keys(
  FORTUNE_COMPATIBILITY_GRADE_NAMES
)[0] as FortuneCompatibilityShareInputType['gradeKey'];

const firstSummaries = (
  ...maps: ReadonlyArray<Record<string, { summary: readonly string[] }>>
) => maps.flatMap((m) => Object.values(m).map((c) => c.summary[0]));

describe('share-compatibility AC-5: 고지와 금지어', () => {
  it('카드 고지는 상수이고 합니다체이며 금지 표현이 없다', () => {
    const card = buildFortuneCompatibilityShareCard({
      kind: 'tti',
      firstName: '쥐띠',
      secondName: '소띠',
      gradeKey,
      summary: '요약입니다.',
    });
    expect(card?.frame.notice).toBe(FORTUNE_COMPATIBILITY_SHARE_NOTICE);
    expect(FORTUNE_COMPATIBILITY_SHARE_NOTICE).toMatch(/니다\.$/);
    expect(FORTUNE_COMPATIBILITY_SHARE_NOTICE).not.toContain('보장');
    const terms = [
      ...FORTUNE_FORBIDDEN_TERMS,
      ...FORTUNE_COMPATIBILITY_FORBIDDEN_TERMS,
    ];
    for (const t of terms)
      expect(FORTUNE_COMPATIBILITY_SHARE_NOTICE).not.toContain(t);
    for (const re of FORTUNE_FORBIDDEN_PATTERNS)
      expect(FORTUNE_COMPATIBILITY_SHARE_NOTICE).not.toMatch(re);
  });
});

describe('share-compatibility 요약 길이', () => {
  it('관계·같은 띠/별자리 문구의 summary[0]는 카드 줄임 기준 이하다', () => {
    const all = firstSummaries(
      FORTUNE_COMPATIBILITY_TTI_RELATION_COPY,
      FORTUNE_COMPATIBILITY_STAR_SIGN_RELATION_COPY,
      FORTUNE_COMPATIBILITY_TTI_SAME_COPY,
      FORTUNE_COMPATIBILITY_STAR_SIGN_SAME_COPY
    );
    expect(all.length).toBeGreaterThan(0);
    for (const s of all) {
      expect(s.length, s).toBeGreaterThan(0);
      expect(Array.from(s).length, s).toBeLessThanOrEqual(
        CARD_SUMMARY_LONG_LENGTH
      );
    }
  });
});
