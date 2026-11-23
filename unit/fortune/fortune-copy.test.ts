import { describe, expect, test } from 'vitest';
import * as crisisPhoneConstants from '@/constants/crisis-phone.constant';
import { MENU_LIST } from '@/constants/menu.constant';
import {
  FORTUNE_COPY_ALLOWED_SENTENCES,
  FORTUNE_FORBIDDEN_PATTERNS,
  FORTUNE_FORBIDDEN_TERMS,
  FORTUNE_HEALTH_TERMS,
  FORTUNE_INTERNAL_PILLAR_TERMS,
  FORTUNE_SAJU_ALLOWED_TEXTS_METHOD_A,
  FORTUNE_SAJU_PAGE_FORBIDDEN_TERMS,
  FORTUNE_SAJU_REDUNDANT_TERMS,
} from '@/features/fortune/constants/fortune-copy-rule.constant';
import {
  FORTUNE_HUB_FAQ,
  FORTUNE_SAJU_FAQ,
  FORTUNE_STAR_SIGN_FAQ,
  FORTUNE_TODAY_FAQ,
  FORTUNE_TTI_FAQ,
} from '@/features/fortune/constants/fortune-faq.constant';
import {
  FORTUNE_HUB_GUIDE,
  FORTUNE_SAJU_GUIDE,
  FORTUNE_STAR_SIGN_GUIDE,
  FORTUNE_TODAY_GUIDE,
  FORTUNE_TTI_GUIDE,
} from '@/features/fortune/constants/fortune-guide.constant';
import {
  FORTUNE_MAX_BIRTH,
  FORTUNE_MIN_BIRTH,
} from '@/features/fortune/constants/fortune-input.constant';
import { FORTUNE_LUCKY_TABLE } from '@/features/fortune/constants/fortune-lucky.constant';
import * as noticeConstants from '@/features/fortune/constants/fortune-notice.constant';
import { FORTUNE_ROUTES } from '@/features/fortune/constants/fortune-route.constant';
import * as sajuNoticeConstants from '@/features/fortune/constants/fortune-saju-notice.constant';
import {
  FORTUNE_BREADCRUMB_GROUP,
  FORTUNE_HUB_SEO,
  FORTUNE_SAJU_SEO,
  FORTUNE_STAR_SIGN_SEO,
  FORTUNE_TODAY_SEO,
  FORTUNE_TTI_SEO,
  type FortunePageSeoType,
} from '@/features/fortune/constants/fortune-seo.constant';
import {
  FORTUNE_STAR_SIGN_GUIDE_RANGES,
  FORTUNE_STAR_SIGNS,
} from '@/features/fortune/constants/fortune-star-sign.constant';
import { FORTUNE_ZODIAC } from '@/features/fortune/constants/fortune-zodiac.constant';
import { FORTUNE_COMMON_POOL } from '@/features/fortune/constants/pools/common.constant';
import { FORTUNE_PERSONAL_POOL } from '@/features/fortune/constants/pools/personal.constant';
import {
  FORTUNE_SAJU_BASE_SCORES,
  FORTUNE_SAJU_POOLS,
} from '@/features/fortune/constants/pools/saju-pools.constant';
import { FORTUNE_STAR_SIGN_POOLS } from '@/features/fortune/constants/pools/star-sign-pools.constant';
import { FORTUNE_TTI_POOLS } from '@/features/fortune/constants/pools/tti-pools.constant';
import {
  checkHabnidaStyle,
  collectTexts,
  excerpt,
  findForbidden,
  type NamedTextType,
  splitSentences,
  stripAllowed,
} from '../helpers/copy-check.util';
import { readSourceFiles } from '../helpers/source-scan.util';

type NamedText = NamedTextType;

const RULE = {
  forbiddenTerms: FORTUNE_FORBIDDEN_TERMS,
  forbiddenPatterns: FORTUNE_FORBIDDEN_PATTERNS,
  allowedSentences: FORTUNE_COPY_ALLOWED_SENTENCES,
};

const collect = (entries: ReadonlyArray<readonly [string, unknown]>) =>
  collectTexts(entries);
const checkStyle = checkHabnidaStyle;
const stripAllowedSentences = (text: string): string =>
  stripAllowed(text, FORTUNE_COPY_ALLOWED_SENTENCES);
const findViolations = (item: NamedText): string[] => findForbidden(item, RULE);

// ---------- 도우미 ----------

// 폐기된 방식 A 문구 ("…사주 풀이가 아닙니다")
const DISCARDED_SENTENCES: readonly string[] = [
  '사주 풀이가 아닙니다',
  '사주풀이가 아닙니다',
  '풀이가 아닙니다',
];

/** "사주"와 "네 기둥" 겹침, 내부 용어 4기둥·3기둥, 폐기 문장 */
function findRedundant(item: NamedText): string[] {
  const squeezed = item.text.replace(/\s+/g, '');
  const found: string[] = [];
  for (const term of [
    ...FORTUNE_SAJU_REDUNDANT_TERMS,
    ...FORTUNE_INTERNAL_PILLAR_TERMS,
    ...DISCARDED_SENTENCES,
  ]) {
    if (
      item.text.includes(term) ||
      squeezed.includes(term.replace(/\s+/g, ''))
    ) {
      found.push(`${item.where}: "${term}" -> ${item.text}`);
    }
  }
  return found;
}

/** 화이트리스트 문장을 지운 뒤에도 "사주"가 남으면 허용 위치 밖이다 */
function stripSajuAllowed(text: string): string {
  let result = text;
  const sentences = [...FORTUNE_SAJU_ALLOWED_TEXTS_METHOD_A].sort(
    (a, b) => b.length - a.length
  );
  for (const sentence of sentences) result = result.split(sentence).join('');
  return result;
}

function findSajuMisplaced(item: NamedText): string[] {
  // 출시 후 허브 목록·메뉴의 항목 이름 "사주"(AC-88)
  if (item.text.trim() === '사주') return [];
  const rest = stripSajuAllowed(item.text);
  const index = rest.indexOf('사주');
  return index >= 0
    ? [`${item.where}: 허용 위치 밖 "사주" -> ${excerpt(rest, index, 2)}`]
    : [];
}

function uniqueLines(lines: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    const key = line.replace(/^[^:]*: /, '');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out;
}

const FORTUNE_SOURCE_PREFIXES = [
  'src/features/fortune/',
  'src/app/fortune/',
  'src/components/common/crisis-phone.component.tsx',
  'src/constants/crisis-phone.constant.ts',
  'src/types/crisis-phone.type.ts',
];

/** 운세 소스 파일(ts, tsx). 규칙 파일(제외 목록)과 달력 표는 뺀다 */
function fortuneSourceFiles(): Array<{ path: string; content: string }> {
  return readSourceFiles(['.ts', '.tsx']).filter(
    (file) =>
      FORTUNE_SOURCE_PREFIXES.some((prefix) => file.path.startsWith(prefix)) &&
      !file.path.includes('/calendar/')
  );
}

/**
 * 소스에서 한글이 든 문자열 리터럴과 JSX 글자를 뽑는다. 주석은 건너뛴다.
 * 줄 번호는 문자열이 시작한 줄이다.
 */
