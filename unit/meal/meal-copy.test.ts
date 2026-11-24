import { describe, expect, test } from 'vitest';
import { MENU_LIST } from '@/constants/menu.constant';
import { MEAL_LIST } from '@/features/meal/constants/meal.constant';
import { MEAL_CATEGORIES } from '@/features/meal/constants/meal-category.constant';
import {
  MEAL_ALLOWED_CATEGORY_LABELS,
  MEAL_ALLOWED_MENU_NAME_TERMS,
  MEAL_COPY_ALLOWED_SENTENCES,
  MEAL_FORBIDDEN_PATTERNS,
  MEAL_FORBIDDEN_TERMS,
} from '@/features/meal/constants/meal-copy-rule.constant';
import { MEAL_FAQ } from '@/features/meal/constants/meal-faq.constant';
import { MEAL_LUCK_LINES } from '@/features/meal/constants/meal-luck.constant';
import { MEAL_MENUS } from '@/features/meal/constants/meal-menu.constant';
import * as notice from '@/features/meal/constants/meal-notice.constant';
import { MEAL_HUB_SEO } from '@/features/meal/constants/meal-seo.constant';
import type { MealKeyType } from '@/features/meal/types/meal.type';

const MEALS: readonly MealKeyType[] = ['lunch', 'dinner', 'breakfast'];

const luckEntries = (meal: MealKeyType) =>
  Object.entries<readonly string[]>(MEAL_LUCK_LINES[meal]);
const luckAll = (meal: MealKeyType) =>
  luckEntries(meal).flatMap(([, lines]) => [...lines]);
const menuNames = (meal: MealKeyType) => MEAL_MENUS[meal].map((m) => m.name);

function stripAllowed(text: string): string {
  let out = text;
  for (const s of MEAL_COPY_ALLOWED_SENTENCES) out = out.split(s).join('');
  return out;
}

/** 카테고리 라벨 자리의 예외 라벨("야식")을 지운다. 라벨 외 문구에는 쓰지 않는다 */
function stripAllowedLabels(text: string): string {
  let out = text;
  for (const s of MEAL_ALLOWED_CATEGORY_LABELS) out = out.split(s).join('');
  return out;
}

function violations(label: string, text: string, allowLabel = false): string[] {
  const body = allowLabel
    ? stripAllowedLabels(stripAllowed(text))
    : stripAllowed(text);
  const out: string[] = [];
  for (const term of MEAL_FORBIDDEN_TERMS) {
    if (body.includes(term)) out.push(`${label}: "${term}"`);
  }
  for (const re of MEAL_FORBIDDEN_PATTERNS) {
    if (new RegExp(re.source, re.flags.replace(/[gy]/g, '')).test(body))
      out.push(`${label}: ${re}`);
  }
  return out;
}

