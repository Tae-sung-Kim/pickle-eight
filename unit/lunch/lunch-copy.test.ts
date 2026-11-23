import { describe, expect, test } from 'vitest';
import { MENU_LIST } from '@/constants/menu.constant';
import { LUNCH_CATEGORIES } from '@/features/lunch/constants/lunch-category.constant';
import {
  LUNCH_COPY_ALLOWED_SENTENCES,
  LUNCH_FORBIDDEN_PATTERNS,
  LUNCH_FORBIDDEN_TERMS,
} from '@/features/lunch/constants/lunch-copy-rule.constant';
import { LUNCH_FAQ } from '@/features/lunch/constants/lunch-faq.constant';
import { LUNCH_LUCK_LINES } from '@/features/lunch/constants/lunch-luck.constant';
import { LUNCH_MENUS } from '@/features/lunch/constants/lunch-menu.constant';
import * as notice from '@/features/lunch/constants/lunch-notice.constant';
import { LUNCH_HUB_SEO } from '@/features/lunch/constants/lunch-seo.constant';

const LUCK_ENTRIES = Object.entries(LUNCH_LUCK_LINES);
const LUCK_ALL = LUCK_ENTRIES.flatMap(([, lines]) => [...lines]);
const MENU_NAMES = LUNCH_MENUS.map((m) => m.name);

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
    if (new RegExp(re.source, re.flags.replace(/[gy]/g, '')).test(body))
      out.push(`${label}: ${re}`);
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

describe('AC-5 f: 점심운 문구', () => {
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
    expect(found).toEqual([]);
  });

  test('AC-10: 점심운 24줄에 금지 표현이 없다', () => {
    const found = LUCK_ALL.flatMap((l) => violations(l, l));
    expect(found).toEqual([]);
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

    const near: string[] = [];
    const toks = masked.map((s) => s.split(/\s+/));
    for (let i = 0; i < toks.length; i++) {
      for (let j = i + 1; j < toks.length; j++) {
        if (toks[i].length !== toks[j].length) continue;
        const diff = toks[i].filter((t, k) => t !== toks[j][k]).length;
        if (diff <= 1) near.push(`${LUCK_ALL[i]} / ${LUCK_ALL[j]}`);
      }
    }
    expect(near).toEqual([]);
  });
});

describe('AC-5 f: 금지어·FAQ', () => {
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
    expect(found).toEqual([]);
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
    expect(found).toEqual([]);
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
    expect(dup).toEqual([]);
    for (const f of LUNCH_FAQ) {
      expect(f.answer.includes('보장'), `${f.question} "보장"`).toBe(false);
    }
  });
});
