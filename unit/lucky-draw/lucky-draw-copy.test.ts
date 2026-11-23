import { describe, expect, it } from 'vitest';
import { MENU_GROUP_NAME_ENUM, MENU_LIST } from '@/constants/menu.constant';
import {
  LUCKY_DRAW_EXCEPTION_SENTENCES,
  LUCKY_DRAW_FORBIDDEN_STANDALONE_WORDS,
  LUCKY_DRAW_FORBIDDEN_WORDS,
  LUCKY_DRAW_RESTRICTED_WORDS,
} from '@/features/lucky-draw/constants/lucky-draw-copy-rule.constant';
import { LUCKY_DRAW_FAQ } from '@/features/lucky-draw/constants/lucky-draw-faq.constant';
import { LUCKY_DRAW_GUIDE } from '@/features/lucky-draw/constants/lucky-draw-guide.constant';
import * as notice from '@/features/lucky-draw/constants/lucky-draw-notice.constant';
import { LUCKY_DRAW_SEO } from '@/features/lucky-draw/constants/lucky-draw-seo.constant';

const KEYS = ['hub', 'ladder', 'roulette', 'lots'] as const;

const entries: [string, string][] = [];
for (const k of KEYS) {
  const s = LUCKY_DRAW_SEO[k];
  entries.push([`seo.${k}.title`, s.title]);
  entries.push([`seo.${k}.description`, s.description]);
  entries.push([`seo.${k}.heading`, s.heading]);
  entries.push([`seo.${k}.headerDescription`, s.headerDescription]);
  entries.push([`seo.${k}.ogImageAlt`, s.ogImageAlt]);
  entries.push([`seo.${k}.breadcrumbName`, s.breadcrumbName]);
  s.keywords.forEach((w, i) => {
    entries.push([`seo.${k}.keywords[${i}]`, w]);
  });
  LUCKY_DRAW_FAQ[k].forEach((f, i) => {
    entries.push([`faq.${k}[${i}].question`, f.question]);
    entries.push([`faq.${k}[${i}].answer`, f.answer]);
  });
  LUCKY_DRAW_GUIDE[k].steps.forEach((t, i) => {
    entries.push([`guide.${k}.steps[${i}]`, t]);
  });
  entries.push([`guide.${k}.paragraph`, LUCKY_DRAW_GUIDE[k].paragraph]);
}
for (const [name, v] of Object.entries(notice)) {
  if (typeof v === 'string') entries.push([`notice.${name}`, v]);
}

const STANDALONE_DON = /(?<![가-힣])돈(?:[이을를은는도과와의에]|(?![가-힣]))/;

function stripExceptions(text: string): string {
  let rest = text;
  for (const s of LUCKY_DRAW_EXCEPTION_SENTENCES) rest = rest.split(s).join('');
  return rest;
}

describe('운빨 뽑기 문구 금지어', () => {
  it.each(entries)('%s 에 금지어 없음', (_name, text) => {
    const rest = stripExceptions(text);
    for (const w of LUCKY_DRAW_FORBIDDEN_WORDS) {
      expect(rest, `금지어 "${w}"`).not.toContain(w);
    }
    expect(LUCKY_DRAW_FORBIDDEN_STANDALONE_WORDS).toEqual(['돈']);
    expect(rest, '단독 금지어 "돈"').not.toMatch(STANDALONE_DON);
  });

  it.each(entries)('%s 의 보장/보상은 예외 문장 안에서만', (_name, text) => {
    const rest = stripExceptions(text);
    for (const w of LUCKY_DRAW_RESTRICTED_WORDS) {
      expect(rest, `제한어 "${w}"`).not.toContain(w);
    }
  });
});

describe('돈 단어 단위 검사', () => {
  it.each(['돈까스', '돈가스', '돈부리', '불돈'])('%s 는 허용', (w) => {
    expect(STANDALONE_DON.test(`오늘은 ${w} 먹자`)).toBe(false);
  });
  it.each(['돈', '돈을 걸고', '돈이 없다', '내 돈.'])('%s 는 차단', (w) => {
    expect(STANDALONE_DON.test(w)).toBe(true);
  });
});

describe('예외 문장 목록', () => {
  it('금지어가 예외 문장 안에는 없다', () => {
    for (const s of LUCKY_DRAW_EXCEPTION_SENTENCES) {
      for (const w of LUCKY_DRAW_FORBIDDEN_WORDS) expect(s).not.toContain(w);
      expect(s).not.toMatch(STANDALONE_DON);
    }
  });
  it('보장·보상이 부정형이다', () => {
    for (const s of LUCKY_DRAW_EXCEPTION_SENTENCES) {
      if (s.includes('보장')) expect(s).toContain('보장하지 않습니다');
      if (s.includes('보상')) expect(s).toContain('보상과도 관련이 없습니다');
    }
  });
});

describe('개정 문구 (카드 방식, 결과 가리기 B안)', () => {
  const luckyGroup = MENU_LIST.find(
    (g) => g.group === MENU_GROUP_NAME_ENUM.LUCKY_DRAW
  );
  const lots = luckyGroup?.items.find((i) => i.label === '제비뽑기');

  it('메뉴 제비뽑기 설명·예시는 카드 방식', () => {
    expect(lots?.description).toContain('카드');
    expect(`${lots?.description}${lots?.example}`).not.toMatch(
      /순서|결과 가리기|결과 보기/
    );
    for (const w of LUCKY_DRAW_FORBIDDEN_WORDS) {
      expect(`${lots?.description}${lots?.example}`).not.toContain(w);
    }
  });

  it('돌림판 안내문에 메뉴 룰렛과 겹치는 단어가 없다 (확정 11)', () => {
    const all = [
      LUCKY_DRAW_SEO.roulette.title,
      LUCKY_DRAW_SEO.roulette.description,
      LUCKY_DRAW_SEO.roulette.headerDescription,
      ...LUCKY_DRAW_FAQ.roulette.map((f) => f.question + f.answer),
      ...LUCKY_DRAW_GUIDE.roulette.steps,
      LUCKY_DRAW_GUIDE.roulette.paragraph,
    ].join('|');
    expect(all).not.toContain('룰렛 돌리기');
    expect(all).not.toContain('메뉴');
  });
});