/** 메뉴 이름 검사 전용: 허용 단어를 먼저 지운다 */
function stripAllowedMenuTerms(name: string): string {
  let out = name;
  for (const t of MEAL_ALLOWED_MENU_NAME_TERMS) out = out.split(t).join('');
  return out;
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** notice 모듈에서 문자열 상수와 문자열 배열·객체 값만 모은다 (함수 제외) */
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

describe('AC-12·13: 끼니별 운세 문구', () => {
  test('카테고리마다 4줄, 점심·아침 24줄, 저녁 28줄(전체 76줄), 끼니 안 중복 없음', () => {
    expect(MEALS.flatMap((m) => luckAll(m))).toHaveLength(76);
    for (const meal of MEALS) {
      const entries = luckEntries(meal);
      const total = MEAL_CATEGORIES[meal].length * 4;
      expect(total).toBe(meal === 'dinner' ? 28 : 24);
      expect(entries, meal).toHaveLength(MEAL_CATEGORIES[meal].length);
      expect(
        entries.map(([k]) => k),
        meal
      ).toEqual(MEAL_CATEGORIES[meal].map((c) => c.key));
      for (const [key, lines] of entries) {
        expect(lines, `${meal} ${key}`).toHaveLength(4);
      }
      const all = luckAll(meal);
      expect(all, meal).toHaveLength(total);
      expect(new Set(all).size, `${meal} 중복`).toBe(total);
      for (const line of all) expect(line.trim()).not.toBe('');
    }
  });

  test('운세 라벨이 끼니와 짝을 이룬다', () => {
    expect(MEAL_LIST.map((m) => [m.key, m.label, m.luckLabel])).toEqual([
      ['lunch', '점심', '오늘의 점심운'],
      ['dinner', '저녁', '오늘의 저녁운'],
      ['breakfast', '아침·브런치', '오늘의 아침운'],
    ]);
  });

  test('운세에 메뉴 이름·국물·맛 언급, 다른 끼니 이름이 없다', () => {
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
    const otherMealWords: Record<MealKeyType, string[]> = {
      lunch: ['저녁', '아침', '브런치'],
      dinner: ['점심', '아침', '브런치'],
      breakfast: ['점심', '저녁'],
    };
    const found: string[] = [];
    for (const meal of MEALS) {
      for (const line of luckAll(meal)) {
        for (const name of menuNames(meal)) {
          if (line.includes(name))
            found.push(`${meal} 메뉴 "${name}": ${line}`);
        }
        for (const t of tasteTerms) {
          if (line.includes(t)) found.push(`${meal} "${t}": ${line}`);
        }
        for (const w of otherMealWords[meal]) {
          if (line.includes(w)) found.push(`${meal} 다른 끼니 "${w}": ${line}`);
        }
      }
    }
    expect(found).toEqual([]);
  });

  test('AC-10: 운세 76줄에 금지 표현이 없다', () => {
    const found = MEALS.flatMap((meal) =>
      luckAll(meal).flatMap((l) => violations(`${meal} ${l}`, l))
    );
    expect(found).toEqual([]);
  });

  test('소재명(메뉴명·카테고리명)만 바꿔치기한 문장이 끼니 안에 없다', () => {
    for (const meal of MEALS) {
      const maskName = (s: string) => {
        let out = s;
        for (const name of menuNames(meal)) out = out.split(name).join('◇');
        for (const c of MEAL_CATEGORIES[meal]) {
          out = out.split(c.label).join('◇');
        }
        return out;
      };
      const all = luckAll(meal);
      const masked = all.map(maskName);
      expect(new Set(masked).size, `${meal} 마스킹 뒤 중복`).toBe(
        masked.length
      );

      const near: string[] = [];
      const toks = masked.map((s) => s.split(/\s+/));
      for (let i = 0; i < toks.length; i++) {
        for (let j = i + 1; j < toks.length; j++) {
          if (toks[i].length !== toks[j].length) continue;
          const diff = toks[i].filter((t, k) => t !== toks[j][k]).length;
          if (diff <= 1) near.push(`${all[i]} / ${all[j]}`);
        }
      }
      expect(near, meal).toEqual([]);
    }
  });
});

describe('AC-11·14·31: 금지어·FAQ', () => {
  test('고지·라벨·FAQ·SEO·끼니 라벨에 금지 표현(술 패턴 포함)이 없다', () => {
    const found: string[] = [];
    for (const [key, text] of noticeStrings()) {
      found.push(...violations(`notice.${key}`, text));
    }
    for (const meal of MEAL_LIST) {
      found.push(
        ...violations(
          `announce.${meal.key}`,
          notice.getMealResultAnnouncement('메뉴', '카테고리')
        ),
        ...violations(
          `announce.lateNight.${meal.key}`,
          notice.getMealResultAnnouncement('메뉴', '야식'),
          true
        ),
        ...violations(
          `change.${meal.key}`,
          notice.getMealChangeAnnouncement(meal.label)
        ),
        ...violations(`meal.${meal.key}`, `${meal.label} ${meal.luckLabel}`)
      );
    }
    for (const f of MEAL_FAQ) {
      found.push(...violations(`faq.q ${f.question}`, f.question));
      found.push(...violations(`faq.a ${f.question}`, f.answer));
    }
    for (const meal of MEALS) {
      for (const c of MEAL_CATEGORIES[meal]) {
        found.push(
          ...violations(
            `category.${meal}`,
            c.label,
            MEAL_ALLOWED_CATEGORY_LABELS.includes(c.label)
          )
        );
      }
      for (const name of menuNames(meal)) {
        found.push(...violations(`menu.${meal}`, stripAllowedMenuTerms(name)));
      }
    }
    found.push(...violations('seo.title', MEAL_HUB_SEO.title));
    found.push(...violations('seo.heading', MEAL_HUB_SEO.heading));
    found.push(...violations('seo.description', MEAL_HUB_SEO.description));
    found.push(...violations('seo.keywords', MEAL_HUB_SEO.keywords.join(' ')));
    expect(found).toEqual([]);
  });

  test('AC-11: "야식"은 카테고리 라벨에만 허용되고 그 밖의 어디에도 없다', () => {
    expect(MEAL_ALLOWED_CATEGORY_LABELS).toEqual(['야식']);
    // 예외 규칙 자체 검증: 라벨 자리는 통과, 다른 문구는 실패
    expect(violations('c', '야식', true)).toEqual([]);
    expect(violations('c', '야식')).not.toEqual([]);
    for (const w of ['오늘은 야식이 어울립니다', '술안주', '해장', '안주']) {
      expect(violations('t', w), w).not.toEqual([]);
    }
    // "해장"은 메뉴 이름에서만 허용, 그 밖의 문구에서는 계속 금지
    expect(MEAL_ALLOWED_MENU_NAME_TERMS).toEqual(['해장']);
    expect(violations('t', '해장국')).not.toEqual([]);
    expect(violations('m', stripAllowedMenuTerms('해장국'))).toEqual([]);
    expect(violations('m', stripAllowedMenuTerms('숙취 해장국'))).not.toEqual(
      []
    );
    const bad = ['야식', '술', '안주', '해장'];
    const found: string[] = [];
    const scan = (where: string, text: string, allowLabel = false) => {
      const body = allowLabel
        ? stripAllowedLabels(stripAllowed(text))
        : stripAllowed(text);
      for (const w of bad) if (body.includes(w)) found.push(`${where}: ${w}`);
    };
    for (const meal of MEALS) {
      for (const n of menuNames(meal))
        scan(`menu.${meal}`, stripAllowedMenuTerms(n));
      for (const l of luckAll(meal)) scan(`luck.${meal}`, l);
      for (const c of MEAL_CATEGORIES[meal])
        scan(`label.${meal}`, c.label, true);
    }
    for (const [k, t] of noticeStrings()) scan(`notice.${k}`, t);
    for (const f of MEAL_FAQ) scan('faq', `${f.question} ${f.answer}`);
    scan(
      'seo',
      [
        MEAL_HUB_SEO.title,
        MEAL_HUB_SEO.heading,
        MEAL_HUB_SEO.description,
        ...MEAL_HUB_SEO.keywords,
      ].join(' ')
    );
    scan('announce', notice.getMealResultAnnouncement('메뉴', '야식'), true);
    expect(found).toEqual([]);
  });

  test('금지어 목록에 AC-11 단어와 술 패턴이 들어 있다', () => {
    for (const w of ['안주', '한잔', '소주', '맥주', '해장', '숙취', '야식']) {
      expect(MEAL_FORBIDDEN_TERMS, w).toContain(w);
    }
    expect(MEAL_FORBIDDEN_TERMS).toContain('든든');
    expect(MEAL_FORBIDDEN_PATTERNS.some((re) => re.test('술자리'))).toBe(true);
    expect(MEAL_FORBIDDEN_PATTERNS.some((re) => re.test('기술'))).toBe(false);
  });

  test('AC-31: 메뉴 그룹 meal 항목 설명·예시에 금지 단어가 없고 색 토큰이 text-menu-meal', () => {
    const group = MENU_LIST.find((g) => g.group === 'meal');
    expect(group).toBeTruthy();
    expect(MENU_LIST.find((g) => g.group === 'lunch')).toBeUndefined();
    const found: string[] = [];
    for (const item of group?.items ?? []) {
      const text = `${item.label} ${item.description ?? ''} ${item.example ?? ''}`;
      found.push(...violations(item.href, text));
      for (const w of ['추천', '가격', '혼밥', '별점', '후기']) {
        if (text.includes(w)) found.push(`${item.href}: ${w}`);
      }
      expect(item.colorClass).toBe('text-menu-meal');
      expect(item.href).toBe('/meal');
    }
    expect(found).toEqual([]);
  });

  test('외부 링크 안내와 지도 FAQ 답이 카카오·네이버·구글 3개를 말한다', () => {
    expect(notice.MEAL_EXTERNAL_LINK_NOTICE_TEXT).toContain(
      '카카오·네이버·구글'
    );
    const answer = MEAL_FAQ.find((f) =>
      f.question.includes('지도 링크')
    )?.answer;
    expect(answer).toBeTruthy();
    for (const w of ['카카오맵', '네이버지도', '구글 지도']) {
      expect(answer, w).toContain(w);
    }
    expect(answer).toContain('뽑힌 메뉴 이름과');
    expect(answer).toContain('동네 이름');
  });

  test('AC-12: 금지어 목록에 위치 표현 5개가 들어 있다', () => {
    for (const w of ['주변', '근처', '현재 위치', '내 위치', 'GPS']) {
      expect(MEAL_FORBIDDEN_TERMS, w).toContain(w);
    }
  });

  test('AC-12: 동네 입력 문구가 금지 표현 검사를 통과한다', () => {
    const texts = [
      notice.MEAL_AREA_INPUT_LABEL,
      notice.MEAL_AREA_INPUT_PLACEHOLDER,
      notice.MEAL_AREA_CLEAR_BUTTON_LABEL,
      notice.MEAL_AREA_PREVIEW_LABEL,
      notice.MEAL_AREA_RESULT_NOTICE_TEXT,
      ...Object.values(notice.MEAL_AREA_ERROR_TEXT),
      ...notice.MEAL_AREA_NOTICE_LINES,
    ];
    const found = texts.flatMap((t) => violations(t, t));
    expect(found).toEqual([]);
  });

  test('FAQ 7개, 질문·답 중복 없음, 답끼리 같은 문장 없음, 보장 없음', () => {
    expect(MEAL_FAQ).toHaveLength(7);
    expect(new Set(MEAL_FAQ.map((f) => f.question)).size).toBe(7);
    expect(new Set(MEAL_FAQ.map((f) => f.answer)).size).toBe(7);
    const sentences = MEAL_FAQ.flatMap((f) => splitSentences(f.answer));
    const dup = sentences.filter((s, i) => sentences.indexOf(s) !== i);
    expect(dup).toEqual([]);
    for (const f of MEAL_FAQ) {
      expect(f.answer.includes('보장'), `${f.question} "보장"`).toBe(false);
    }
  });
});
