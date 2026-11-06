import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { expect, type Page, test } from '@playwright/test';
import * as crisisPhoneConstants from '@/constants/crisis-phone.constant';
import { MENU_LIST } from '@/constants/menu.constant';
import {
  FORTUNE_COPY_ALLOWED_SENTENCES,
  FORTUNE_FORBIDDEN_PATTERNS,
  FORTUNE_FORBIDDEN_TERMS,
  FORTUNE_HEALTH_TERMS,
  FORTUNE_INTERNAL_PILLAR_TERMS,
  FORTUNE_SAJU_ALLOWED_TEXTS_METHOD_A,
  FORTUNE_SAJU_REDUNDANT_TERMS,
} from '@/features/fortune/constants/fortune-copy-rule.constant';
import {
  FORTUNE_HUB_FAQ,
  FORTUNE_STAR_SIGN_FAQ,
  FORTUNE_TODAY_FAQ,
  FORTUNE_TTI_FAQ,
} from '@/features/fortune/constants/fortune-faq.constant';
import {
  FORTUNE_HUB_GUIDE,
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
import {
  FORTUNE_BREADCRUMB_GROUP,
  FORTUNE_HUB_SEO,
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
import { FORTUNE_STAR_SIGN_POOLS } from '@/features/fortune/constants/pools/star-sign-pools.constant';
import { FORTUNE_TTI_POOLS } from '@/features/fortune/constants/pools/tti-pools.constant';

const ROOT = process.cwd();
const RULE_FILE = path.join(
  'src',
  'features',
  'fortune',
  'constants',
  'fortune-copy-rule.constant.ts'
);
const FORTUNE_SOURCE_DIRS = [
  path.join('src', 'features', 'fortune'),
  path.join('src', 'app', 'fortune'),
];
const FORTUNE_SOURCE_FILES = [
  path.join('src', 'components', 'common', 'crisis-phone.component.tsx'),
  path.join('src', 'constants', 'crisis-phone.constant.ts'),
  path.join('src', 'types', 'crisis-phone.type.ts'),
];

// ---------- 도우미 ----------

type NamedText = { where: string; text: string };

/** 객체·배열·문자열을 재귀로 풀어 문자열만 모은다 (함수, 숫자, 정규식 제외) */
function flattenStrings(value: unknown, where: string, out: NamedText[]) {
  if (typeof value === 'string') {
    out.push({ where, text: value });
  } else if (Array.isArray(value)) {
    for (const [i, item] of value.entries()) {
      flattenStrings(item, `${where}[${i}]`, out);
    }
  } else if (value && typeof value === 'object' && !(value instanceof RegExp)) {
    for (const [k, v] of Object.entries(value)) {
      flattenStrings(v, `${where}.${k}`, out);
    }
  }
}

function collect(entries: Array<[string, unknown]>): NamedText[] {
  const out: NamedText[] = [];
  for (const [where, value] of entries) flattenStrings(value, where, out);
  return out;
}

/** 허용 예외 문장(로또 고지)을 먼저 지운다 */
function stripAllowed(text: string): string {
  let result = text;
  for (const sentence of FORTUNE_COPY_ALLOWED_SENTENCES) {
    result = result.split(sentence).join('');
  }
  return result;
}

/** 긴 문장은 걸린 자리 앞뒤만 보여 준다 */
function excerpt(text: string, index: number, length: number): string {
  if (text.length <= 110) return text;
  const start = Math.max(0, index - 35);
  return `…${text.slice(start, index + length + 35)}…`;
}

/** 금지 표현·공백 변형·미래 확정 어미 위반 목록 */
function findViolations(item: NamedText): string[] {
  const text = stripAllowed(item.text);
  const found: string[] = [];
  const squeezed = text.replace(/\s+/g, '');
  for (const term of FORTUNE_FORBIDDEN_TERMS) {
    const index = text.indexOf(term);
    if (index >= 0) {
      found.push(
        `${item.where}: 금지 표현 "${term}" -> ${excerpt(text, index, term.length)}`
      );
    } else if (/\s/.test(term) && squeezed.includes(term.replace(/\s+/g, ''))) {
      found.push(`${item.where}: 금지 표현(공백 변형) "${term}" -> ${text}`);
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
  return found;
}

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

/** 문장 끝 기호와 따옴표·괄호를 뗀 끝부분 */
function stripEnding(sentence: string): string {
  return sentence.replace(/[\s.?!…"'”’)\]]+$/g, '');
}

/** 마침표·물음표·느낌표로 끝나는 문장만 문장으로 본다 (짧은 명사형 라벨은 제외) */
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => /[.?!]["'”’)\]]*$/.test(s));
}

// 명백한 해요체 종결 (평서문·명령문은 자동 실패)
const HARD_HAEYO = /(예요|에요|세요|네요|군요|죠|지요)$/;
// 의문형 해요체 (FAQ 질문은 승인된 문구에 있어 후보로만 보고한다)
const QUESTION_HAEYO = /(인가요|할까요|일까요|나요|가요|까요|어요|아요|여요)$/;

type StyleReport = {
  hard: string[];
  /** 의문형 "~나요?" 계열 (후보) */
  questionHaeyo: string[];
  /** 요로 끝나지만 명백하지 않은 문장 (후보) */
  haeyoCandidates: string[];
  /** 다 또는 까로 끝나지 않는 문장 (후보) */
  nonHabnidaCandidates: string[];
};

function checkStyle(items: NamedText[]): StyleReport {
  const report: StyleReport = {
    hard: [],
    questionHaeyo: [],
    haeyoCandidates: [],
    nonHabnidaCandidates: [],
  };
  const seen = new Set<string>();
  for (const item of items) {
    for (const sentence of splitSentences(item.text)) {
      if (seen.has(sentence)) continue;
      seen.add(sentence);
      const ending = stripEnding(sentence);
      const line = `${item.where}: ${sentence}`;
      if (HARD_HAEYO.test(ending)) {
        report.hard.push(line);
      } else if (QUESTION_HAEYO.test(ending)) {
        report.questionHaeyo.push(line);
      } else if (/요$/.test(ending)) {
        report.haeyoCandidates.push(line);
      } else if (!/(다|까)$/.test(ending)) {
        report.nonHabnidaCandidates.push(line);
      }
    }
  }
  return report;
}

/** 후보 목록은 자동 실패로 삼지 않고 첨부 파일과 콘솔로 보고한다 */
async function report(name: string, lines: string[]) {
  const info = test.info();
  await info.attach(`${name}.json`, {
    body: JSON.stringify(lines, null, 2),
    contentType: 'application/json',
  });
  console.log(
    `[fortune-copy][후보][${info.project.name}] ${name}: ${lines.length}건`
  );
  for (const line of lines) {
    console.log(`[fortune-copy][후보][${info.project.name}][${name}] ${line}`);
  }
}

function walkFiles(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, out);
    else out.push(full);
  }
  return out;
}

function rel(file: string): string {
  return path.relative(ROOT, file);
}

function readDoc(...segments: string[]): string {
  return fs.readFileSync(path.join(ROOT, ...segments), 'utf8');
}

/** 운세 소스 파일(ts, tsx). 규칙 파일과 달력 표는 뺀다 */
function fortuneSourceFiles(): string[] {
  const files = [
    ...FORTUNE_SOURCE_DIRS.flatMap((dir) => walkFiles(path.join(ROOT, dir))),
    ...FORTUNE_SOURCE_FILES.map((file) => path.join(ROOT, file)),
  ].filter(
    (file) =>
      /\.(ts|tsx)$/.test(file) &&
      fs.existsSync(file) &&
      rel(file) !== RULE_FILE &&
      !rel(file).includes(`${path.sep}calendar${path.sep}`)
  );
  return files;
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

test.describe('문구 풀 구조: 개인 45, 공통 27, 띠 12×45, 별자리 12×45', () => {
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

// 자동 실패는 아니고 후보로만 보고하는 표현
const CANDIDATE_PATTERNS: Array<[string, RegExp]> = [
  [
    '미래 확정 어미 후보',
    /[할될질올갈볼] (것입니다|겁니다)|게 될 (수 있|것|거)/,
  ],
  ['단정 부사 후보', /절대|결코|확정적|꼭 (될|이루어|좋아|성공)/],
  ['운명·평생 후보', /운명|평생|숙명|팔자/],
  ['불안 유발 후보', /위험합니다|조심하지 않으면|큰일|나쁜 일이/],
  ['AI 단독 표기 후보', /\bAI\b/],
];

test.describe('AC-37: 금지 표현 (문구 데이터)', () => {
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
      stripAllowed(item.text).includes('당첨')
    ).map((item) => `${item.where}: ${item.text}`);
    expect(hits, hits.join('\n')).toEqual([]);
    const plan = readDoc('docs', 'fortune', 'plan.md');
    expect(plan).toContain(noticeConstants.FORTUNE_LOTTO_NOTICE);
    expect(plan).toContain(noticeConstants.FORTUNE_LOTTO_LINK_LABEL);
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

  test('AC-37(참고): 단정·운명·불안 유발 후보 표현 목록을 보고한다 (자동 실패 아님)', async () => {
    const lines: string[] = [];
    for (const [label, pattern] of CANDIDATE_PATTERNS) {
      for (const item of ALL_TEXTS) {
        const match = pattern.exec(item.text);
        if (match) {
          lines.push(
            `${label} / ${item.where}: ${excerpt(item.text, match.index, match[0].length)}`
          );
        }
      }
    }
    await report('금지 표현 후보', lines);
  });
});

// ---------- "사주" 위치 (AC-10, AC-58 방식 A 해당분, design.md 8.3) ----------

test.describe('AC-10, AC-58: "사주" 위치와 겹침 표현', () => {
  test('AC-10: 괄호 설명 상수가 정해진 문자열이고 방식 A 안내 3문장이 plan 원문과 같다', () => {
    expect(noticeConstants.FORTUNE_SAJU_GLOSS).toBe(
      '사주(태어난 연·월·일·시로 세우는 네 기둥)'
    );
    const plan = readDoc('docs', 'fortune', 'plan.md');
    for (const notice of [
      noticeConstants.FORTUNE_METHOD_A_NOTICE,
      noticeConstants.FORTUNE_METHOD_A_TTI_NOTICE,
      noticeConstants.FORTUNE_METHOD_A_STAR_SIGN_NOTICE,
      noticeConstants.FORTUNE_METHOD_B_NOTICE,
    ]) {
      expect(plan, notice).toContain(notice);
      expect(notice.indexOf('사주')).toBe(
        notice.indexOf(noticeConstants.FORTUNE_SAJU_GLOSS)
      );
    }
  });

  test('AC-10: 화이트리스트 문장마다 첫 "사주"가 괄호 설명(FORTUNE_SAJU_GLOSS)이고 "사주 분석"·"사주 풀이"가 없다', () => {
    const problems: string[] = [];
    for (const sentence of FORTUNE_SAJU_ALLOWED_TEXTS_METHOD_A) {
      const first = sentence.indexOf('사주');
      if (first < 0) problems.push(`"사주" 없음: ${sentence}`);
      if (first !== sentence.indexOf(noticeConstants.FORTUNE_SAJU_GLOSS)) {
        problems.push(`첫 "사주"가 괄호 설명이 아님: ${sentence}`);
      }
      if (/사주\s*(분석|풀이)/.test(sentence)) {
        problems.push(`금지 구 포함: ${sentence}`);
      }
    }
    expect(problems, problems.join('\n')).toEqual([]);
  });

  test('AC-10(참고): 화이트리스트 문장이 실제 상수 어딘가에서 쓰이는지 확인한다 (쓰이지 않으면 후보)', async () => {
    const lines = FORTUNE_SAJU_ALLOWED_TEXTS_METHOD_A.filter(
      (sentence) => !UI_TEXTS.some((item) => item.text.includes(sentence))
    ).map((sentence) => `쓰이지 않는 화이트리스트 문장: ${sentence}`);
    await report('화이트리스트 미사용', lines);
  });

  test('AC-10, AC-37: 문구 풀 4종·SEO 4개·메뉴·상담전화·행운 요소에 "사주"가 없다', () => {
    const strict = [
      ...POOL_SENTENCES,
      ...SEO_TEXTS,
      ...MENU_TEXTS,
      ...SHARED_TEXTS,
    ];
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
        if (item.question.includes('사주')) {
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

  test('AC-58, AC-61: 메뉴 운세 그룹은 허브·세 기능 링크만 있고 사주 항목이 없다 (1단계)', () => {
    expect(fortuneMenuGroup?.href).toBe(FORTUNE_ROUTES.hub);
    expect(fortuneMenuGroup?.items.map((i) => i.href)).toEqual([
      FORTUNE_ROUTES.today,
      FORTUNE_ROUTES.tti,
      FORTUNE_ROUTES.starSign,
    ]);
    expect(fortuneMenuGroup?.items.map((i) => i.label)).toEqual([
      '오늘의 운세',
      '띠별 운세',
      '별자리 운세',
    ]);
    const saju = MENU_TEXTS.filter(
      (item) => item.text.includes('사주') || item.text.includes('saju')
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
const HEALTH_SYMPTOM_CANDIDATES =
  /통증|아프|아픔|염증|질환|질병|병원|치료|진단|증상|혈압|혈당|감염|어지럼/;
const ACTION_ENDING =
  /(바랍니다|좋겠습니다|방법입니다|좋습니다|낫습니다|됩니다|권합니다|보세요|둘 만합니다|만합니다|수월합니다|충분합니다|필요합니다|괜찮습니다|유의하시기|합니다)\.?$/;

/** 한 글자 병명 "암"은 낱말로 쓰인 경우만 자동 실패, "암기" 같은 낱말 속 글자는 후보 */
function isStandaloneCancer(text: string): boolean {
  return /(^|[^가-힣])암(?:[이가을를은는의에도과와으]|$|[^가-힣])/.test(text);
}

test.describe('AC-39: 건강운·재물운 제한과 낮은 구간 행동 조언', () => {
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

  test('AC-39(참고): 건강 풀의 낱말 속 "암", 증상 어휘 후보를 보고한다 (자동 실패 아님)', async () => {
    const lines: string[] = [];
    for (const s of healthSentences) {
      if (s.text.includes('암') && !isStandaloneCancer(s.text)) {
        lines.push(`낱말 속 "암" / ${s.where}: ${s.text}`);
      }
      const match = HEALTH_SYMPTOM_CANDIDATES.exec(s.text);
      if (match) lines.push(`증상 어휘 "${match[0]}" / ${s.where}: ${s.text}`);
    }
    await report('건강 풀 후보', lines);
  });

  test('AC-39: 재물 풀에 투자·주식·코인·복권·도박·대출 같은 권유가 없다', () => {
    expect(moneySentences).toHaveLength(25 * 9);
    const hits = moneySentences
      .filter((s) => MONEY_RISK_TERMS.some((t) => s.text.includes(t)))
      .map((s) => `${s.where}: ${s.text}`);
    expect(hits, hits.join('\n')).toEqual([]);
  });

  test('AC-39(참고): 낮은 구간 문장의 마지막 문장이 행동 조언 어미로 끝나는지 본다 (후보 보고)', async () => {
    const lines: string[] = [];
    for (const s of POOL_SENTENCES.filter((p) => p.band === 'low')) {
      const sentences = splitSentences(s.text);
      const last = sentences[sentences.length - 1] ?? s.text;
      if (!ACTION_ENDING.test(last.trim())) {
        lines.push(`${s.where}: ${last}`);
      }
    }
    await report('낮은 구간 행동 조언 어미 후보', lines);
  });
});

// ---------- 합니다체 (AC-38, AC-73) ----------

test.describe('AC-38, AC-73: 합니다체', () => {
  test('AC-38: 문구 풀 1152문장이 합니다체로 통일돼 있다 (명백한 해요체는 자동 실패, 나머지는 후보)', async () => {
    const result = checkStyle(POOL_SENTENCES);
    await report('합니다체 풀 해요체 의심', [
      ...result.questionHaeyo,
      ...result.haeyoCandidates,
    ]);
    await report('합니다체 풀 종결 후보', result.nonHabnidaCandidates);
    expect(result.hard, result.hard.join('\n')).toEqual([]);
  });

  test('AC-38, AC-73: 고지·이용 동의·이용 불가·연령 안내·입력 오류·가이드·SEO·메뉴 문장이 합니다체다 (자동 실패는 명백한 해요체만)', async () => {
    const result = checkStyle([
      ...NOTICE_TEXTS,
      ...GUIDE_TEXTS,
      ...SEO_TEXTS,
      ...MENU_TEXTS,
      ...SHARED_TEXTS,
    ]);
    await report('합니다체 고지·가이드 해요체 의심', [
      ...result.questionHaeyo,
      ...result.haeyoCandidates,
    ]);
    await report('합니다체 고지·가이드 종결 후보', result.nonHabnidaCandidates);
    expect(result.hard, result.hard.join('\n')).toEqual([]);
  });

  test('AC-38: FAQ 답변은 합니다체이고, 질문의 "~나요?" 종결은 후보로 보고한다', async () => {
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
    await report('FAQ 질문 해요체 의심', [
      ...questionResult.questionHaeyo,
      ...questionResult.haeyoCandidates,
    ]);
    await report('FAQ 답변 해요체 의심', [
      ...answerResult.questionHaeyo,
      ...answerResult.haeyoCandidates,
    ]);
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

// ---------- 풀 안 중복·문장 끝 반복 (plan "유사 문장 점검" 4번) ----------

function bigrams(text: string): Set<string> {
  const squeezed = text.replace(/\s+/g, '');
  const out = new Set<string>();
  for (let i = 0; i < squeezed.length - 1; i++) {
    out.add(squeezed.slice(i, i + 2));
  }
  return out;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  let intersection = 0;
  for (const gram of a) if (b.has(gram)) intersection++;
  return intersection / (a.size + b.size - intersection);
}

function lastWords(text: string, count: number): string {
  const sentences = splitSentences(text);
  const last = (sentences[sentences.length - 1] ?? text).replace(/[.?!]+$/, '');
  return last.split(/\s+/).slice(-count).join(' ');
}

test.describe('AC-41(참고): 풀 안 중복과 문장 끝 반복 후보', () => {
  test('같은 문장이 풀 안(자동 실패는 같은 구간 변형 중복만)과 풀 사이에 반복되는지 본다', async () => {
    const byText = new Map<string, string[]>();
    for (const s of POOL_SENTENCES) {
      byText.set(s.text, [...(byText.get(s.text) ?? []), s.where]);
    }
    const lines = [...byText.entries()]
      .filter(([, wheres]) => wheres.length > 1)
      .map(([text, wheres]) => `${wheres.join(' = ')}: ${text}`);
    await report('풀 안·풀 사이 완전히 같은 문장', lines);
  });

  test('앞 20자가 같은 문장, 글자 2개 단위 겹침 0.6 이상인 쌍을 후보로 보고한다', async () => {
    const lines: string[] = [];
    const heads = new Map<string, string[]>();
    for (const s of POOL_SENTENCES) {
      const head = s.text.replace(/\s+/g, '').slice(0, 20);
      heads.set(head, [...(heads.get(head) ?? []), s.where]);
    }
    for (const [head, wheres] of heads) {
      if (wheres.length > 1)
        lines.push(`앞 20자 같음 "${head}": ${wheres.join(' = ')}`);
    }
    const grams = POOL_SENTENCES.map((s) => bigrams(s.text));
    for (let i = 0; i < POOL_SENTENCES.length; i++) {
      for (let j = i + 1; j < POOL_SENTENCES.length; j++) {
        const similarity = jaccard(grams[i], grams[j]);
        if (similarity >= 0.6) {
          lines.push(
            `겹침 ${similarity.toFixed(2)}: ${POOL_SENTENCES[i].where} ~ ${POOL_SENTENCES[j].where}`
          );
        }
      }
    }
    await report('비슷한 문장 쌍', lines);
  });

  test('한 풀에서 같은 끝 두 어절이 25% 이상이거나, 한 구간 변형 3개가 같은 끝 어절이면 후보로 보고한다', async () => {
    const lines: string[] = [];
    for (const entry of POOL_ENTRIES) {
      const own = POOL_SENTENCES.filter((s) => s.poolId === entry.id);
      const counts = new Map<string, number>();
      for (const s of own) {
        const key = lastWords(s.text, 2);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      for (const [key, n] of counts) {
        if (n / own.length >= 0.25) {
          lines.push(
            `${entry.id}: 끝 두 어절 "${key}" ${n}/${own.length} (${Math.round((n / own.length) * 100)}%)`
          );
        }
      }
      const bands = new Map<string, string[]>();
      for (const s of own) {
        const key = `${s.category}.${s.band}`;
        bands.set(key, [...(bands.get(key) ?? []), lastWords(s.text, 1)]);
      }
      for (const [key, words] of bands) {
        if (new Set(words).size === 1) {
          lines.push(
            `${entry.id} ${key}: 변형 3개가 모두 "${words[0]}"로 끝남`
          );
        }
      }
    }
    await report('문장 끝 반복', lines);
  });
});

// ---------- 지원 범위·윤달 안내 문구 (D14, AC-8, AC-9, AC-85) ----------

function formatYmdText(ymd: { year: number; month: number; day: number }) {
  return `${ymd.year}년 ${ymd.month}월 ${ymd.day}일`;
}

test.describe('지원 범위·윤달 안내 문구', () => {
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

  test('AC-8(참고): 소스 문자열에 지원 연도(1920, 2028)를 손으로 쓴 곳이 있는지 본다 (R-3, 후보 보고)', async () => {
    const lines: string[] = [];
    for (const file of fortuneSourceFiles()) {
      if (rel(file).endsWith('fortune-input.constant.ts')) continue;
      for (const item of extractKoreanTexts(fs.readFileSync(file, 'utf8'))) {
        if (/(1920|2028)\s*년/.test(item.text)) {
          lines.push(`${rel(file)}:${item.line}: ${item.text.slice(0, 80)}`);
        }
      }
    }
    await report('지원 연도 직접 표기', lines);
  });
});

// ---------- 승인 문구 일치 (plan 고지 1~17, ui-ux-design.md 승인 표) ----------

test.describe('AC-73, AC-37: 확정·승인된 고지 문구가 원문과 한 글자도 다르지 않다', () => {
  test('고지 상수가 plan 또는 ui-ux-design.md 원문에 그대로 들어 있다', () => {
    const docs =
      readDoc('docs', 'fortune', 'plan.md') +
      readDoc('docs', 'fortune', 'ui-ux-design.md');
    const n = noticeConstants;
    const approved: Array<[string, string]> = [
      ['상시 면책', n.FORTUNE_DISCLAIMER_TEXT],
      ['결과 하단', n.FORTUNE_RESULT_DISCLAIMER_TEXT],
      ['점수 안내', n.FORTUNE_SCORE_NOTICE],
      ['입력 개인정보 안내', n.FORTUNE_PRIVACY_INPUT_NOTICE],
      ['입력 연령 안내', n.FORTUNE_AGE_INPUT_NOTICE],
      ['동의 제목', n.FORTUNE_CONSENT_TEXTS.title],
      ['동의 안내', n.FORTUNE_CONSENT_TEXTS.intro],
      ...n.FORTUNE_CONSENT_TEXTS.items.map((t, i): [string, string] => [
        `동의 항목 ${i + 1}`,
        t,
      ]),
      ['동의 보관 안내', n.FORTUNE_CONSENT_TEXTS.storageNotice],
      ['진행 불가 안내', n.FORTUNE_CONSENT_TEXTS.blockedNotice],
      ['동의 버튼', n.FORTUNE_CONSENT_TEXTS.grantButton],
      ['동의 안 함 버튼', n.FORTUNE_CONSENT_TEXTS.declineButton],
      ['동의 다시 설정 버튼', n.FORTUNE_CONSENT_RESET_TEXTS.button],
      ['동의 다시 설정 설명', n.FORTUNE_CONSENT_RESET_TEXTS.description],
      ['이용 불가 제목', n.FORTUNE_DECLINED_TEXTS.title],
      ['이용 불가 본문', n.FORTUNE_DECLINED_TEXTS.body],
      ['이용 불가 버튼', n.FORTUNE_DECLINED_TEXTS.backButton],
      ['연령 안내 제목', n.FORTUNE_AGE_BLOCKED_TEXTS.title],
      ['연령 안내 본문', n.FORTUNE_AGE_BLOCKED_TEXTS.body],
      ['연령 안내 링크', n.FORTUNE_AGE_BLOCKED_TEXTS.homeLinkLabel],
      ['계산 기준 띠', n.FORTUNE_CALC_BASIS_TTI],
      ['계산 기준 별자리', n.FORTUNE_CALC_BASIS_STAR_SIGN],
      ['시각 모름', n.FORTUNE_TIME_UNKNOWN_NOTICE],
      ['표준시', n.FORTUNE_DST_NOTICE],
      ['이용 안내 제목', n.FORTUNE_DETAIL_NOTICE_TITLE],
      ...n.FORTUNE_DETAIL_NOTICE_ITEMS.map((t, i): [string, string] => [
        `이용 안내 ${i + 1}`,
        t,
      ]),
      ['띠 기준 차이', n.FORTUNE_DIFFERENT_BASIS_NOTICE],
      ['별자리 기준 차이', n.FORTUNE_DIFFERENT_BASIS_STAR_SIGN_NOTICE],
      ['오늘의 운세 링크', n.FORTUNE_TODAY_LINK_LABEL],
      ['noscript', n.FORTUNE_NOSCRIPT_NOTICE],
      ['로또 링크 라벨', n.FORTUNE_LOTTO_LINK_LABEL],
      ...(
        [
          'empty',
          'invalid-date',
          'future',
          'lunar-no-leap',
          'lunar-invalid-day',
          'out-of-table',
        ] as const
      ).map((key): [string, string] => [
        `입력 오류 ${key}`,
        n.FORTUNE_BIRTH_ERROR_MESSAGES[key],
      ]),
      ...FORTUNE_HUB_FAQ.flatMap(
        (item, i): Array<[string, string]> => [
          [`허브 FAQ ${i + 1} 질문`, item.question],
          [`허브 FAQ ${i + 1} 답변`, item.answer],
        ]
      ),
      ...FORTUNE_HUB_GUIDE.flatMap((section) => [
        [`허브 설명 제목 ${section.heading}`, section.heading] as [
          string,
          string,
        ],
        ...section.paragraphs.map((p, i): [string, string] => [
          `허브 설명 단락 ${i + 1}`,
          p,
        ]),
      ]),
      ['허브 h1 아래 설명', FORTUNE_HUB_SEO.headerDescription],
      ['상담전화 안내 문장', crisisPhoneConstants.CRISIS_RESULT_LINE],
    ];
    const missing = approved
      .filter(([, text]) => !docs.includes(text))
      .map(([label, text]) => `${label}: ${text}`);
    expect(missing, missing.join('\n')).toEqual([]);
  });

  test('AC-73: 이용 동의 항목이 3개이고 동의가 법적 책임을 없앤다는 뜻으로 읽히는 표현이 없다', () => {
    const consent = noticeConstants.FORTUNE_CONSENT_TEXTS;
    expect(consent.items).toHaveLength(3);
    const texts = [
      consent.title,
      consent.intro,
      consent.storageNotice,
      consent.blockedNotice,
      ...consent.items,
      ...Object.values(noticeConstants.FORTUNE_DECLINED_TEXTS),
    ];
    for (const text of texts) {
      expect(text).not.toMatch(/면책|면제|책임을 지지|책임이 없|책임 없음/);
    }
  });
});

// ---------- 소스 검사 (AC-37, AC-40, 외부 이미지) ----------

test.describe('소스 검사: 화면 코드 문자열, 규칙 파일 import, 외부 이미지, AI 호출', () => {
  test('AC-37: 운세 화면 코드(tsx)·상수(ts)의 한글 문자열에 금지 표현·겹침 표현이 없다 (로또 고지 문장만 예외)', () => {
    const files = fortuneSourceFiles();
    expect(files.length).toBeGreaterThan(50);
    const violations: string[] = [];
    for (const file of files) {
      for (const item of extractKoreanTexts(fs.readFileSync(file, 'utf8'))) {
        const named = { where: `${rel(file)}:${item.line}`, text: item.text };
        violations.push(...findViolations(named), ...findRedundant(named));
      }
    }
    expect(uniqueLines(violations), uniqueLines(violations).join('\n')).toEqual(
      []
    );
  });

  test('AC-10(참고): 소스 문자열의 "사주" 위치를 보고한다 (정의한 곳과 화이트리스트 밖은 후보)', async () => {
    const lines: string[] = [];
    for (const file of fortuneSourceFiles()) {
      for (const item of extractKoreanTexts(fs.readFileSync(file, 'utf8'))) {
        if (!item.text.includes('사주')) continue;
        if (stripSajuAllowed(item.text).includes('사주')) {
          lines.push(`${rel(file)}:${item.line}: ${item.text.slice(0, 90)}`);
        }
      }
    }
    await report('소스 문자열의 사주', lines);
  });

  test('AC-37: 화면 코드가 표현 규칙 검사 목록(fortune-copy-rule)을 import하지 않는다', () => {
    const importers = walkFiles(path.join(ROOT, 'src'))
      .filter((file) => /\.(ts|tsx|js|jsx|mjs)$/.test(file))
      .filter((file) => rel(file) !== RULE_FILE)
      .filter((file) =>
        // 주석의 언급은 import가 아니다. from '…'와 import('…')만 본다
        /(from\s+|import\s*\(\s*)['"][^'"]*fortune-copy-rule[^'"]*['"]/.test(
          fs.readFileSync(file, 'utf8')
        )
      )
      .map(rel);
    expect(importers).toEqual([]);
  });

  test('AC-40: 접속 시점에 AI를 호출하는 코드가 없다 (운세 소스에 fetch·axios·http 모듈·React Query·AI 서비스 이름이 없다)', () => {
    const hits: string[] = [];
    for (const file of fortuneSourceFiles()) {
      const source = fs.readFileSync(file, 'utf8');
      const code = source
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '');
      const patterns: Array<[string, RegExp]> = [
        ['fetch(', /\bfetch\s*\(/],
        ['axios', /from ['"]axios['"]/],
        ['@/lib/http', /@\/lib\/http/],
        ['react-query', /@tanstack\/react-query/],
        ['XMLHttpRequest', /XMLHttpRequest/],
        // 별자리 키 gemini(쌍둥이자리)와 겹치지 않게 서비스 주소·패키지 이름으로 본다
        [
          'AI 서비스',
          /openai|anthropic|chatgpt|@google\/generative|generativelanguage|api\.claude/i,
        ],
      ];
      for (const [label, pattern] of patterns) {
        if (pattern.test(code)) hits.push(`${rel(file)}: ${label}`);
      }
    }
    expect(hits, hits.join('\n')).toEqual([]);
  });

  test('AC-40: 외부 이미지·아이콘 세트 파일이 없다 (운세 이름의 이미지 파일 0건, git 기준 새 이미지 0건, 소스에 img·외부 이미지 주소 없음)', async () => {
    const imageExt = /\.(png|jpe?g|webp|svg|gif|avif|ico)$/i;
    const images = [
      ...walkFiles(path.join(ROOT, 'src')),
      ...walkFiles(path.join(ROOT, 'public')),
    ].filter((file) => imageExt.test(file));
    await report('저장소 이미지 파일', images.map(rel));

    const fortuneImages = images.filter((file) =>
      /fortune|운세|zodiac|horoscope|constellation|star-?sign|tti|띠|별자리/i.test(
        rel(file)
      )
    );
    expect(fortuneImages.map(rel)).toEqual([]);

    // 작업 트리에서 새로 생긴(추가·미추적) 이미지 파일
    let porcelain = '';
    try {
      porcelain = execFileSync(
        'git',
        [
          'status',
          '--porcelain',
          '--untracked-files=all',
          '--',
          'src',
          'public',
        ],
        { cwd: ROOT, encoding: 'utf8' }
      );
    } catch {
      porcelain = '';
    }
    const added = porcelain
      .split('\n')
      .filter((l) => /^(\?\?|A |AM|\?A)/.test(l) && imageExt.test(l.trim()))
      .map((l) => l.trim());
    expect(added).toEqual([]);

    const sourceHits: string[] = [];
    for (const file of fortuneSourceFiles()) {
      const code = fs
        .readFileSync(file, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '');
      if (/<img\b|next\/image|<Image\b/.test(code)) {
        sourceHits.push(`${rel(file)}: img/next/image`);
      }
      if (/https?:\/\/[^\s'"`)]+\.(png|jpe?g|webp|svg|gif|avif)/i.test(code)) {
        sourceHits.push(`${rel(file)}: 외부 이미지 주소`);
      }
      if (/url\(\s*['"]?https?:/.test(code)) {
        sourceHits.push(`${rel(file)}: css url(http)`);
      }
    }
    expect(sourceHits, sourceHits.join('\n')).toEqual([]);
  });

  test('AC-40: THIRD_PARTY_NOTICES.md에 운세 문구의 출처와 달력 표의 외부 데이터(한국천문연구원) 출처가 있다', () => {
    const notices = readDoc('THIRD_PARTY_NOTICES.md');
    expect(notices).toMatch(/Fortune/);
    expect(notices).toMatch(/original text written for this project/);
    expect(notices).toMatch(/Korea Astronomy and Space Science Institute/);
    expect(notices).toMatch(/No new dependencies, fonts or icon sets/);
  });
});

// ---------- docs/fortune/copy-log.md (AC-40, AC-41) ----------

test.describe('AC-40, AC-41: copy-log 기록', () => {
  const log = readDoc('docs', 'fortune', 'copy-log.md');
  const rows = (prefix: RegExp) =>
    log
      .split('\n')
      .filter((line) => prefix.test(line))
      .map((line) => line.split('|').map((cell) => cell.trim()));

  test('AC-40: AI 생성 지침 6개 항목이 첫머리에 있다', () => {
    const section = log.split('## 톤')[0];
    expect(section).toContain('AI 생성 지침');
    for (const n of [1, 2, 3, 4, 5, 6]) {
      expect(section, `지침 ${n}`).toMatch(new RegExp(`^${n}\\. `, 'm'));
    }
    expect(section).toMatch(/풀이 문장을 보지 않고/);
    expect(section).toMatch(/번역, 어순 변경, 일부 단어 교체/);
  });

  test('AC-40: 묶음별 작성자(AI)·작성일·검수자·검수일·상태 기록이 풀 1152문장과 가이드·FAQ·C-3d를 덮는다', async () => {
    // "## 묶음별 작성·검수 이력" 표만 읽는다
    const section = log.split('## 묶음별 작성·검수 이력')[1]?.split('\n## ')[0];
    expect(section, '묶음별 작성·검수 이력 절이 있어야 한다').toBeTruthy();
    const history = (section ?? '')
      .split('\n')
      .filter((line) => line.startsWith('| '))
      .map((line) => line.split('|').map((cell) => cell.trim()))
      .filter((cells) => cells.length >= 9 && cells[1] !== '묶음')
      .filter((cells) => !/^-+$/.test(cells[1]));
    expect(history.length).toBeGreaterThanOrEqual(11);
    const pending: string[] = [];
    let poolTotal = 0;
    for (const cells of history) {
      const [
        ,
        bundle,
        file,
        count,
        author,
        writtenAt,
        reviewer,
        reviewedAt,
        status,
      ] = cells;
      expect(author, `${bundle} 작성자`).toMatch(/AI/);
      expect(writtenAt, `${bundle} 작성일`).toMatch(/\d{4}-\d{2}-\d{2}/);
      expect(status, `${bundle} 상태`).not.toBe('');
      expect(reviewer, `${bundle} 검수자`).not.toBe('');
      if (/검수 완료/.test(status)) {
        expect(reviewedAt, `${bundle} 검수일`).toMatch(/\d{4}-\d{2}-\d{2}/);
      } else {
        pending.push(`${bundle}: ${status}`);
      }
      if (file.includes('pools/')) {
        poolTotal += Number(count.replace(/\(.*$/, '').replace(/[^\d]/g, ''));
      }
    }
    expect(poolTotal).toBe(1152);
    await report('copy-log 검수 완료되지 않은 묶음', pending);
  });

  test('AC-41: 웹 검색 샘플이 개인·띠·별자리 20문장 이상, 공통 풀 10문장 이상, 고지·FAQ·가이드 10문장 이상이고 점검일과 한계가 있다', () => {
    expect(log).toMatch(/점검일 2026-\d{2}-\d{2}/);
    expect(log).toMatch(/### 한계 \(AC-41\)/);
    const summary = rows(
      /^\| (개인 일운|띠|별자리|공통 풀|고지·FAQ·가이드)/
    ).filter((cells) => /^P|^T|^S|^C|^N/.test(cells[2] ?? ''));
    const sampleCount = (label: RegExp) =>
      Number(summary.find((cells) => label.test(cells[1]))?.[3] ?? 0);
    expect(sampleCount(/^개인 일운/)).toBeGreaterThanOrEqual(20);
    expect(sampleCount(/^띠/)).toBeGreaterThanOrEqual(20);
    expect(sampleCount(/^별자리/)).toBeGreaterThanOrEqual(20);
    expect(sampleCount(/^공통 풀/)).toBeGreaterThanOrEqual(10);
    expect(sampleCount(/^고지·FAQ·가이드/)).toBeGreaterThanOrEqual(10);
  });

  test('AC-41: "일치 있음" 판정이 나온 문장은 모두 "수정함"으로 표시돼 있다', () => {
    const matched = rows(/^\| [PCTSN]\d{2} \|/).filter((cells) =>
      cells.some((cell) => /^일치 있음/.test(cell))
    );
    expect(matched.length).toBeGreaterThanOrEqual(0);
    const notFixed = matched
      .filter((cells) => !cells.some((cell) => /수정함/.test(cell)))
      .map((cells) => cells[1]);
    expect(notFixed, notFixed.join(', ')).toEqual([]);
  });
});

// ---------- 서버 HTML (메타데이터·JSON-LD 포함, request로 받음) ----------

type PageTexts = {
  h1: string[];
  blocks: NamedText[];
  leaves: NamedText[];
  attrs: NamedText[];
  head: NamedText[];
  jsonLd: NamedText[];
  jsonLdRaw: unknown[];
  hrefs: string[];
};

/** html이 null이면 지금 열려 있는 페이지를, 문자열이면 그 서버 HTML을 읽는다 */
async function readTexts(page: Page, html: string | null): Promise<PageTexts> {
  const raw = await page.evaluate((source) => {
    const doc =
      source === null
        ? document
        : new DOMParser().parseFromString(source, 'text/html');
    const clean = (s: string | null | undefined) =>
      (s ?? '').replace(/\s+/g, ' ').trim();
    const inChrome = (el: Element) => el.closest('header, footer') !== null;
    const body = doc.body;

    const blocks = Array.from(
      body.querySelectorAll(
        'p, li, h1, h2, h3, h4, dt, dd, th, td, figcaption, label, legend, button, summary, a, noscript'
      )
    )
      .filter((el) => !inChrome(el))
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        text: clean(el.textContent),
      }))
      .filter((b) => b.text.length > 0);

    const skip = new Set(['SCRIPT', 'STYLE', 'TEMPLATE']);
    const leaves = Array.from(body.querySelectorAll('*'))
      .filter((el) => !inChrome(el) && !skip.has(el.tagName))
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        text: clean(
          Array.from(el.childNodes)
            .filter((n) => n.nodeType === 3)
            .map((n) => n.textContent ?? '')
            .join('')
        ),
      }))
      .filter((l) => l.text.length > 0);

    const attrs: Array<{ name: string; text: string }> = [];
    for (const el of Array.from(body.querySelectorAll('*'))) {
      if (inChrome(el)) continue;
      for (const name of ['aria-label', 'alt', 'title', 'placeholder']) {
        const value = el.getAttribute(name);
        if (value) attrs.push({ name, text: clean(value) });
      }
    }

    const meta = (selector: string) =>
      doc.querySelector(selector)?.getAttribute('content') ?? '';
    const head = [
      { where: 'title', text: doc.title },
      { where: 'description', text: meta('meta[name="description"]') },
      { where: 'keywords', text: meta('meta[name="keywords"]') },
      { where: 'og:title', text: meta('meta[property="og:title"]') },
      {
        where: 'og:description',
        text: meta('meta[property="og:description"]'),
      },
      { where: 'og:image', text: meta('meta[property="og:image"]') },
      { where: 'og:image:alt', text: meta('meta[property="og:image:alt"]') },
      { where: 'twitter:title', text: meta('meta[name="twitter:title"]') },
      {
        where: 'twitter:description',
        text: meta('meta[name="twitter:description"]'),
      },
      { where: 'twitter:image', text: meta('meta[name="twitter:image"]') },
      {
        where: 'twitter:image:alt',
        text: meta('meta[name="twitter:image:alt"]'),
      },
    ].filter((h) => h.text.length > 0);

    const jsonLd = Array.from(
      doc.querySelectorAll('script[type="application/ld+json"]')
    ).map((el) => el.textContent ?? '');
    const hrefs = Array.from(doc.querySelectorAll('a[href]')).map(
      (el) => el.getAttribute('href') ?? ''
    );
    const h1 = Array.from(body.querySelectorAll('h1'))
      .filter((el) => !inChrome(el))
      .map((el) => clean(el.textContent));
    return { blocks, leaves, attrs, head, jsonLd, hrefs, h1 };
  }, html);

  const jsonLdRaw: unknown[] = [];
  const jsonLd: NamedText[] = [];
  raw.jsonLd.forEach((text, index) => {
    const parsed: unknown = JSON.parse(text);
    jsonLdRaw.push(parsed);
    flattenStrings(parsed, `JSON-LD ${index}`, jsonLd);
  });

  return {
    h1: raw.h1,
    blocks: raw.blocks.map((b, i) => ({
      where: `본문 ${b.tag} #${i}`,
      text: b.text,
    })),
    leaves: raw.leaves.map((l, i) => ({
      where: `글자 ${l.tag} #${i}`,
      text: l.text,
    })),
    attrs: raw.attrs.map((a, i) => ({
      where: `속성 ${a.name} #${i}`,
      text: a.text,
    })),
    head: raw.head.map((h) => ({
      where: `head ${h.where}`,
      // og:image 주소는 주소 안의 title·alt 값이 읽히도록 풀어서 본다
      text:
        h.where.includes('image') && !h.where.endsWith('alt')
          ? safeDecode(h.text)
          : h.text,
    })),
    jsonLd: jsonLd.filter(
      (j) => !/^https?:\/\/|^https:\/\/schema\.org/.test(j.text)
    ),
    jsonLdRaw,
    hrefs: raw.hrefs,
  };
}

function safeDecode(text: string): string {
  try {
    return decodeURIComponent(text.replace(/\+/g, ' '));
  } catch {
    return text;
  }
}

/**
 * 금지 표현 검사 대상. 블록 전체 글자(blocks)는 이웃한 span의 글자가 붙어
 * ("80점" + "신뢰를" = "점신") 가짜 일치가 생기므로 쓰지 않고, 요소 자신의 글자(leaves)를 쓴다.
 */
function allTexts(texts: PageTexts): NamedText[] {
  return [...texts.leaves, ...texts.attrs, ...texts.head, ...texts.jsonLd];
}

/** 금지 표현·겹침 표현·허용 위치 밖 "사주" 위반 목록 */
function auditTexts(items: NamedText[]) {
  return {
    forbidden: uniqueLines(items.flatMap(findViolations)),
    redundant: uniqueLines(items.flatMap(findRedundant)),
    saju: uniqueLines(items.flatMap(findSajuMisplaced)),
  };
}

function hasText(texts: PageTexts, needle: string): boolean {
  return texts.blocks.some((b) => b.text.includes(needle));
}

type ServerPage = {
  pagePath: string;
  seo: FortunePageSeoType;
  faq: readonly { question: string; answer: string }[];
  guide: readonly { heading: string; paragraphs: readonly string[] }[];
  required: string[];
};

const n = noticeConstants;
const SERVER_PAGES: ServerPage[] = [
  {
    pagePath: FORTUNE_ROUTES.hub,
    seo: FORTUNE_HUB_SEO,
    faq: FORTUNE_HUB_FAQ,
    guide: FORTUNE_HUB_GUIDE,
    required: [
      n.FORTUNE_DISCLAIMER_TEXT,
      n.FORTUNE_RESULT_DISCLAIMER_TEXT,
      n.FORTUNE_DETAIL_NOTICE_TITLE,
      ...n.FORTUNE_DETAIL_NOTICE_ITEMS,
      crisisPhoneConstants.CRISIS_RESULT_LINE,
    ],
  },
  {
    pagePath: FORTUNE_ROUTES.today,
    seo: FORTUNE_TODAY_SEO,
    faq: FORTUNE_TODAY_FAQ,
    guide: FORTUNE_TODAY_GUIDE,
    required: [
      n.FORTUNE_DISCLAIMER_TEXT,
      n.FORTUNE_PRIVACY_INPUT_NOTICE,
      n.FORTUNE_AGE_INPUT_NOTICE,
      n.FORTUNE_NOSCRIPT_NOTICE,
      n.FORTUNE_RESULT_DISCLAIMER_TEXT,
      n.FORTUNE_SUPPORTED_RANGE_NOTICE,
      ...n.FORTUNE_DETAIL_NOTICE_ITEMS,
      crisisPhoneConstants.CRISIS_RESULT_LINE,
    ],
  },
  {
    pagePath: FORTUNE_ROUTES.tti,
    seo: FORTUNE_TTI_SEO,
    faq: FORTUNE_TTI_FAQ,
    guide: FORTUNE_TTI_GUIDE,
    required: [
      n.FORTUNE_DISCLAIMER_TEXT,
      n.FORTUNE_RESULT_DISCLAIMER_TEXT,
      n.FORTUNE_TODAY_LINK_LABEL,
      n.FORTUNE_SUPPORTED_RANGE_NOTICE,
      ...n.FORTUNE_DETAIL_NOTICE_ITEMS,
      crisisPhoneConstants.CRISIS_RESULT_LINE,
    ],
  },
  {
    pagePath: FORTUNE_ROUTES.starSign,
    seo: FORTUNE_STAR_SIGN_SEO,
    faq: FORTUNE_STAR_SIGN_FAQ,
    guide: FORTUNE_STAR_SIGN_GUIDE,
    required: [
      n.FORTUNE_DISCLAIMER_TEXT,
      n.FORTUNE_RESULT_DISCLAIMER_TEXT,
      n.FORTUNE_TODAY_LINK_LABEL,
      n.FORTUNE_SUPPORTED_RANGE_NOTICE,
      ...n.FORTUNE_DETAIL_NOTICE_ITEMS,
      crisisPhoneConstants.CRISIS_RESULT_LINE,
    ],
  },
];

test.describe('서버 HTML (request로 받은 응답): 본문, title, description, OG, JSON-LD', () => {
  test.describe.configure({ timeout: 120_000 });

  for (const item of SERVER_PAGES) {
    const { pagePath, seo } = item;

    test(`AC-37, AC-10: ${pagePath} 서버 HTML이 200대 응답이고 h1이 하나이며 title·description이 상수와 같다`, async ({
      page,
      request,
    }) => {
      const res = await request.get(pagePath);
      expect(res.status()).toBeLessThan(400);
      const texts = await readTexts(page, await res.text());
      expect(texts.h1).toEqual([seo.heading]);
      const get = (where: string) =>
        texts.head.find((h) => h.where === `head ${where}`)?.text ?? '';
      expect(get('title')).toContain(seo.title);
      expect(get('description')).toBe(seo.description);
      expect(get('og:title')).toContain(seo.title);
      expect(get('og:image:alt')).toBe(seo.ogImageAlt);
      expect(hasText(texts, seo.headerDescription)).toBe(true);
    });

    test(`AC-37, AC-10: ${pagePath} 서버 HTML(본문·메타데이터·JSON-LD·속성)에 금지 표현·겹침 표현·허용 위치 밖 "사주"가 없다`, async ({
      page,
      request,
    }) => {
      const res = await request.get(pagePath);
      expect(res.status()).toBeLessThan(400);
      const texts = await readTexts(page, await res.text());
      expect(texts.blocks.length).toBeGreaterThan(10);
      expect(texts.jsonLd.length).toBeGreaterThan(3);

      const audit = auditTexts(allTexts(texts));
      expect(audit.forbidden, audit.forbidden.join('\n')).toEqual([]);
      expect(audit.redundant, audit.redundant.join('\n')).toEqual([]);
      expect(audit.saju, audit.saju.join('\n')).toEqual([]);
    });

    test(`AC-10: ${pagePath} 메타데이터(title, description, keywords, OG, twitter, OG alt)와 JSON-LD의 Breadcrumb·ItemList에는 "사주"가 없다`, async ({
      page,
      request,
    }) => {
      const res = await request.get(pagePath);
      const texts = await readTexts(page, await res.text());
      const flat = JSON.stringify(texts.jsonLdRaw, (key, value: unknown) =>
        key === 'mainEntity' ? undefined : value
      );
      expect(
        texts.head.filter((h) => h.text.includes('사주')).map((h) => h.where)
      ).toEqual([]);
      // FAQPage(mainEntity)만 방식 구분 문장을 담을 수 있다
      expect(flat).not.toContain('사주');
      expect(texts.head.map((h) => h.where)).toEqual(
        expect.arrayContaining([
          'head title',
          'head description',
          'head og:title',
          'head og:description',
          'head og:image:alt',
        ])
      );
    });

    test(`AC-37, AC-73: ${pagePath} 서버 HTML 문장은 합니다체다 (명백한 해요체는 자동 실패, 나머지는 후보)`, async ({
      page,
      request,
    }) => {
      const res = await request.get(pagePath);
      const texts = await readTexts(page, await res.text());
      const result = checkStyle([
        ...texts.blocks,
        ...texts.head,
        ...texts.jsonLd,
      ]);
      await report(`서버 HTML ${pagePath} 해요체 의심`, [
        ...result.questionHaeyo,
        ...result.haeyoCandidates,
      ]);
      await report(
        `서버 HTML ${pagePath} 종결 후보`,
        result.nonHabnidaCandidates
      );
      expect(result.hard, result.hard.join('\n')).toEqual([]);
    });

    test(`AC-37: ${pagePath} 서버 HTML에 고지·FAQ·가이드·상담전화 문구가 상수 그대로 들어 있고 FAQPage JSON-LD가 화면 FAQ와 같다`, async ({
      page,
      request,
    }) => {
      const res = await request.get(pagePath);
      const texts = await readTexts(page, await res.text());
      const missing = [
        ...item.required,
        ...item.guide.flatMap((s) => [s.heading, ...s.paragraphs]),
        ...item.faq.flatMap((f) => [f.question, f.answer]),
      ].filter((text) => !hasText(texts, text));
      expect(missing, missing.join('\n')).toEqual([]);

      const jsonLdItems = texts.jsonLdRaw.flat() as Array<
        Record<string, unknown>
      >;
      const types = jsonLdItems.map((j) => j['@type']);
      expect(types).toContain('BreadcrumbList');
      expect(types).toContain('FAQPage');
      if (pagePath === FORTUNE_ROUTES.hub) expect(types).toContain('ItemList');
      const faqPage = jsonLdItems.find((j) => j['@type'] === 'FAQPage') as
        | {
            mainEntity: Array<{
              name: string;
              acceptedAnswer: { text: string };
            }>;
          }
        | undefined;
      expect(
        faqPage?.mainEntity.map((q) => [q.name, q.acceptedAnswer.text])
      ).toEqual(item.faq.map((f) => [f.question, f.answer]));
    });
  }

  test('AC-61, AC-80: 허브 서버 HTML에 기능 링크 3개가 있고 사주 링크와 입력칸이 없다', async ({
    page,
    request,
  }) => {
    const res = await request.get(FORTUNE_ROUTES.hub);
    const texts = await readTexts(page, await res.text());
    for (const href of [
      FORTUNE_ROUTES.today,
      FORTUNE_ROUTES.tti,
      FORTUNE_ROUTES.starSign,
    ]) {
      expect(texts.hrefs, href).toContain(href);
    }
    expect(texts.hrefs.filter((h) => h.includes('saju'))).toEqual([]);
    expect(
      texts.blocks.filter((b) => /동의하고 시작|생년월일 입력/.test(b.text))
    ).toEqual([]);
  });

  test('AC-61: 띠별·별자리 서버 HTML의 오늘의 운세 링크가 쿼리 없는 /fortune/today다', async ({
    page,
    request,
  }) => {
    for (const pagePath of [FORTUNE_ROUTES.tti, FORTUNE_ROUTES.starSign]) {
      const res = await request.get(pagePath);
      const texts = await readTexts(page, await res.text());
      expect(texts.hrefs, pagePath).toContain(FORTUNE_ROUTES.today);
      expect(
        texts.blocks.some((b) => b.text === n.FORTUNE_TODAY_LINK_LABEL),
        pagePath
      ).toBe(true);
    }
  });
});

// ---------- 화면 DOM: 동의·이용 불가·연령 안내·입력 오류·윤달·결과 ----------

/** 닫지 않으면 아래 버튼을 가리는 쿠키 배너를 거부로 닫는다 (사이트 공용 배너) */
async function dismissCookieBanner(page: Page) {
  await page
    .getByRole('button', { name: '쿠키 거부' })
    .click({ timeout: 5000 })
    .catch(() => undefined);
}

async function grantConsent(page: Page) {
  await expect(
    page.getByRole('heading', { name: n.FORTUNE_CONSENT_TEXTS.title })
  ).toBeVisible();
  await dismissCookieBanner(page);
  for (const checkbox of await page.getByRole('checkbox').all()) {
    await checkbox.check();
  }
  await page
    .getByRole('button', { name: n.FORTUNE_CONSENT_TEXTS.grantButton })
    .click();
}

async function submitBirth(
  page: Page,
  birth: { year: string; month: string; day: string },
  submitLabel: string
) {
  await page.getByLabel('연도', { exact: true }).fill(birth.year);
  await page.getByLabel('월', { exact: true }).fill(birth.month);
  await page.getByLabel('일', { exact: true }).fill(birth.day);
  await page.getByRole('button', { name: submitLabel, exact: true }).click();
}

function trackPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

/** 화면 상태마다 읽은 문구를 모아 두었다가 한꺼번에 검사한다 */
async function snapshot(page: Page, label: string, bucket: NamedText[]) {
  const texts = await readTexts(page, null);
  for (const item of allTexts(texts)) {
    bucket.push({ where: `[${label}] ${item.where}`, text: item.text });
  }
  return texts;
}

function expectCleanDom(bucket: NamedText[]) {
  const audit = auditTexts(bucket);
  expect(audit.forbidden, audit.forbidden.join('\n')).toEqual([]);
  expect(audit.redundant, audit.redundant.join('\n')).toEqual([]);
  expect(audit.saju, audit.saju.join('\n')).toEqual([]);
  const style = checkStyle(bucket);
  expect(style.hard, style.hard.join('\n')).toEqual([]);
  return style;
}

test.describe('화면 DOM: 이용 동의, 이용 불가, 입력 오류, 윤달 안내, 연령 안내', () => {
  test.describe.configure({ timeout: 180_000 });

  test('AC-73, AC-37: 동의 화면과 이용 불가 화면의 문구가 상수 그대로 보이고 금지 표현·"사주"가 없다', async ({
    page,
  }) => {
    const errors = trackPageErrors(page);
    const bucket: NamedText[] = [];
    await page.goto(FORTUNE_ROUTES.today);
    await expect(
      page.getByRole('heading', { name: n.FORTUNE_CONSENT_TEXTS.title })
    ).toBeVisible();
    await dismissCookieBanner(page);
    const consent = await snapshot(page, '동의 화면', bucket);
    for (const text of [
      n.FORTUNE_CONSENT_TEXTS.intro,
      ...n.FORTUNE_CONSENT_TEXTS.items,
      n.FORTUNE_CONSENT_TEXTS.blockedNotice,
      n.FORTUNE_CONSENT_TEXTS.storageNotice,
      n.FORTUNE_CONSENT_TEXTS.grantButton,
      n.FORTUNE_CONSENT_TEXTS.declineButton,
    ]) {
      expect(hasText(consent, text), text).toBe(true);
    }
    expect(consent.h1).toEqual([FORTUNE_TODAY_SEO.heading]);

    await page
      .getByRole('button', { name: n.FORTUNE_CONSENT_TEXTS.declineButton })
      .click();
    await expect(
      page.getByRole('heading', { name: n.FORTUNE_DECLINED_TEXTS.title })
    ).toBeVisible();
    const declined = await snapshot(page, '이용 불가 화면', bucket);
    for (const text of [
      n.FORTUNE_DECLINED_TEXTS.body,
      n.FORTUNE_DECLINED_TEXTS.backButton,
    ]) {
      expect(hasText(declined, text), text).toBe(true);
    }
    // 이용 불가 화면에는 입력칸과 결과가 없다
    await expect(page.getByLabel('연도', { exact: true })).toHaveCount(0);

    expectCleanDom(bucket);
    expect(errors).toEqual([]);
  });

  test('AC-8, AC-9, AC-37: 입력 오류 문구(빈 값, 1919년, 2029년, 13월)와 지원 범위·합니다체가 화면에서 상수와 같다', async ({
    page,
  }) => {
    const errors = trackPageErrors(page);
    const bucket: NamedText[] = [];
    await page.goto(FORTUNE_ROUTES.today);
    await grantConsent(page);
    await expect(
      page.getByRole('heading', { name: '생년월일 입력' })
    ).toBeVisible();
    await snapshot(page, '입력 폼', bucket);

    const messages = n.FORTUNE_BIRTH_ERROR_MESSAGES;
    await page.getByRole('button', { name: '운세 보기', exact: true }).click();
    await expect(page.getByText(messages.empty, { exact: true })).toBeVisible();
    await snapshot(page, '오류 empty', bucket);

    await submitBirth(
      page,
      { year: '1919', month: '12', day: '31' },
      '운세 보기'
    );
    await expect(
      page.getByText(messages['before-min'], { exact: true })
    ).toBeVisible();
    await snapshot(page, '오류 before-min', bucket);

    await submitBirth(
      page,
      { year: '2029', month: '1', day: '1' },
      '운세 보기'
    );
    await expect(
      page.getByText(messages['after-max'], { exact: true })
    ).toBeVisible();
    await snapshot(page, '오류 after-max', bucket);

    await submitBirth(
      page,
      { year: '1990', month: '13', day: '1' },
      '운세 보기'
    );
    await expect(
      page.getByText(messages['invalid-date'], { exact: true })
    ).toBeVisible();
    await snapshot(page, '오류 invalid-date', bucket);

    expectCleanDom(bucket);
    expect(errors).toEqual([]);
  });

  test('AC-85, AC-37: 음력 2023년 2월에는 윤달 안내가 보이고 3월에는 안내가 사라지며 윤달 칸이 비활성이다', async ({
    page,
  }) => {
    const errors = trackPageErrors(page);
    const bucket: NamedText[] = [];
    await page.goto(FORTUNE_ROUTES.today);
    await grantConsent(page);
    await expect(
      page.getByRole('heading', { name: '생년월일 입력' })
    ).toBeVisible();

    await page.getByText('음력', { exact: true }).click();
    await page.getByLabel('연도', { exact: true }).fill('2023');
    await page.getByLabel('월', { exact: true }).fill('2');
    const hint = n.FORTUNE_LEAP_MONTH_HINT_TEMPLATE.replace(
      '{연도}',
      '2023'
    ).replace('{월}', '2');
    await expect(page.getByText(hint, { exact: true })).toBeVisible();
    await expect(page.getByLabel('윤달', { exact: true })).toBeEnabled();
    await snapshot(page, '윤달 안내', bucket);

    await page.getByLabel('월', { exact: true }).fill('3');
    await expect(page.getByText(hint, { exact: true })).toHaveCount(0);
    await expect(page.getByLabel('윤달', { exact: true })).toBeDisabled();

    expectCleanDom(bucket);
    expect(errors).toEqual([]);
  });

  test('AC-73, AC-37: 만 14세 미만 연령 안내 화면 문구가 상수와 같고 금지 표현이 없다', async ({
    page,
  }) => {
    const errors = trackPageErrors(page);
    const bucket: NamedText[] = [];
    await page.goto(FORTUNE_ROUTES.today);
    await grantConsent(page);
    await expect(
      page.getByRole('heading', { name: '생년월일 입력' })
    ).toBeVisible();
    const youngYear = String(new Date().getFullYear() - 5);
    await submitBirth(
      page,
      { year: youngYear, month: '6', day: '15' },
      '운세 보기'
    );
    await expect(
      page.getByRole('heading', { name: n.FORTUNE_AGE_BLOCKED_TEXTS.title })
    ).toBeVisible();
    const blocked = await snapshot(page, '연령 안내 화면', bucket);
    expect(hasText(blocked, n.FORTUNE_AGE_BLOCKED_TEXTS.body)).toBe(true);
    expect(hasText(blocked, n.FORTUNE_AGE_BLOCKED_TEXTS.homeLinkLabel)).toBe(
      true
    );
    // 입력한 연도는 화면에 다시 보이지 않는다
    expect(blocked.blocks.filter((b) => b.text.includes(youngYear))).toEqual(
      []
    );

    expectCleanDom(bucket);
    expect(errors).toEqual([]);
  });
});

const CATEGORY_LABELS: Record<string, string> = {
  total: '총운',
  money: '재물',
  love: '애정',
  work: '직장',
  health: '건강',
};

/** 풀 한 개의 모든 문장 */
function poolTexts(pool: object, categories?: string[]): string[] {
  return Object.entries(pool)
    .filter(([category]) => !categories || categories.includes(category))
    .flatMap(([, bands]) =>
      Object.values(bands as Record<string, readonly string[]>).flat()
    );
}

test.describe('화면 DOM: 결과 화면 (오늘의 운세, 12띠, 12별자리)', () => {
  test.describe.configure({ timeout: 180_000 });

  test('AC-10, AC-37, AC-38: 오늘의 운세 결과 화면의 문구는 풀의 문장이고 "사주"는 방식 A 안내에만 있다', async ({
    page,
  }) => {
    const errors = trackPageErrors(page);
    const bucket: NamedText[] = [];
    await page.goto(FORTUNE_ROUTES.today);
    await grantConsent(page);
    await expect(
      page.getByRole('heading', { name: '생년월일 입력' })
    ).toBeVisible();
    await submitBirth(
      page,
      { year: '1990', month: '5', day: '15' },
      '운세 보기'
    );
    await expect(
      page.getByRole('heading', { name: '오늘의 결과' })
    ).toBeVisible();
    const result = await snapshot(page, '오늘의 운세 결과', bucket);

    expect(hasText(result, n.FORTUNE_METHOD_A_NOTICE)).toBe(true);
    expect(hasText(result, n.FORTUNE_SCORE_NOTICE)).toBe(true);
    expect(hasText(result, n.FORTUNE_LOTTO_NOTICE)).toBe(true);
    expect(hasText(result, n.FORTUNE_LOTTO_LINK_LABEL)).toBe(true);
    // 결과 문장은 개인 풀(항목 5)과 공통 풀(조언·주의)에서 왔다
    for (const category of Object.keys(FORTUNE_PERSONAL_POOL)) {
      const candidates = poolTexts(FORTUNE_PERSONAL_POOL, [category]);
      expect(
        result.blocks.some((b) => candidates.some((c) => b.text.includes(c))),
        `개인 풀 ${CATEGORY_LABELS[category]} 문장이 화면에 있다`
      ).toBe(true);
    }
    for (const category of ['advice', 'caution']) {
      const candidates = poolTexts(FORTUNE_COMMON_POOL, [category]);
      expect(
        result.blocks.some((b) => candidates.some((c) => b.text.includes(c))),
        `공통 풀 ${category} 문장이 화면에 있다`
      ).toBe(true);
    }

    expectCleanDom(bucket);
    expect(errors).toEqual([]);
  });

  test('AC-10, AC-37, AC-38: 띠별 운세 12띠 목록과 펼친 쥐띠 결과의 문구가 풀의 문장이고 "사주"는 방식 A 안내에만 있다', async ({
    page,
  }) => {
    const errors = trackPageErrors(page);
    const bucket: NamedText[] = [];
    await page.goto(FORTUNE_ROUTES.tti);
    await grantConsent(page);
    await expect(
      page.getByRole('heading', { name: '띠 고르기' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: '12띠 오늘의 운세' })
    ).toBeVisible();
    const list = await snapshot(page, '띠 목록', bucket);
    for (const zodiac of FORTUNE_ZODIAC) {
      const health = poolTexts(FORTUNE_TTI_POOLS[zodiac.key], ['health']);
      expect(
        list.blocks.some((b) => health.some((c) => b.text.includes(c))),
        `${zodiac.name} 건강 문장이 목록에 있다`
      ).toBe(true);
    }

    await page.getByRole('button', { name: '쥐띠', exact: true }).click();
    await expect(
      page.getByText(n.FORTUNE_LOTTO_NOTICE, { exact: true })
    ).toBeVisible();
    const opened = await snapshot(page, '쥐띠 펼침', bucket);
    expect(hasText(opened, n.FORTUNE_METHOD_A_TTI_NOTICE)).toBe(true);
    expect(hasText(opened, n.FORTUNE_DIFFERENT_BASIS_NOTICE)).toBe(true);
    const ratTotals = poolTexts(FORTUNE_TTI_POOLS.rat, ['total']);
    expect(
      opened.blocks.some((b) => ratTotals.some((c) => b.text.includes(c)))
    ).toBe(true);

    expectCleanDom(bucket);
    expect(errors).toEqual([]);
  });

  test('AC-10, AC-37, AC-38: 별자리 운세 12별자리 목록과 펼친 양자리 결과의 문구가 풀의 문장이고 "사주"는 방식 A 안내에만 있다', async ({
    page,
  }) => {
    const errors = trackPageErrors(page);
    const bucket: NamedText[] = [];
    await page.goto(FORTUNE_ROUTES.starSign);
    await grantConsent(page);
    await expect(
      page.getByRole('heading', { name: '별자리 고르기' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: '12별자리 오늘의 운세' })
    ).toBeVisible();
    const list = await snapshot(page, '별자리 목록', bucket);
    for (const sign of FORTUNE_STAR_SIGNS) {
      const health = poolTexts(FORTUNE_STAR_SIGN_POOLS[sign.key], ['health']);
      expect(
        list.blocks.some((b) => health.some((c) => b.text.includes(c))),
        `${sign.name} 건강 문장이 목록에 있다`
      ).toBe(true);
    }

    await page.getByRole('button', { name: /^양자리/ }).click();
    await expect(
      page.getByText(n.FORTUNE_LOTTO_NOTICE, { exact: true })
    ).toBeVisible();
    const opened = await snapshot(page, '양자리 펼침', bucket);
    expect(hasText(opened, n.FORTUNE_METHOD_A_STAR_SIGN_NOTICE)).toBe(true);
    expect(hasText(opened, n.FORTUNE_DIFFERENT_BASIS_STAR_SIGN_NOTICE)).toBe(
      true
    );

    expectCleanDom(bucket);
    expect(errors).toEqual([]);
  });
});