function extractKoreanTexts(
  source: string
): Array<{ line: number; text: string }> {
  const out: Array<{ line: number; text: string }> = [];
  const hangul = /[가-힣]/;
  const length = source.length;
  let i = 0;
  let line = 1;
  while (i < length) {
    const ch = source[i];
    const next = source[i + 1];
    if (ch === '\n') {
      line++;
      i++;
    } else if (ch === '/' && next === '/') {
      while (i < length && source[i] !== '\n') i++;
    } else if (ch === '/' && next === '*') {
      i += 2;
      while (i < length && !(source[i] === '*' && source[i + 1] === '/')) {
        if (source[i] === '\n') line++;
        i++;
      }
      i += 2;
    } else if (ch === "'" || ch === '"' || ch === '`') {
      const startLine = line;
      let text = '';
      i++;
      while (i < length && source[i] !== ch) {
        if (source[i] === '\\') {
          text += source[i + 1] ?? '';
          i += 2;
        } else if (source[i] === '\n' && ch !== '`') {
          break;
        } else {
          if (source[i] === '\n') line++;
          text += source[i];
          i++;
        }
      }
      i++;
      if (hangul.test(text)) out.push({ line: startLine, text });
    } else if (hangul.test(ch)) {
      const startLine = line;
      let text = '';
      while (i < length && !'<>{}\n'.includes(source[i])) {
        text += source[i];
        i++;
      }
      if (text.trim()) out.push({ line: startLine, text: text.trim() });
    } else {
      i++;
    }
  }
  return out;
}

// ---------- 검사 대상 문구 ----------

type PoolSentence = NamedText & {
  poolId: string;
  category: string;
  band: string;
  variant: number;
};

type PoolEntry = {
  id: string;
  kind: 'personal' | 'common' | 'tti' | 'star';
  pool: object;
};

const POOL_ENTRIES: PoolEntry[] = [
  { id: '개인 일운', kind: 'personal', pool: FORTUNE_PERSONAL_POOL },
  { id: '공통', kind: 'common', pool: FORTUNE_COMMON_POOL },
  ...FORTUNE_ZODIAC.map(
    (z): PoolEntry => ({
      id: `띠 ${z.name}`,
      kind: 'tti',
      pool: FORTUNE_TTI_POOLS[z.key],
    })
  ),
  ...FORTUNE_STAR_SIGNS.map(
    (s): PoolEntry => ({
      id: `별자리 ${s.name}`,
      kind: 'star',
      pool: FORTUNE_STAR_SIGN_POOLS[s.key],
    })
  ),
];

function poolSentences(entry: PoolEntry): PoolSentence[] {
  const out: PoolSentence[] = [];
  for (const [category, bands] of Object.entries(entry.pool)) {
    for (const [band, variants] of Object.entries(
      bands as Record<string, readonly string[]>
    )) {
      variants.forEach((text, variant) => {
        out.push({
          where: `${entry.id} ${category}.${band}[${variant}]`,
          text,
          poolId: entry.id,
          category,
          band,
          variant,
        });
      });
    }
  }
  return out;
}

const POOL_SENTENCES: PoolSentence[] = POOL_ENTRIES.flatMap(poolSentences);

const fortuneMenuGroup = MENU_LIST.find((group) => group.group === 'fortune');

const FAQ_SETS: Array<
  [string, readonly { question: string; answer: string }[]]
> = [
  ['FAQ 허브', FORTUNE_HUB_FAQ],
  ['FAQ 오늘의 운세', FORTUNE_TODAY_FAQ],
  ['FAQ 띠별 운세', FORTUNE_TTI_FAQ],
  ['FAQ 별자리 운세', FORTUNE_STAR_SIGN_FAQ],
];

const GUIDE_SETS = [
  ['가이드 허브', FORTUNE_HUB_GUIDE],
  ['가이드 오늘의 운세', FORTUNE_TODAY_GUIDE],
  ['가이드 띠별 운세', FORTUNE_TTI_GUIDE],
  ['가이드 별자리 운세', FORTUNE_STAR_SIGN_GUIDE],
] as const;

const SEO_SETS: Array<[string, FortunePageSeoType]> = [
  ['SEO 허브', FORTUNE_HUB_SEO],
  ['SEO 오늘의 운세', FORTUNE_TODAY_SEO],
  ['SEO 띠별 운세', FORTUNE_TTI_SEO],
  ['SEO 별자리 운세', FORTUNE_STAR_SIGN_SEO],
];

/** 방식 B(2단계) 용어. 1단계 화면에는 쓰지 않지만 상수 파일에는 정의돼 있다 */
const NOTICE_SAJU_EXEMPT_NAMES = new Set([
  'FORTUNE_SAJU_GLOSS',
  'FORTUNE_METHOD_A_NOTICE',
  'FORTUNE_METHOD_A_TTI_NOTICE',
  'FORTUNE_METHOD_A_STAR_SIGN_NOTICE',
  'FORTUNE_METHOD_B_NOTICE',
]);

const NOTICE_ENTRIES = Object.entries(noticeConstants);

const NOTICE_TEXTS: NamedText[] = collect(
  NOTICE_ENTRIES.map(([name, value]): [string, unknown] => [
    `고지 ${name}`,
    value,
  ])
);
const NOTICE_TEXTS_WITHOUT_SAJU_EXEMPT: NamedText[] = collect(
  NOTICE_ENTRIES.filter(([name]) => !NOTICE_SAJU_EXEMPT_NAMES.has(name)).map(
    ([name, value]): [string, unknown] => [`고지 ${name}`, value]
  )
);
const FAQ_TEXTS: NamedText[] = collect(FAQ_SETS);
const GUIDE_TEXTS: NamedText[] = collect(
  GUIDE_SETS.map(([name, value]): [string, unknown] => [name, value])
);
const SEO_TEXTS: NamedText[] = collect([
  ...SEO_SETS,
  ['SEO 사이트 경로(Breadcrumb)', FORTUNE_BREADCRUMB_GROUP],
]);
const MENU_TEXTS: NamedText[] = collect([
  ['메뉴 운세 그룹', fortuneMenuGroup ?? {}],
]);
const SHARED_TEXTS: NamedText[] = collect([
  ['상담전화 공용 상수', { ...crisisPhoneConstants }],
  ['행운 요소 대응표', FORTUNE_LUCKY_TABLE],
  ['12띠 이름', FORTUNE_ZODIAC],
  ['12별자리 이름', FORTUNE_STAR_SIGNS],
  ['12별자리 기간', FORTUNE_STAR_SIGN_GUIDE_RANGES],
]);

/** 풀을 뺀 화면 문구 상수 전부 */
const UI_TEXTS: NamedText[] = [
  ...NOTICE_TEXTS,
  ...FAQ_TEXTS,
  ...GUIDE_TEXTS,
  ...SEO_TEXTS,
  ...MENU_TEXTS,
  ...SHARED_TEXTS,
];

const ALL_TEXTS: NamedText[] = [...POOL_SENTENCES, ...UI_TEXTS];

// ---------- 문구 풀 구조 (design.md 5장, 문구 개수) ----------

const CATEGORY_KEYS = ['total', 'money', 'love', 'work', 'health'];
const BAND_KEYS = ['high', 'mid', 'low'];

