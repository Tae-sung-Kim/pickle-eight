import { describe, expect, it } from 'vitest';
import { MENU_LIST } from '@/constants/menu.constant';
import { TAROT_CARDS } from '@/features/tarot/constants/tarot-cards.constant';
import { TAROT_TRADEMARK_TERMS } from '@/features/tarot/constants/tarot-copy-rule.constant';
import {
  TAROT_DAILY_FAQ,
  TAROT_THREE_CARD_FAQ,
} from '@/features/tarot/constants/tarot-faq.constant';
import * as notice from '@/features/tarot/constants/tarot-notice.constant';
import * as seo from '@/features/tarot/constants/tarot-seo.constant';
import { TAROT_STORY_SETS } from '@/features/tarot/constants/tarot-story.constant';
import { TAROT_TOPIC_READINGS } from '@/features/tarot/constants/tarot-topic-reading.constant';
import { collectTexts, type NamedTextType } from '../helpers/copy-check.util';
import {
  findTermsInSource,
  listSourcePaths,
} from '../helpers/source-scan.util';

const EXPECTED_TERMS = [
  'Rider-Waite',
  'Rider Waite',
  '라이더-웨이트',
  '라이더 웨이트',
  '웨이트',
] as const;

const TEXT_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.css',
  '.json',
  '.md',
  '.html',
  '.svg',
  '.txt',
  '.xml',
] as const;

function hasTrademark(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    EXPECTED_TERMS.some((term) => lower.includes(term.toLowerCase())) ||
    /rider/i.test(text)
  );
}

describe('타로 상표성 명칭', () => {
  it('AC-18: 카드·FAQ·고지·SEO·메뉴·분야·이야기 문구에 상표성 명칭(Rider-Waite 등)이 없다', () => {
    expect([...TAROT_TRADEMARK_TERMS]).toEqual([...EXPECTED_TERMS]);

    const tarotMenu = MENU_LIST.find((group) => group.group === 'tarot');
    expect(tarotMenu).toBeTruthy();

    const texts: NamedTextType[] = collectTexts([
      ['카드', TAROT_CARDS],
      ['FAQ 1장', TAROT_DAILY_FAQ],
      ['FAQ 3장', TAROT_THREE_CARD_FAQ],
      ['고지', { ...notice }],
      ['SEO', { ...seo }],
      ['메뉴 타로 그룹', tarotMenu ?? {}],
      ['분야 문장', TAROT_TOPIC_READINGS],
      ['이야기 문장', TAROT_STORY_SETS],
    ]);
    expect(texts.length).toBeGreaterThan(78 * 8);

    const hits = texts
      .filter((item) => hasTrademark(item.text))
      .map((item) => `${item.where}: ${item.text}`);
    expect(hits, hits.join('\n')).toEqual([]);
  });

  it('AC-18: src/와 public/ 소스에 Rider-Waite 계열 명칭이 없다 (검사 목록 파일·tarot-dev-guide.md 제외)', () => {
    const options = { ignoreCase: true, extensions: TEXT_EXTENSIONS };
    expect(listSourcePaths(TEXT_EXTENSIONS).length).toBeGreaterThan(100);

    const hits = [
      ...findTermsInSource(EXPECTED_TERMS, options),
      ...findTermsInSource(['rider'], options),
    ];
    expect(hits, hits.join('\n')).toEqual([]);
  });
});
