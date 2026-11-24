import { describe, expect, test } from 'vitest';
import { MENU_LIST } from '@/constants/menu.constant';
import * as consentConstants from '@/features/fortune/constants/fortune-compatibility-consent.constant';
import * as copyConstants from '@/features/fortune/constants/fortune-compatibility-copy.constant';
import {
  FORTUNE_COMPATIBILITY_FORBIDDEN_TERMS,
  FORTUNE_COMPATIBILITY_META_FORBIDDEN_TERMS,
} from '@/features/fortune/constants/fortune-compatibility-copy-rule.constant';
import * as faqConstants from '@/features/fortune/constants/fortune-compatibility-faq.constant';
import * as gradeConstants from '@/features/fortune/constants/fortune-compatibility-grade.constant';
import * as guideConstants from '@/features/fortune/constants/fortune-compatibility-guide.constant';
import * as introConstants from '@/features/fortune/constants/fortune-compatibility-intro.constant';
import * as labelConstants from '@/features/fortune/constants/fortune-compatibility-label.constant';
import * as menuConstants from '@/features/fortune/constants/fortune-compatibility-menu.constant';
import * as noticeConstants from '@/features/fortune/constants/fortune-compatibility-notice.constant';
import * as sameCopyConstants from '@/features/fortune/constants/fortune-compatibility-same-copy.constant';
import * as seoConstants from '@/features/fortune/constants/fortune-compatibility-seo.constant';
import * as shareConstants from '@/features/fortune/constants/fortune-compatibility-share.constant';
import * as starSignConstants from '@/features/fortune/constants/fortune-compatibility-star-sign.constant';
import * as ttiConstants from '@/features/fortune/constants/fortune-compatibility-tti.constant';
import {
  FORTUNE_COPY_ALLOWED_SENTENCES,
  FORTUNE_FORBIDDEN_PATTERNS,
  FORTUNE_FORBIDDEN_TERMS,
} from '@/features/fortune/constants/fortune-copy-rule.constant';
import type { FortuneCompatibilityCopyBundleType } from '@/features/fortune/types/fortune-compatibility.type';
import {
  checkHabnidaStyle,
  collectTexts,
  findForbidden,
  type NamedTextType,
} from '../helpers/copy-check.util';
import { readSourceFiles } from '../helpers/source-scan.util';

const RULE = {
  forbiddenTerms: [
    ...FORTUNE_FORBIDDEN_TERMS,
    ...FORTUNE_COMPATIBILITY_FORBIDDEN_TERMS,
  ],
  forbiddenPatterns: FORTUNE_FORBIDDEN_PATTERNS,
  allowedSentences: FORTUNE_COPY_ALLOWED_SENTENCES,
};

const BUNDLE_GROUPS = {
  ttiRelation: copyConstants.FORTUNE_COMPATIBILITY_TTI_RELATION_COPY,
  starSignRelation: copyConstants.FORTUNE_COMPATIBILITY_STAR_SIGN_RELATION_COPY,
  ttiSame: sameCopyConstants.FORTUNE_COMPATIBILITY_TTI_SAME_COPY,
  starSignSame: sameCopyConstants.FORTUNE_COMPATIBILITY_STAR_SIGN_SAME_COPY,
} as const;

/** 메뉴 상수의 궁합 항목 */
const MENU_COMPATIBILITY_ITEMS = MENU_LIST.flatMap((group) =>
  group.items.filter((item) => item.href.includes('/fortune/compatibility'))
);

/** 주석은 화면 문구가 아니므로 뺀다 */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

/** 화면에 나가는 궁합 문구 전체 (규칙 상수 파일 제외) */
const ALL_TEXTS: NamedTextType[] = collectTexts([
  ['copy', BUNDLE_GROUPS],
  ['notice', noticeConstants],
  ['faq', faqConstants],
  ['guide', guideConstants],
  ['intro', introConstants],
  ['label', labelConstants],
  ['menu', menuConstants],
  ['seo', seoConstants],
  ['grade', gradeConstants],
  ['tti-names', ttiConstants],
  ['star-sign-names', starSignConstants],
  ['menu-list', MENU_COMPATIBILITY_ITEMS],
  ['share', shareConstants],
]);

/** 검색·공유에 노출되는 메타 문구 */
const META_TEXTS: NamedTextType[] = collectTexts([
  ['seo', seoConstants],
  ['menu-og-tags', menuConstants.FORTUNE_COMPATIBILITY_OG_TAGS],
  ['menu-item', MENU_COMPATIBILITY_ITEMS],
]);

function bundles(): Array<{
  where: string;
  bundle: FortuneCompatibilityCopyBundleType;
}> {
  const out: Array<{
    where: string;
    bundle: FortuneCompatibilityCopyBundleType;
  }> = [];
  for (const [group, record] of Object.entries(BUNDLE_GROUPS)) {
    for (const [key, bundle] of Object.entries(record)) {
      out.push({ where: `${group}.${key}`, bundle });
    }
  }
  return out;
}

