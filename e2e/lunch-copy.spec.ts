import { expect, test } from '@playwright/test';
import { MENU_LIST } from '@/constants/menu.constant';
import { LUNCH_CATEGORIES } from '@/features/lunch/constants/lunch-category.constant';
import {
  LUNCH_COPY_ALLOWED_SENTENCES,
  LUNCH_FORBIDDEN_PATTERNS,
  LUNCH_FORBIDDEN_TERMS,
} from '@/features/lunch/constants/lunch-copy-rule.constant';
import { LUNCH_FAQ } from '@/features/lunch/constants/lunch-faq.constant';
import { LUNCH_LUCK_LINES } from '@/features/lunch/constants/lunch-luck.constant';
import {
  LUNCH_MENU_COUNT,
  LUNCH_MENUS,
} from '@/features/lunch/constants/lunch-menu.constant';
import * as notice from '@/features/lunch/constants/lunch-notice.constant';
import { LUNCH_HUB_SEO } from '@/features/lunch/constants/lunch-seo.constant';

// 브라우저를 쓰지 않는 데이터 검사. 데스크톱 프로젝트에서만 돌린다.
test.beforeEach(({ browserName }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'desktop',
    `데이터 검사는 데스크톱에서만 실행한다 (${browserName})`
  );
});

const LUCK_ENTRIES = Object.entries(LUNCH_LUCK_LINES);
const LUCK_ALL = LUCK_ENTRIES.flatMap(([, lines]) => [...lines]);
const MENU_NAMES = LUNCH_MENUS.map((m) => m.name);

// 국물 경계 메뉴 (L2)
const EXPECTED_SOUP = new Set([
  '김치찌개',
  '된장찌개',
  '순대국',
  '설렁탕',
  '칼국수',
  '냉면',
  '짬뽕',
  '마라탕',
  '누룽지탕',
  '라멘',
  '우동',
  '어묵',
  '쌀국수',
  '샤브샤브',
  '똠얌꿍',
]);

const NOTICE_FIVE = [
  notice.LUNCH_DISCLAIMER_TEXT,
  notice.LUNCH_RANDOM_NOTICE_TEXT,
  notice.LUNCH_NO_REWARD_NOTICE_TEXT,
  notice.LUNCH_EXTERNAL_LINK_NOTICE_TEXT,
  notice.LUNCH_RESULT_NOTICE_TEXT,
];

function stripAllowed(text: string): string {
  let out = text;
  for (const s of LUNCH_COPY_ALLOWED_SENTENCES) out = out.split(s).join('');
  return out;
}

