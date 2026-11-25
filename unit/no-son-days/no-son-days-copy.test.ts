import { describe, expect, test } from 'vitest';
import { MENU_GROUP_NAME_ENUM, MENU_LIST } from '@/constants/menu.constant';
import { NO_SON_DAYS_FORBIDDEN_TERMS } from '@/features/no-son-days/constants/no-son-days-copy-rule.constant';
import { NO_SON_DAYS_GUIDE } from '@/features/no-son-days/constants/no-son-days-guide.constant';
import { NO_SON_DAYS_NOTICE } from '@/features/no-son-days/constants/no-son-days-notice.constant';
import { NO_SON_DAYS_SEO } from '@/features/no-son-days/constants/no-son-days-seo.constant';
import { NO_SON_DAYS_VIEW } from '@/features/no-son-days/constants/no-son-days-view.constant';
import { collectTexts } from '../helpers/copy-check.util';

// 고지의 부정 문장 허용
const ALLOWED_SENTENCES = ['어떤 결과도 보장하지 않습니다'];
// "복"이 단어 일부에 걸리는 오탐 허용 (docs/no-son-days/copy-log.md)
const BOK_COMPOUND_OK = /복(잡|사|원|구|수|습|귀|합)|(반|중|회|왕)복/;

function strip(text: string): string {
  let t = text;
  for (const s of ALLOWED_SENTENCES) t = t.split(s).join('');
  return t.replace(/[가-힣]*복[가-힣]*/g, (w) =>
    BOK_COMPOUND_OK.test(w) ? '' : w
  );
}

const menu = MENU_LIST.filter(
  (g) => g.group === MENU_GROUP_NAME_ENUM.NO_SON_DAYS
);

const texts = collectTexts([
  ['NOTICE', NO_SON_DAYS_NOTICE],
  ['GUIDE', NO_SON_DAYS_GUIDE],
  ['SEO', NO_SON_DAYS_SEO],
  ['VIEW', NO_SON_DAYS_VIEW],
  ['MENU', menu],
]);

describe('손 없는 날 문구 검사', () => {
  test('C-1: 검사 대상이 비어 있지 않다', () => {
    expect(menu).toHaveLength(1);
    expect(texts.length).toBeGreaterThan(20);
  });

  test('AC-9, C-1: 금지 표현이 없다', () => {
    const hits: string[] = [];
    for (const { where, text } of texts) {
      const t = strip(text);
      const squeezed = t.replace(/\s+/g, '');
      for (const term of NO_SON_DAYS_FORBIDDEN_TERMS) {
        if (t.includes(term) || squeezed.includes(term.replace(/\s+/g, ''))) {
          hits.push(`${where}: "${term}" -> ${text}`);
        }
      }
    }
    expect(hits, hits.join('\n')).toEqual([]);
  });

  test('AC-8: 상단 고지가 4요지를 담는다', () => {
    const top = NO_SON_DAYS_NOTICE.top;
    expect(top).toContain('민간 풍습');
    expect(top).toContain('검증');
    expect(top).toContain('보장하지 않습니다');
    expect(top).toContain('본인');
  });
});