describe('문구 풀 구조: 개인 45, 공통 27, 띠 12×45, 별자리 12×45', () => {
  test('검사 대상이 모두 있다', () => {
    expect(POOL_ENTRIES).toHaveLength(2 + 12 + 12);
    expect(fortuneMenuGroup, '메뉴에 운세 그룹이 있어야 한다').toBeTruthy();
    expect(FORTUNE_COPY_ALLOWED_SENTENCES.length).toBeGreaterThan(0);
    expect(FORTUNE_SAJU_ALLOWED_TEXTS_METHOD_A.length).toBeGreaterThan(0);
    expect(UI_TEXTS.length).toBeGreaterThan(100);
  });

  test('AC-40: 풀 문장 수가 개인 45, 공통 27, 띠 12×45(540), 별자리 12×45(540)이다', () => {
    const count = (kind: PoolEntry['kind']) =>
      POOL_SENTENCES.filter(
        (s) => POOL_ENTRIES.find((e) => e.id === s.poolId)?.kind === kind
      ).length;
    expect(count('personal')).toBe(45);
    expect(count('common')).toBe(27);
    expect(count('tti')).toBe(540);
    expect(count('star')).toBe(540);
    expect(POOL_SENTENCES).toHaveLength(1152);
    expect(Object.keys(FORTUNE_TTI_POOLS).sort()).toEqual(
      FORTUNE_ZODIAC.map((z) => z.key).sort()
    );
    expect(Object.keys(FORTUNE_STAR_SIGN_POOLS).sort()).toEqual(
      FORTUNE_STAR_SIGNS.map((s) => s.key).sort()
    );
  });

  test('항목 5 × 구간 3 × 변형 3 구조이고 비어 있는 문장이 없다 (공통 풀은 요약·조언·주의)', () => {
    const problems: string[] = [];
    for (const entry of POOL_ENTRIES) {
      const expectedCategories =
        entry.kind === 'common'
          ? ['summary', 'advice', 'caution']
          : CATEGORY_KEYS;
      const categories = Object.keys(entry.pool);
      if (categories.join() !== expectedCategories.join()) {
        problems.push(`${entry.id}: 항목 ${categories.join(',')}`);
      }
      for (const [category, bands] of Object.entries(entry.pool)) {
        const bandKeys = Object.keys(bands as object);
        if (bandKeys.join() !== BAND_KEYS.join()) {
          problems.push(`${entry.id} ${category}: 구간 ${bandKeys.join(',')}`);
        }
        for (const [band, variants] of Object.entries(
          bands as Record<string, readonly string[]>
        )) {
          if (variants.length !== 3) {
            problems.push(
              `${entry.id} ${category}.${band}: 변형 ${variants.length}개`
            );
          }
        }
      }
    }
    for (const sentence of POOL_SENTENCES) {
      if (typeof sentence.text !== 'string' || !sentence.text.trim()) {
        problems.push(`${sentence.where}: 빈 문장`);
      } else if (sentence.text !== sentence.text.trim()) {
        problems.push(`${sentence.where}: 앞뒤 공백`);
      }
    }
    expect(problems, problems.join('\n')).toEqual([]);
  });

  test('AC-39(참고): 낮은 구간 변형 3개가 서로 다른 문장이다 (같은 구간 안 완전 중복은 자동 실패)', () => {
    const groups = new Map<string, string[]>();
    for (const s of POOL_SENTENCES) {
      const key = `${s.poolId} ${s.category}.${s.band}`;
      groups.set(key, [...(groups.get(key) ?? []), s.text]);
    }
    const duplicates = [...groups.entries()]
      .filter(([, texts]) => new Set(texts).size !== texts.length)
      .map(([key]) => key);
    expect(duplicates, duplicates.join('\n')).toEqual([]);
  });
});

// ---------- 금지 표현 (AC-37, design.md 8.2) ----------

// plan "금지 표현 목록" 중 상수 목록에 있어야 하는 구 ("당첨 예측" 등은 "당첨"이 덮는다)
const PLAN_FORBIDDEN_TERMS: readonly string[] = [
  '100%',
  '적중',
  '정확히 맞',
  '백발백중',
  '족집게',
  '무조건',
  '반드시',
  '확실히',
  '보장',
  '예측',
  '틀림없',
  '운명이 바뀐',
  '인생이 바뀐',
  '운명을 바꿔',
  '대박',
  '합격합니다',
  '헤어집니다',
  '성공합니다',
  '당첨',
  '확률 100%',
  '예상 번호',
  '필승',
  '1등 번호',
  '로또 예측',
  '로또 대박',
  '로또 번호 추천',
  '오늘의 로또 번호',
  '복권 운',
  '구매하세요',
  '사세요',
  '책임을 지지 않',
  '일절 책임',
  '모든 책임',
  '법적 책임이 없',
  '책임 없음',
  '동의로 책임이 면제',
  '사주 분석',
  '사주 풀이',
  '정통',
  '정확한 맞춤',
  '맞춤 풀이',
  '전문가 수준',
  'AI 분석',
  'AI가',
  '투자하세요',
  '주식',
  '코인',
  '비트코인',
  '매수',
  '대출',
  '부동산',
  '횡재',
  '벼락부자',
  '병에 걸',
  '수술',
  '사망',
  '죽음',
  '재앙',
  '액운',
  '저주',
  '파산',
  '불행',
  '사고가 나',
  '사고를 당',
  '점신',
  '포스텔러',
  '토정비결',
];

describe('AC-37: 금지 표현 (문구 데이터)', () => {
  test('AC-37: 금지 표현 목록이 plan "금지 표현 목록" 전체를 담고 있다', () => {
    const missing = PLAN_FORBIDDEN_TERMS.filter(
      (term) => !FORTUNE_FORBIDDEN_TERMS.includes(term)
    );
    expect(missing, missing.join('\n')).toEqual([]);
    expect(FORTUNE_FORBIDDEN_PATTERNS.map(String)).toEqual(
      expect.arrayContaining(['/게 됩니다/'])
    );
    // 단어 "사주" 하나만으로 된 항목은 금지 목록에 없다 (위치 규칙은 8.3에서 따로 검사)
    expect(FORTUNE_FORBIDDEN_TERMS).not.toContain('사주');
  });

  test('AC-37: 문구 풀 1152문장에 금지 표현이 없다', () => {
    const violations = POOL_SENTENCES.flatMap(findViolations);
    expect(violations, violations.join('\n')).toEqual([]);
  });

  test('AC-37, AC-73: 고지·이용 동의·이용 불가·연령 안내·입력 오류·지원 범위·윤달 안내 상수에 금지 표현이 없다', () => {
    const violations = NOTICE_TEXTS.flatMap(findViolations);
    expect(violations, violations.join('\n')).toEqual([]);
  });

  test('AC-37: FAQ·가이드(허브 포함)·SEO·메뉴 운세 그룹·상담전화·행운 요소·띠·별자리 이름에 금지 표현이 없다', () => {
    const targets = [
      ...FAQ_TEXTS,
      ...GUIDE_TEXTS,
      ...SEO_TEXTS,
      ...MENU_TEXTS,
      ...SHARED_TEXTS,
    ];
    const violations = targets.flatMap(findViolations);
    expect(violations, violations.join('\n')).toEqual([]);
  });

  test('AC-37: "보장"·"예측"은 부정 고지문을 포함해 어디에도 없다 (타로 문구는 대상이 아니다)', () => {
    const hits = ALL_TEXTS.filter((item) => /보장|예측/.test(item.text)).map(
      (item) => `${item.where}: ${item.text}`
    );
    expect(hits, hits.join('\n')).toEqual([]);
  });

  test('AC-37: 책임 과장 표현과 동의가 책임을 없앤다는 암시가 없다', () => {
    const terms = [
      '책임을 지지 않',
      '일절 책임',
      '모든 책임',
      '법적 책임이 없',
      '책임 없음',
      '동의로 책임이 면제',
      '책임이 면제',
      '책임을 면',
    ];
    const hits = ALL_TEXTS.filter((item) =>
      terms.some((t) => item.text.includes(t))
    ).map((item) => `${item.where}: ${item.text}`);
    expect(hits, hits.join('\n')).toEqual([]);
  });

  test('AC-37: "당첨"은 로또 고지 문장 안에만 있고 그 문장은 plan 원문과 같다', () => {
    expect(FORTUNE_COPY_ALLOWED_SENTENCES).toEqual([
      noticeConstants.FORTUNE_LOTTO_NOTICE,
    ]);
    const hits = ALL_TEXTS.filter((item) =>
      stripAllowedSentences(item.text).includes('당첨')
    ).map((item) => `${item.where}: ${item.text}`);
    expect(hits, hits.join('\n')).toEqual([]);
  });

  test('AC-37: 방식 A 안내 3문장이 금지 구 검사를 예외 없이 통과한다', () => {
    for (const notice of [
      noticeConstants.FORTUNE_METHOD_A_NOTICE,
      noticeConstants.FORTUNE_METHOD_A_TTI_NOTICE,
      noticeConstants.FORTUNE_METHOD_A_STAR_SIGN_NOTICE,
    ]) {
      expect(findViolations({ where: '방식 A 안내', text: notice })).toEqual(
        []
      );
      expect(notice).not.toContain('사주 분석');
      expect(notice).not.toContain('사주 풀이');
    }
  });
});