describe('AC-8 금지 표현', () => {
  test('문구가 비어 있지 않다', () => {
    expect(ALL_TEXTS.length).toBeGreaterThan(200);
    expect(MENU_COMPATIBILITY_ITEMS).toHaveLength(1);
  });

  test('기존 금지 목록·패턴 + 궁합 추가 목록에 걸리는 문구가 없다', () => {
    const found = ALL_TEXTS.flatMap((item) => findForbidden(item, RULE));
    expect(found).toEqual([]);
  });

  test('궁합 추가 목록에 8개 단어가 모두 있다', () => {
    for (const term of [
      '결혼',
      '임신',
      '이별',
      '이혼',
      '바람',
      '운명의 상대',
      '천생연분',
      '100%',
    ]) {
      expect(FORTUNE_COMPATIBILITY_FORBIDDEN_TERMS).toContain(term);
    }
  });

  test('메타(title, description, keywords, OG, 메뉴)에 메타 전용 금지어가 없다', () => {
    const found = META_TEXTS.flatMap((item) =>
      findForbidden(item, {
        forbiddenTerms: FORTUNE_COMPATIBILITY_META_FORBIDDEN_TERMS,
        forbiddenPatterns: [],
      })
    );
    expect(found).toEqual([]);
    expect(FORTUNE_COMPATIBILITY_META_FORBIDDEN_TERMS).toEqual(
      expect.arrayContaining(['연애 궁합'])
    );
  });

  test('"사주"가 문구와 궁합 소스 어디에도 없다', () => {
    expect(ALL_TEXTS.filter((item) => item.text.includes('사주'))).toEqual([]);
    const files = readSourceFiles(['.ts', '.tsx']).filter(
      (file) => /compatibility/.test(file.path) && !/copy-rule/.test(file.path)
    );
    expect(files.length).toBeGreaterThan(20);
    expect(
      files
        .filter((file) => stripComments(file.content).includes('사주'))
        .map((f) => f.path)
    ).toEqual([]);
  });

  test('점수·퍼센트·순위·자리표시가 없다', () => {
    const found = ALL_TEXTS.filter((item) =>
      /\d+\s*(점|%|위)|[{}]/.test(item.text)
    )
      // 템플릿 상수({이름}, {사람})는 화면에서 치환되므로 제외
      .filter((item) => !/template/i.test(item.where));
    expect(found).toEqual([]);
  });
});

describe('AC-8 합니다체', () => {
  test('해요체로 끝나는 문장이 없다', () => {
    const report = checkHabnidaStyle(ALL_TEXTS);
    expect(report.hard).toEqual([]);
    expect(report.haeyoCandidates).toEqual([]);
  });
});

describe('AC-8 묶음 구조', () => {
  test('묶음 34개: 띠 6+12, 별자리 4+12', () => {
    const counts = Object.fromEntries(
      Object.entries(BUNDLE_GROUPS).map(([k, v]) => [k, Object.keys(v).length])
    );
    expect(counts).toEqual({
      ttiRelation: 6,
      starSignRelation: 4,
      ttiSame: 12,
      starSignSame: 12,
    });
  });

  test('묶음마다 요약 1~2문장, 잘 맞는 점 2개, 조율하면 좋은 점 2개, 모두 비어 있지 않다', () => {
    for (const { where, bundle } of bundles()) {
      expect(bundle.summary.length, where).toBeGreaterThanOrEqual(1);
      expect(bundle.summary.length, where).toBeLessThanOrEqual(2);
      expect(bundle.strengths, where).toHaveLength(2);
      expect(bundle.adjustments, where).toHaveLength(2);
      for (const text of [
        ...bundle.summary,
        ...bundle.strengths,
        ...bundle.adjustments,
      ]) {
        expect(text.trim().length, where).toBeGreaterThan(0);
      }
    }
  });

  test('모든 문장이 마침표로 끝나고 묶음끼리 문장이 겹치지 않는다', () => {
    const seen = new Map<string, string>();
    for (const { where, bundle } of bundles()) {
      for (const text of [
        ...bundle.summary,
        ...bundle.strengths,
        ...bundle.adjustments,
      ]) {
        expect(text, where).toMatch(/[.!?]$/);
        expect(seen.get(text), `${where} 중복: ${text}`).toBeUndefined();
        seen.set(text, where);
      }
    }
  });

  test('같은 띠·같은 별자리 묶음 요약은 띠·자리를 언급한다', () => {
    for (const [key, bundle] of Object.entries(BUNDLE_GROUPS.ttiSame)) {
      expect(bundle.summary.join(' '), key).toMatch(/띠/);
    }
    for (const [key, bundle] of Object.entries(BUNDLE_GROUPS.starSignSame)) {
      expect(bundle.summary.join(' '), key).toMatch(/자리/);
    }
  });
});

describe('동의 버전', () => {
  test('버전은 날짜 형식이다', () => {
    expect(consentConstants.FORTUNE_COMPATIBILITY_CONSENT_VERSION).toMatch(
      /^\d{4}-\d{2}-\d{2}$/
    );
  });
});