function violations(label: string, text: string): string[] {
  const body = stripAllowed(text);
  const out: string[] = [];
  for (const term of LUNCH_FORBIDDEN_TERMS) {
    if (body.includes(term)) out.push(`${label}: "${term}"`);
  }
  for (const re of LUNCH_FORBIDDEN_PATTERNS) {
    if (re.test(body)) out.push(`${label}: ${re}`);
  }
  return out;
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** notice 모듈에서 문자열 상수와 문자열 배열만 모은다 (함수 제외) */
function noticeStrings(): [string, string][] {
  const out: [string, string][] = [];
  for (const [key, value] of Object.entries(notice)) {
    if (typeof value === 'string') out.push([key, value]);
    else if (Array.isArray(value)) {
      for (const v of value) if (typeof v === 'string') out.push([key, v]);
    } else if (value && typeof value === 'object') {
      for (const v of Object.values(value)) {
        if (typeof v === 'string') out.push([key, v]);
      }
    }
  }
  return out;
}

test.describe('점심 메뉴 데이터', () => {
  test('AC-40: 메뉴 48개, 카테고리 6개 이상 6개씩, 이름·id 중복 없음, id 형식', () => {
    expect(LUNCH_MENU_COUNT).toBe(48);
    expect(LUNCH_MENUS).toHaveLength(48);

    const keys = new Set<string>(LUNCH_CATEGORIES.map((c) => c.key));
    expect(keys.size).toBe(6);
    for (const key of keys) {
      const n = LUNCH_MENUS.filter((m) => m.category === key).length;
      expect(n, `${key} 메뉴 수`).toBeGreaterThanOrEqual(6);
    }
    for (const m of LUNCH_MENUS) {
      expect(keys.has(m.category), `${m.id} 카테고리`).toBe(true);
      expect(m.id, `${m.id} 형식`).toMatch(/^[a-z]+(-[a-z]+)*$/);
      expect(m.id.length).toBeLessThanOrEqual(40);
    }
    expect(new Set(MENU_NAMES).size).toBe(48);
    expect(new Set(LUNCH_MENUS.map((m) => m.id)).size).toBe(48);
  });

  test('L2: 카테고리별 10/8/8/8/6/8, 국물 15개 건조 33개, 경계 메뉴 일치', () => {
    const count = (key: string) =>
      LUNCH_MENUS.filter((m) => m.category === key).length;
    expect(LUNCH_CATEGORIES.map((c) => count(c.key))).toEqual([
      10, 8, 8, 8, 6, 8,
    ]);
    const soup = LUNCH_MENUS.filter((m) => m.broth === 'soup');
    const dry = LUNCH_MENUS.filter((m) => m.broth === 'dry');
    expect(soup).toHaveLength(15);
    expect(dry).toHaveLength(33);
    expect(new Set(soup.map((m) => m.name))).toEqual(EXPECTED_SOUP);
    const byName = (n: string) => LUNCH_MENUS.find((m) => m.name === n)?.broth;
    expect(byName('냉면')).toBe('soup');
    expect(byName('백반')).toBe('dry');
    expect(byName('누룽지탕')).toBe('soup');
    expect(byName('소바')).toBe('dry');
    expect(byName('어묵')).toBe('soup');
  });
});

test.describe('점심운 문구', () => {
  test('AC-9: 카테고리마다 정확히 4줄, 합계 24줄, 중복 없음', () => {
    expect(LUCK_ENTRIES).toHaveLength(6);
    for (const [key, lines] of LUCK_ENTRIES) {
      expect(lines, key).toHaveLength(4);
    }
    expect(LUCK_ALL).toHaveLength(24);
    expect(new Set(LUCK_ALL).size).toBe(24);
    for (const line of LUCK_ALL) expect(line.trim()).not.toBe('');
  });

  test('점심운에 메뉴 이름·국물·맛 언급이 없다', () => {
    const tasteTerms = [
      '국물',
      '맛',
      '매콤',
      '얼큰',
      '칼칼',
      '달콤',
      '담백',
      '고소',
      '짭짤',
      '새콤',
      '바삭',
    ];
    const found: string[] = [];
    for (const line of LUCK_ALL) {
      for (const name of MENU_NAMES) {
        if (line.includes(name)) found.push(`메뉴 "${name}": ${line}`);
      }
      for (const t of tasteTerms) {
        if (line.includes(t)) found.push(`"${t}": ${line}`);
      }
    }
    expect(found, found.join('\n')).toEqual([]);
  });

  test('AC-10: 점심운 24줄에 금지 표현이 없다', () => {
    const found = LUCK_ALL.flatMap((l) => violations(l, l));
    expect(found, found.join('\n')).toEqual([]);
  });

  test('소재명(메뉴명)만 바꿔치기한 문장이 없다', () => {
    const maskName = (s: string) => {
      let out = s;
      for (const name of MENU_NAMES) out = out.split(name).join('◇');
      for (const c of LUNCH_CATEGORIES) out = out.split(c.label).join('◇');
      return out;
    };
    const masked = LUCK_ALL.map(maskName);
    expect(new Set(masked).size, '마스킹 뒤 중복').toBe(masked.length);

    // 같은 길이의 어절 열에서 어절 1개만 다른 쌍
    const near: string[] = [];
    const toks = masked.map((s) => s.split(/\s+/));
    for (let i = 0; i < toks.length; i++) {
      for (let j = i + 1; j < toks.length; j++) {
        if (toks[i].length !== toks[j].length) continue;
        const diff = toks[i].filter((t, k) => t !== toks[j][k]).length;
        if (diff <= 1) near.push(`${LUCK_ALL[i]} / ${LUCK_ALL[j]}`);
      }
    }
    expect(near, near.join('\n')).toEqual([]);
  });
});

test.describe('고지·금지어·FAQ', () => {
  test('고지 5문장이 허용 문장 목록과 정확히 같다', () => {
    expect(LUNCH_COPY_ALLOWED_SENTENCES).toHaveLength(5);
    expect(new Set(LUNCH_COPY_ALLOWED_SENTENCES)).toEqual(new Set(NOTICE_FIVE));
    expect(new Set(NOTICE_FIVE).size).toBe(5);
  });

  test('AC-29: 보상 없음 고지가 U5 승인 문구와 같다', () => {
    expect(notice.LUNCH_NO_REWARD_NOTICE_TEXT).toBe(
      '룰렛 결과는 금전, 상품, 포인트, 경품 등 어떤 보상과도 무관한 오락입니다.'
    );
  });

  test('AC-10~12: 고지·라벨·FAQ·SEO 문구에 금지 표현이 없다 (허용 문장 제외)', () => {
    const found: string[] = [];
    for (const [key, text] of noticeStrings()) {
      found.push(...violations(`notice.${key}`, text));
    }
    found.push(
      ...violations(
        'notice.announcement',
        notice.getLunchResultAnnouncement('메뉴', '카테고리')
      )
    );
    for (const f of LUNCH_FAQ) {
      found.push(...violations(`faq.q ${f.question}`, f.question));
      found.push(...violations(`faq.a ${f.question}`, f.answer));
    }
    found.push(...violations('seo.title', LUNCH_HUB_SEO.title));
    found.push(...violations('seo.description', LUNCH_HUB_SEO.description));
    found.push(...violations('seo.keywords', LUNCH_HUB_SEO.keywords.join(' ')));
    expect(found, found.join('\n')).toEqual([]);
  });

  test('AC-39: 메뉴 점심 항목 설명·예시에 금지 단어가 없고 색 토큰이 text-menu-lunch', () => {
    const group = MENU_LIST.find((g) => g.group === 'lunch');
    expect(group).toBeTruthy();
    const found: string[] = [];
    for (const item of group?.items ?? []) {
      const text = `${item.label} ${item.description ?? ''} ${item.example ?? ''}`;
      found.push(...violations(item.href, text));
      for (const w of ['가격', '혼밥', '별점', '후기', '조건에 맞게 추천']) {
        if (text.includes(w)) found.push(`${item.href}: ${w}`);
      }
      expect(item.colorClass).toBe('text-menu-lunch');
    }
    expect(found, found.join('\n')).toEqual([]);
  });

  test('외부 링크 안내와 FAQ 4번 답이 카카오·네이버·구글 3개를 말한다', () => {
    expect(notice.LUNCH_EXTERNAL_LINK_NOTICE_TEXT).toContain(
      '카카오·네이버·구글'
    );
    const answer = LUNCH_FAQ[3].answer;
    for (const w of ['카카오맵', '네이버지도', '구글 지도']) {
      expect(answer, w).toContain(w);
    }
    expect(answer).toContain('뽑힌 메뉴 이름만 전달');
  });

  test('FAQ 5개, 질문·답 중복 없음, 답끼리 같은 문장 없음', () => {
    expect(LUNCH_FAQ).toHaveLength(5);
    expect(new Set(LUNCH_FAQ.map((f) => f.question)).size).toBe(5);
    expect(new Set(LUNCH_FAQ.map((f) => f.answer)).size).toBe(5);
    const sentences = LUNCH_FAQ.flatMap((f) => splitSentences(f.answer));
    const dup = sentences.filter((s, i) => sentences.indexOf(s) !== i);
    expect(dup, dup.join('\n')).toEqual([]);
    for (const f of LUNCH_FAQ) {
      expect(f.answer.includes('보장'), `${f.question} "보장"`).toBe(false);
    }
  });
});