// ---------- "사주" 위치 (AC-10, AC-58 방식 A 해당분, design.md 8.3) ----------

/** 허브 FAQ 7번 질문(SJ-G3 안 A). 괄호 설명 없이 "사주"로 시작하는 유일한 승인 예외 */
const HUB_FAQ_Q7_EXCEPTION = '사주는 다른 운세와 무엇이 다른가요?';
/** 허브 가이드 사주 소개 단락의 둘째 문장(W3). 같은 단락 첫 문장(W2)이 괄호 설명을 이미 붙였고 "사주 페이지" 링크 설명이다 */
const HUB_GUIDE_W3_EXCEPTION =
  '태어난 시간을 모르셔도 시주 없이 보실 수 있고, 23시대 출생 처리 같은 계산 기준은 사주 페이지에서 확인하실 수 있습니다.';

describe('AC-10, AC-58: "사주" 위치와 겹침 표현', () => {
  test('AC-10: 괄호 설명 상수가 정해진 문자열이고 안내 문장의 첫 "사주"가 괄호 설명이다', () => {
    expect(noticeConstants.FORTUNE_SAJU_GLOSS).toBe(
      '사주(태어난 연·월·일·시로 세우는 네 기둥)'
    );
    for (const notice of [
      noticeConstants.FORTUNE_METHOD_A_NOTICE,
      noticeConstants.FORTUNE_METHOD_A_TTI_NOTICE,
      noticeConstants.FORTUNE_METHOD_A_STAR_SIGN_NOTICE,
      noticeConstants.FORTUNE_METHOD_B_NOTICE,
    ]) {
      expect(notice.indexOf('사주'), notice).toBe(
        notice.indexOf(noticeConstants.FORTUNE_SAJU_GLOSS)
      );
    }
  });

  test('AC-10: 화이트리스트 문장마다 첫 "사주"가 괄호 설명(FORTUNE_SAJU_GLOSS)이고 "사주 분석"·"사주 풀이"가 없다', () => {
    const problems: string[] = [];
    for (const sentence of FORTUNE_SAJU_ALLOWED_TEXTS_METHOD_A) {
      const first = sentence.indexOf('사주');
      if (first < 0) problems.push(`"사주" 없음: ${sentence}`);
      // 허브 FAQ 7번 질문(안 A)은 V8.3 규칙 4의 승인된 예외 1건이다
      if (
        sentence === HUB_FAQ_Q7_EXCEPTION ||
        sentence === HUB_GUIDE_W3_EXCEPTION
      ) {
        continue;
      }
      if (first !== sentence.indexOf(noticeConstants.FORTUNE_SAJU_GLOSS)) {
        problems.push(`첫 "사주"가 괄호 설명이 아님: ${sentence}`);
      }
      if (/사주\s*(분석|풀이)/.test(sentence)) {
        problems.push(`금지 구 포함: ${sentence}`);
      }
    }
    expect(problems, problems.join('\n')).toEqual([]);
  });

  test('AC-10, AC-37: 문구 풀 4종·SEO 4개·메뉴·상담전화·행운 요소에 "사주"가 없다', () => {
    const strict = [...POOL_SENTENCES, ...SEO_TEXTS, ...SHARED_TEXTS];
    const hits = strict
      .filter((item) => item.text.includes('사주'))
      .map((item) => `${item.where}: ${item.text}`);
    expect(hits, hits.join('\n')).toEqual([]);
  });

  test('AC-10: 고지·FAQ·가이드의 "사주"는 화이트리스트 문장 안에만 있다 (단독 사주 문장 없음)', () => {
    const targets = [
      ...NOTICE_TEXTS_WITHOUT_SAJU_EXEMPT,
      ...FAQ_TEXTS,
      ...GUIDE_TEXTS,
    ];
    const violations = targets.flatMap(findSajuMisplaced);
    expect(violations, violations.join('\n')).toEqual([]);
  });

  test('AC-10: "사주"가 든 FAQ 항목은 첫 "사주"가 괄호 설명 형태이고 질문에는 "사주"가 없다', () => {
    const problems: string[] = [];
    for (const [name, items] of FAQ_SETS) {
      for (const item of items) {
        // 허브 FAQ 7번 질문(안 A)은 V8.3 규칙 4의 승인된 예외 1건이다
        if (
          item.question.includes('사주') &&
          item.question !== HUB_FAQ_Q7_EXCEPTION
        ) {
          problems.push(`${name} 질문에 사주: ${item.question}`);
        }
        const first = item.answer.indexOf('사주');
        if (
          first >= 0 &&
          first !== item.answer.indexOf(noticeConstants.FORTUNE_SAJU_GLOSS)
        ) {
          problems.push(`${name} 답변 첫 사주가 단독: ${item.question}`);
        }
      }
    }
    expect(problems, problems.join('\n')).toEqual([]);
  });

  test('AC-52: 모든 화면 문구에 "사주 네 기둥"·"사주 4기둥"·"4기둥"·"3기둥"과 폐기 문장("사주 풀이가 아닙니다")이 없다', () => {
    const violations = ALL_TEXTS.flatMap(findRedundant);
    expect(violations, violations.join('\n')).toEqual([]);
    expect(FORTUNE_SAJU_REDUNDANT_TERMS).toEqual(
      expect.arrayContaining(['사주 네 기둥', '사주 4기둥'])
    );
    expect(FORTUNE_INTERNAL_PILLAR_TERMS).toEqual(['4기둥', '3기둥']);
  });

  test('AC-58, AC-61, AC-88: 메뉴 운세 그룹은 네 기능 링크(사주는 마지막)이고 "사주"는 메뉴 label에만 있다', () => {
    expect(fortuneMenuGroup?.href).toBe(FORTUNE_ROUTES.hub);
    expect(fortuneMenuGroup?.items.map((i) => i.href)).toEqual([
      FORTUNE_ROUTES.today,
      FORTUNE_ROUTES.tti,
      FORTUNE_ROUTES.starSign,
      FORTUNE_ROUTES.saju,
    ]);
    expect(fortuneMenuGroup?.items.map((i) => i.label)).toEqual([
      '오늘의 운세',
      '띠별 운세',
      '별자리 운세',
      '사주',
    ]);
    const sajuItem = fortuneMenuGroup?.items.find(
      (i) => i.href === FORTUNE_ROUTES.saju
    );
    expect(sajuItem?.description ?? '').not.toContain('사주');
    expect(sajuItem?.example ?? '').not.toContain('사주');
    // 그룹 안에서 "사주" 글자는 label 하나뿐
    const saju = MENU_TEXTS.filter(
      (item) =>
        item.text.includes('사주') &&
        !item.where.includes('label') &&
        item.text !== '사주'
    );
    expect(saju.map((s) => `${s.where}: ${s.text}`)).toEqual([]);
  });
});

// ---------- 건강·재물 풀 (AC-39) ----------

const MONEY_RISK_TERMS: readonly string[] = [
  '투자',
  '주식',
  '코인',
  '비트코인',
  '가상화폐',
  '복권',
  '로또',
  '도박',
  '베팅',
  '배팅',
  '대출',
  '부동산',
  '펀드',
];
/** 한 글자 병명 "암"은 낱말로 쓰인 경우만 자동 실패, "암기" 같은 낱말 속 글자는 후보 */
function isStandaloneCancer(text: string): boolean {
  return /(^|[^가-힣])암(?:[이가을를은는의에도과와으]|$|[^가-힣])/.test(text);
}

describe('AC-39: 건강운·재물운 제한과 낮은 구간 행동 조언', () => {
  const healthSentences = POOL_SENTENCES.filter((s) => s.category === 'health');
  const moneySentences = POOL_SENTENCES.filter((s) => s.category === 'money');

  test('AC-39: 건강 풀(개인·12띠·12별자리 health 칸 225문장)에 병명·증상·약 목록의 말이 없다', () => {
    expect(healthSentences).toHaveLength(25 * 9);
    const hits: string[] = [];
    for (const s of healthSentences) {
      for (const term of FORTUNE_HEALTH_TERMS) {
        if (term === '암') {
          if (isStandaloneCancer(s.text))
            hits.push(`${s.where}: "암" -> ${s.text}`);
        } else if (s.text.includes(term)) {
          hits.push(`${s.where}: "${term}" -> ${s.text}`);
        }
      }
    }
    expect(hits, hits.join('\n')).toEqual([]);
  });

  test('AC-39: 재물 풀에 투자·주식·코인·복권·도박·대출 같은 권유가 없다', () => {
    expect(moneySentences).toHaveLength(25 * 9);
    const hits = moneySentences
      .filter((s) => MONEY_RISK_TERMS.some((t) => s.text.includes(t)))
      .map((s) => `${s.where}: ${s.text}`);
    expect(hits, hits.join('\n')).toEqual([]);
  });
});

describe('AC-38, AC-73: 합니다체', () => {
  test('AC-38: 문구 풀 1152문장이 합니다체로 통일돼 있다 (명백한 해요체는 자동 실패)', () => {
    const result = checkStyle(POOL_SENTENCES);
    expect(result.hard, result.hard.join('\n')).toEqual([]);
  });

  test('AC-38, AC-73: 고지·이용 동의·이용 불가·연령 안내·입력 오류·가이드·SEO·메뉴 문장이 합니다체다 (자동 실패는 명백한 해요체만)', () => {
    const result = checkStyle([
      ...NOTICE_TEXTS,
      ...GUIDE_TEXTS,
      ...SEO_TEXTS,
      ...MENU_TEXTS,
      ...SHARED_TEXTS,
    ]);
    expect(result.hard, result.hard.join('\n')).toEqual([]);
  });

  test('AC-38: FAQ 답변과 질문에 명백한 해요체가 없고, 질문은 물음표로 끝난다', () => {
    const answers = FAQ_SETS.flatMap(([name, items]) =>
      items.map(
        (item, i): NamedText => ({
          where: `${name} 답변 ${i + 1}`,
          text: item.answer,
        })
      )
    );
    const questions = FAQ_SETS.flatMap(([name, items]) =>
      items.map(
        (item, i): NamedText => ({
          where: `${name} 질문 ${i + 1}`,
          text: item.question,
        })
      )
    );
    const answerResult = checkStyle(answers);
    const questionResult = checkStyle(questions);
    expect(answerResult.hard, answerResult.hard.join('\n')).toEqual([]);
    expect(questionResult.hard, questionResult.hard.join('\n')).toEqual([]);
    for (const [name, items] of FAQ_SETS) {
      expect(items.length, name).toBeGreaterThanOrEqual(5);
      for (const item of items) {
        expect(item.question.trim(), name).toMatch(/\?$/);
        expect(item.answer.trim().length, name).toBeGreaterThan(30);
      }
    }
  });
});

// ---------- 지원 범위·윤달 안내 문구 (D14, AC-8, AC-9, AC-85) ----------

function formatYmdText(ymd: { year: number; month: number; day: number }) {
  return `${ymd.year}년 ${ymd.month}월 ${ymd.day}일`;
}

describe('지원 범위·윤달 안내 문구', () => {
  test('AC-8, AC-9: 지원 범위 안내와 범위 오류 문구가 지원 범위 상수(1920-01-01 ~ 2028-12-31)에서 만들어진 날짜를 담는다', () => {
    const min = formatYmdText(FORTUNE_MIN_BIRTH);
    const max = formatYmdText(FORTUNE_MAX_BIRTH);
    expect(min).toBe('1920년 1월 1일');
    expect(max).toBe('2028년 12월 31일');
    expect(noticeConstants.FORTUNE_SUPPORTED_RANGE_NOTICE).toContain(min);
    expect(noticeConstants.FORTUNE_SUPPORTED_RANGE_NOTICE).toContain(max);
    for (const key of ['before-min', 'after-max'] as const) {
      const message = noticeConstants.FORTUNE_BIRTH_ERROR_MESSAGES[key];
      expect(message, key).toContain(min);
      expect(message, key).toContain(max);
    }
    const faqRange = FORTUNE_TODAY_FAQ.find((f) =>
      f.question.includes('몇 년생')
    );
    expect(faqRange?.answer).toContain(min);
    expect(faqRange?.answer).toContain(max);
  });

  test('AC-8: 입력 오류 8종이 모두 있고 합니다체이며 입력값 자리 표시가 없다', () => {
    const messages = noticeConstants.FORTUNE_BIRTH_ERROR_MESSAGES;
    expect(Object.keys(messages).sort()).toEqual(
      [
        'empty',
        'invalid-date',
        'before-min',
        'after-max',
        'future',
        'lunar-no-leap',
        'lunar-invalid-day',
        'out-of-table',
      ].sort()
    );
    for (const [key, message] of Object.entries(messages)) {
      expect(message.trim().length, key).toBeGreaterThan(10);
      expect(message, key).toMatch(/(다)\.$/);
      expect(message, key).not.toMatch(/[{}]/);
    }
  });

  test('AC-85: 윤달 안내 템플릿에 {연도}·{월} 자리가 있고 합니다체이며 사주를 쓰지 않는다', () => {
    const template = noticeConstants.FORTUNE_LEAP_MONTH_HINT_TEMPLATE;
    expect(template).toContain('{연도}');
    expect(template).toContain('{월}');
    expect(template).toContain('윤달');
    expect(template).not.toContain('사주');
    expect(findViolations({ where: '윤달', text: template })).toEqual([]);
    const sentences = splitSentences(template);
    expect(sentences.length).toBeGreaterThanOrEqual(1);
    for (const sentence of sentences) expect(sentence).toMatch(/다\.$/);
  });
});

describe('AC-73, AC-37: 이용 동의·이용 불가 화면 문구', () => {
  test('AC-73: 이용 동의·이용 불가 화면 문구에 금지 표현이 없고 책임이 없다는 뜻의 표현이 없다', () => {
    const texts = collect([
      ['이용 동의', noticeConstants.FORTUNE_CONSENT_TEXTS],
      ['이용 불가', noticeConstants.FORTUNE_DECLINED_TEXTS],
    ]);
    expect(texts.length).toBeGreaterThan(5);
    const violations = texts.flatMap(findViolations);
    expect(violations, violations.join('\n')).toEqual([]);
    for (const item of texts) {
      expect(item.text, item.where).not.toMatch(/책임(이|을)? (면제|없)/);
    }
  });
});

describe('AC-10 (fortune-v2): 띠·별자리 찾기 안내 문장', () => {
  test('AC-10: 새 안내 문장 상수가 (가)안과 같고 금지 표현이 없다', () => {
    const ttiNotice =
      '생년월일은 내 띠를 찾는 데 쓰이며, 띠별 운세 문구는 누구에게나 같습니다.';
    const starNotice =
      '생년월일은 내 별자리를 찾는 데 쓰이며, 별자리별 운세 문구는 누구에게나 같습니다.';
    expect(noticeConstants.FORTUNE_FINDER_BASIS_NOTICE).toBe(ttiNotice);
    expect(noticeConstants.FORTUNE_FINDER_BASIS_STAR_SIGN_NOTICE).toBe(
      starNotice
    );
    for (const text of [ttiNotice, starNotice]) {
      expect(findViolations({ where: '안내 문장', text }), text).toEqual([]);
      for (const word of ['보장', '정확', '맞춤']) {
        expect(text).not.toContain(word);
      }
    }
  });
});

describe('소스 검사: 운세 화면 코드 문자열', () => {
  test('AC-37: 운세 화면 코드(tsx)·상수(ts)의 한글 문자열에 금지 표현·겹침 표현이 없다 (로또 고지 문장만 예외)', () => {
    const files = fortuneSourceFiles();
    expect(files.length).toBeGreaterThan(50);
    const violations: string[] = [];
    for (const file of files) {
      for (const item of extractKoreanTexts(file.content)) {
        const named = { where: `${file.path}:${item.line}`, text: item.text };
        violations.push(...findViolations(named), ...findRedundant(named));
      }
    }
    expect(uniqueLines(violations), uniqueLines(violations).join('\n')).toEqual(
      []
    );
  });
});

// =====================================================================
// SJ-QA2 사주 문구 검사 (design-saju-v2 V10.2, V10.3). 1단계 케이스는 이 블록 앞뒤에 그대로 있다.
// =====================================================================

const SAJU_PAGE_FORBIDDEN: readonly string[] = [
  ...FORTUNE_FORBIDDEN_TERMS.filter(
    (term) => term !== '사주 분석' && term !== '사주분석'
  ),
  ...FORTUNE_SAJU_PAGE_FORBIDDEN_TERMS,
];

/** 사주 페이지 기준 금지어(사주 분석 허용, 페이지 전용 금지어 추가) + 패턴 + 겹침 표현 */
function findSajuPageViolations(item: NamedText): string[] {
  const text = stripAllowed(item.text);
  const found: string[] = [];
  for (const term of SAJU_PAGE_FORBIDDEN) {
    const index = text.indexOf(term);
    if (index >= 0) {
      found.push(
        `${item.where}: 금지 표현 "${term}" -> ${excerpt(text, index, term.length)}`
      );
    }
  }
  for (const pattern of FORTUNE_FORBIDDEN_PATTERNS) {
    const match = pattern.exec(text);
    if (match) {
      found.push(
        `${item.where}: 금지 패턴 ${pattern} -> ${excerpt(text, match.index, match[0].length)}`
      );
    }
  }
  found.push(...findRedundant(item));
  return found;
}

const SAJU_KEYS = [
  'bigyeon',
  'geopjae',
  'siksin',
  'sanggwan',
  'pyeonjae',
  'jeongjae',
  'pyeongwan',
  'jeonggwan',
  'pyeonin',
  'jeongin',
] as const;

const SAJU_POOL_SENTENCES: PoolSentence[] = SAJU_KEYS.flatMap((key) =>
  poolSentences({
    id: `사주 ${key}`,
    kind: 'personal',
    pool: FORTUNE_SAJU_POOLS[key],
  })
);

const SAJU_NOTICE_TEXTS: NamedText[] = collect(
  Object.entries(sajuNoticeConstants).map(
    ([name, value]): [string, unknown] => [`사주 고지 ${name}`, value]
  )
);
const SAJU_SEO_TEXTS: NamedText[] = collect([['SEO 사주', FORTUNE_SAJU_SEO]]);
const SAJU_FAQ_TEXTS: NamedText[] = collect([['FAQ 사주', FORTUNE_SAJU_FAQ]]);
const SAJU_GUIDE_TEXTS: NamedText[] = collect([
  ['가이드 사주', FORTUNE_SAJU_GUIDE],
]);
const SAJU_ALL_TEXTS: NamedText[] = [
  ...SAJU_POOL_SENTENCES,
  ...SAJU_NOTICE_TEXTS,
  ...SAJU_SEO_TEXTS,
  ...SAJU_FAQ_TEXTS,
  ...SAJU_GUIDE_TEXTS,
];

const SAJU_CALC_BASIS = [
  sajuNoticeConstants.FORTUNE_SAJU_CALC_BASIS_PILLARS,
  sajuNoticeConstants.FORTUNE_SAJU_CALC_BASIS_DAY_HOUR,
  sajuNoticeConstants.FORTUNE_SAJU_CALC_BASIS_SCHOOLS,
  sajuNoticeConstants.FORTUNE_SAJU_CALC_BASIS_ZI_START,
  sajuNoticeConstants.FORTUNE_SAJU_CALC_BASIS_NO_CORRECTION,
  sajuNoticeConstants.FORTUNE_SAJU_CALC_BASIS_STATEMENT,
];

describe('SJ-QA2 사주 문구 풀·점수', () => {
  test('AC-54, AC-90: 사주 풀은 십신 10 x 항목 5 x 구간 3 x 변형 3 = 450문장이고 비어 있지 않다', () => {
    expect(Object.keys(FORTUNE_SAJU_POOLS).sort()).toEqual(
      [...SAJU_KEYS].sort()
    );
    expect(SAJU_POOL_SENTENCES).toHaveLength(450);
    for (const key of SAJU_KEYS) {
      const pool = FORTUNE_SAJU_POOLS[key] as Record<
        string,
        Record<string, readonly string[]>
      >;
      expect(Object.keys(pool).sort(), key).toEqual([...CATEGORY_KEYS].sort());
      for (const category of CATEGORY_KEYS) {
        expect(
          Object.keys(pool[category]).sort(),
          `${key}.${category}`
        ).toEqual([...BAND_KEYS].sort());
        for (const band of BAND_KEYS) {
          expect(
            pool[category][band],
            `${key}.${category}.${band}`
          ).toHaveLength(3);
        }
      }
    }
    const empty = SAJU_POOL_SENTENCES.filter((s) => s.text.trim().length < 20);
    expect(empty.map((s) => s.where)).toEqual([]);
  });

  test('AC-90: 사주 풀 450문장에 같은 문장이 두 번 나오지 않는다', () => {
    const seen = new Map<string, string>();
    const dup: string[] = [];
    for (const s of SAJU_POOL_SENTENCES) {
      const before = seen.get(s.text);
      if (before) dup.push(`${before} = ${s.where}`);
      seen.set(s.text, s.where);
    }
    expect(dup, dup.join('\n')).toEqual([]);
  });

  test('AC-54, AC-90: FORTUNE_SAJU_BASE_SCORES는 십신 10 x 항목 5, 모두 60~69 정수이고 총운 차이가 6 이하다', () => {
    expect(Object.keys(FORTUNE_SAJU_BASE_SCORES).sort()).toEqual(
      [...SAJU_KEYS].sort()
    );
    const bad: string[] = [];
    for (const key of SAJU_KEYS) {
      const scores = FORTUNE_SAJU_BASE_SCORES[key] as Record<string, number>;
      expect(Object.keys(scores).sort(), key).toEqual(
        [...CATEGORY_KEYS].sort()
      );
      for (const category of CATEGORY_KEYS) {
        const value = scores[category];
        if (!Number.isInteger(value) || value < 60 || value > 69) {
          bad.push(`${key}.${category}=${value}`);
        }
      }
    }
    expect(bad).toEqual([]);
    const totals = SAJU_KEYS.map((key) => FORTUNE_SAJU_BASE_SCORES[key].total);
    expect(Math.max(...totals) - Math.min(...totals)).toBeLessThanOrEqual(6);
  });

  test('AC-39: 사주 풀의 건강 칸에 병명·약 말이 없고 재물 칸에 투자 권유 말이 없다', () => {
    const hits: string[] = [];
    for (const s of SAJU_POOL_SENTENCES) {
      if (s.category === 'health') {
        for (const term of FORTUNE_HEALTH_TERMS) {
          const isHit =
            term === '암' ? isStandaloneCancer(s.text) : s.text.includes(term);
          if (isHit) hits.push(`${s.where}: "${term}" -> ${s.text}`);
        }
      }
      if (s.category === 'money') {
        for (const term of MONEY_RISK_TERMS) {
          if (s.text.includes(term)) hits.push(`${s.where}: "${term}"`);
        }
      }
    }
    expect(hits, hits.join('\n')).toEqual([]);
  });

  test('AC-38: 사주 풀 450문장과 십신 설명이 합니다체다 (명백한 해요체는 실패, 나머지는 후보 보고)', () => {
    const result = checkStyle([
      ...SAJU_POOL_SENTENCES,
      ...collect([
        ['십신 설명', sajuNoticeConstants.FORTUNE_SAJU_TEN_GOD_DESCRIPTIONS],
      ]),
    ]);
    expect(result.hard, result.hard.join('\n')).toEqual([]);
  });
});

describe('SJ-QA2 사주 금지어 (AC-37, AC-52, AC-56, AC-58, AC-89)', () => {
  test('AC-58: 사주 페이지 추가 금지어 6개와 기존 금지어(정통, 전문가 수준, AI 분석, AI가)가 목록에 있다', () => {
    expect(FORTUNE_SAJU_PAGE_FORBIDDEN_TERMS).toEqual(
      expect.arrayContaining([
        '정확한',
        'AI',
        '정자시',
        'same-day',
        'next-day',
        '평생 운을 알려',
      ])
    );
    expect(FORTUNE_FORBIDDEN_TERMS).toEqual(
      expect.arrayContaining(['정통', '전문가 수준', 'AI 분석', 'AI가'])
    );
  });

  test('AC-37, AC-58: 사주 풀 450문장·notice 전체·SEO·FAQ·가이드에 금지어(사주 페이지 기준)와 겹침 표현이 없다', () => {
    expect(SAJU_NOTICE_TEXTS.length).toBeGreaterThan(40);
    const violations = uniqueLines(
      SAJU_ALL_TEXTS.flatMap(findSajuPageViolations)
    );
    expect(violations, violations.join('\n')).toEqual([]);
  });

  test('AC-56: 사주 화면 문구 상수 어디에도 정자시, same-day, next-day 글자가 없다', () => {
    const hits = SAJU_ALL_TEXTS.filter((item) =>
      /정자시|same-day|next-day/i.test(item.text)
    ).map((item) => `${item.where}: ${item.text}`);
    expect(hits, hits.join('\n')).toEqual([]);
  });

  test('AC-52, AC-89: 사주 메타데이터·keywords·FAQ 질문에 "사주 네 기둥", "사주 4기둥", "사주 풀이"가 없다', () => {
    const targets: NamedText[] = [
      ...SAJU_SEO_TEXTS,
      ...FORTUNE_SAJU_FAQ.map((f, i) => ({
        where: `FAQ 질문 ${i + 1}`,
        text: f.question,
      })),
    ];
    for (const item of targets) {
      for (const term of ['사주 네 기둥', '사주 4기둥', '사주 풀이']) {
        expect(item.text, `${item.where} / ${term}`).not.toContain(term);
      }
    }
  });
});

describe('SJ-QA2 사주 상수 내용 (V10.1, V9, AC-56, AC-89)', () => {
  test('V10.1: fortune-saju-notice 필수 키가 있고 십신 설명 10개, 절기 이름 12개, 템플릿 자리표시자가 맞다', () => {
    const s = sajuNoticeConstants;
    expect(Object.keys(s.FORTUNE_SAJU_TEN_GOD_DESCRIPTIONS).sort()).toEqual(
      [...SAJU_KEYS].sort()
    );
    for (const text of Object.values(s.FORTUNE_SAJU_TEN_GOD_DESCRIPTIONS)) {
      expect(text.length).toBeGreaterThan(20);
    }
    expect([...s.FORTUNE_SAJU_SOLAR_TERM_NAMES]).toEqual([
      '소한',
      '입춘',
      '경칩',
      '청명',
      '입하',
      '망종',
      '소서',
      '입추',
      '백로',
      '한로',
      '입동',
      '대설',
    ]);
    expect(Object.keys(s.FORTUNE_SAJU_PANEL_TEXTS)).toEqual(
      expect.arrayContaining([
        'summaryTemplate',
        'calcBasisLinkLabel',
        'dateSubmitLabel',
      ])
    );
    expect(s.FORTUNE_SAJU_BOUNDARY_NOTICE_TEMPLATE).toContain('{절기}');
    expect(s.FORTUNE_SAJU_BOUNDARY_NOTICE_TEMPLATE).toContain('{기둥}');
    expect(s.FORTUNE_SAJU_CANDIDATE_LABEL_TEMPLATES.year).toContain('{간지}');
    expect(s.FORTUNE_SAJU_CANDIDATE_LABEL_TEMPLATES.month).toContain('{간지}');
    expect(s.FORTUNE_SAJU_PANEL_TEXTS.summaryTemplate).toContain('{연}');
    for (const item of SAJU_NOTICE_TEXTS) {
      expect(item.text.trim().length, item.where).toBeGreaterThan(0);
    }
  });

  test('AC-89: FORTUNE_SAJU_SEO는 heading 사주, keywords 5개, 경로 /fortune/saju이고 괄호 설명이 첫 "사주"다', () => {
    expect(FORTUNE_SAJU_SEO.heading).toBe('사주');
    expect(FORTUNE_SAJU_SEO.pathname).toBe(FORTUNE_ROUTES.saju);
    expect([...FORTUNE_SAJU_SEO.keywords]).toEqual([
      '사주',
      '무료 사주',
      '사주 만세력',
      '만세력 사주',
      '오늘의 사주 운세',
    ]);
    const gloss = noticeConstants.FORTUNE_SAJU_GLOSS;
    expect(FORTUNE_SAJU_SEO.description).toContain(gloss);
    expect(FORTUNE_SAJU_SEO.description).toContain('오락·참고용');
    for (const text of [
      FORTUNE_SAJU_SEO.description,
      FORTUNE_SAJU_SEO.headerDescription,
    ]) {
      expect(text.indexOf('사주')).toBe(text.indexOf(gloss));
    }
  });

  test('AC-89: FORTUNE_SAJU_FAQ는 질문 5개(의문형)이고 1번 답이 괄호 설명으로 시작하며 5번 답이 오늘의 사주 운세만 제공한다고 말한다', () => {
    expect(FORTUNE_SAJU_FAQ.map((f) => f.question)).toEqual([
      '사주란 무엇인가요?',
      '태어난 시간을 모르면 어떻게 되나요?',
      '계산 기준은 무엇인가요?',
      '23시 이후에 태어났으면 어떻게 계산하나요?',
      '평생 운이나 성격도 알 수 있나요?',
    ]);
    expect(
      FORTUNE_SAJU_FAQ[0].answer.startsWith(noticeConstants.FORTUNE_SAJU_GLOSS)
    ).toBe(true);
    expect(FORTUNE_SAJU_FAQ[4].answer).toContain('오늘의 사주 운세만');
  });

  test('AC-89: FORTUNE_SAJU_GUIDE는 소제목 3개이고 첫 "사주"가 괄호 설명이며 가이드 + 계산 기준 + FAQ가 600자 이상이다', () => {
    expect(FORTUNE_SAJU_GUIDE.map((g) => g.heading)).toEqual([
      '사주와 만세력',
      '이용 방법',
      '오늘의 운세와의 차이',
    ]);
    const body = FORTUNE_SAJU_GUIDE.flatMap((g) => g.paragraphs).join('');
    expect(body.indexOf('사주')).toBe(
      body.indexOf(noticeConstants.FORTUNE_SAJU_GLOSS)
    );
    const total =
      body.length +
      SAJU_CALC_BASIS.join('').length +
      FORTUNE_SAJU_FAQ.map((f) => f.question + f.answer).join('').length;
    expect(total).toBeGreaterThanOrEqual(600);
  });
});

describe('SJ-QA2 허브 개정 (AC-88)', () => {
  test('AC-88: 허브 가이드·FAQ에 "세 가지", "세 운세"가 없다', () => {
    const texts = collect([
      ['가이드 허브', FORTUNE_HUB_GUIDE],
      ['FAQ 허브', FORTUNE_HUB_FAQ],
    ]);
    const hits = texts
      .filter((t) => /세 가지|세가지|세 운세/.test(t.text))
      .map((t) => `${t.where}: ${t.text}`);
    expect(hits, hits.join('\n')).toEqual([]);
  });

  test('AC-88: 허브 FAQ는 7쌍이고 7번째(안 A)가 사주와 다른 운세의 차이를 묻는다', () => {
    expect(FORTUNE_HUB_FAQ).toHaveLength(7);
    expect(FORTUNE_HUB_FAQ[6].question).toBe(
      '사주는 다른 운세와 무엇이 다른가요?'
    );
    expect(
      FORTUNE_HUB_FAQ[6].answer.startsWith(noticeConstants.FORTUNE_SAJU_GLOSS)
    ).toBe(true);
    for (const item of FORTUNE_HUB_FAQ) {
      expect(item.question.trim()).toMatch(/\?$/);
    }
  });

  test('AC-88: 허브 가이드가 문구 선택 방식과 만세력 계산 방식의 차이를 말하고 허브 SEO·Breadcrumb에 "사주"가 없다', () => {
    const guide = FORTUNE_HUB_GUIDE.flatMap((g) => g.paragraphs).join(' ');
    expect(guide).toContain('미리 작성해 둔 문구를 고르는 방식');
    expect(guide).toContain('만세력으로');
    const meta = collect([
      ['SEO 허브', FORTUNE_HUB_SEO],
      ['Breadcrumb', FORTUNE_BREADCRUMB_GROUP],
    ]).filter((t) => t.text.includes('사주'));
    expect(meta).toEqual([]);
  });

  test('AC-88, V10.2: 방식 A 화이트리스트에 옛 "세 운세" 문장이 없고 허브 FAQ 7번 질문이 등록돼 있다', () => {
    expect(
      FORTUNE_SAJU_ALLOWED_TEXTS_METHOD_A.filter((t) => /세 운세/.test(t))
    ).toEqual([]);
    expect(FORTUNE_SAJU_ALLOWED_TEXTS_METHOD_A).toContain(
      '사주는 다른 운세와 무엇이 다른가요?'
    );
  });

  test('AC-61, AC-88: 출시 후 메뉴(운세 그룹) 마지막에 사주 항목이 있다', () => {
    expect(fortuneMenuGroup?.items.map((i) => i.href)).toEqual([
      FORTUNE_ROUTES.today,
      FORTUNE_ROUTES.tti,
      FORTUNE_ROUTES.starSign,
      FORTUNE_ROUTES.saju,
    ]);
  });
});

describe('FORTUNE_ROUTES와 MENU_LIST', () => {
  const group = MENU_LIST.find((item) => item.group === 'fortune');

  test('운세 그룹이 있고 그룹 href가 허브(/fortune)와 같다', () => {
    expect(group).toBeDefined();
    expect(group?.href).toBe(FORTUNE_ROUTES.hub);
    expect(FORTUNE_ROUTES.hub).toBe('/fortune');
  });

  test('항목 href가 today·tti·starSign과 같고 순서도 그렇다', () => {
    expect(group?.items.map((item) => item.href)).toEqual([
      FORTUNE_ROUTES.today,
      FORTUNE_ROUTES.tti,
      FORTUNE_ROUTES.starSign,
      FORTUNE_ROUTES.saju,
    ]);
    expect(FORTUNE_ROUTES.today).toBe('/fortune/today');
    expect(FORTUNE_ROUTES.tti).toBe('/fortune/tti');
    expect(FORTUNE_ROUTES.starSign).toBe('/fortune/star-sign');
  });

  test('출시 후 메뉴 마지막에 사주 항목이 있고 "사주"는 label에만 있다 (AC-88)', () => {
    expect(FORTUNE_ROUTES.saju).toBe('/fortune/saju');
    const last = group?.items[group.items.length - 1];
    expect(last?.href).toBe(FORTUNE_ROUTES.saju);
    expect(last?.label).toBe('사주');
    expect(last?.description).not.toContain('사주');
    expect(last?.example).not.toContain('사주');
  });

  test('메뉴 항목마다 라벨·설명·아이콘이 있고 색은 운세 토큰이다', () => {
    for (const item of group?.items ?? []) {
      expect(item.label.length).toBeGreaterThan(0);
      expect(item.description.length).toBeGreaterThan(0);
      expect(item.icon.length).toBeGreaterThan(0);
      expect(item.colorClass).toBe('text-menu-fortune');
    }
  });

  test('다른 그룹(로또, 타로)의 href는 운세 경로와 겹치지 않는다', () => {
    const fortunePaths = new Set<string>([
      FORTUNE_ROUTES.hub,
      FORTUNE_ROUTES.today,
      FORTUNE_ROUTES.tti,
      FORTUNE_ROUTES.starSign,
    ]);
    for (const other of MENU_LIST.filter((item) => item.group !== 'fortune')) {
      for (const item of other.items) {
        expect(fortunePaths.has(item.href), item.href).toBe(false);
      }
    }
  });
});
