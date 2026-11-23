import { describe, expect, it } from 'vitest';
import * as crisisPhoneConstants from '@/constants/crisis-phone.constant';
import { MENU_LIST } from '@/constants/menu.constant';
import { TAROT_CARDS } from '@/features/tarot/constants/tarot-cards.constant';
import {
  TAROT_COPY_ALLOWED_SENTENCES,
  TAROT_FORBIDDEN_PATTERNS,
  TAROT_FORBIDDEN_TERMS,
  TAROT_STORY_ENDING_PATTERN,
} from '@/features/tarot/constants/tarot-copy-rule.constant';
import {
  TAROT_DAILY_FAQ,
  TAROT_THREE_CARD_FAQ,
} from '@/features/tarot/constants/tarot-faq.constant';
import * as noticeConstants from '@/features/tarot/constants/tarot-notice.constant';
import * as questionConstants from '@/features/tarot/constants/tarot-question.constant';
import * as seoConstants from '@/features/tarot/constants/tarot-seo.constant';
import * as spreadConstants from '@/features/tarot/constants/tarot-spread.constant';
import { TAROT_STORY_SETS } from '@/features/tarot/constants/tarot-story.constant';
import * as topicConstants from '@/features/tarot/constants/tarot-topic.constant';
import { TAROT_TOPIC_READINGS } from '@/features/tarot/constants/tarot-topic-reading.constant';
import type {
  TarotSpreadPositionKeyType,
  TarotSuitGroupType,
  TarotTopicKeyType,
  TarotTopicSelectionType,
} from '@/features/tarot/types/tarot.type';
import {
  checkHabnidaStyle,
  collectTexts,
  findForbidden,
  type NamedTextType,
  splitSentences,
  stripAllowed,
} from '../helpers/copy-check.util';
import { readSourceFiles } from '../helpers/source-scan.util';

const RULE = {
  forbiddenTerms: TAROT_FORBIDDEN_TERMS,
  forbiddenPatterns: TAROT_FORBIDDEN_PATTERNS,
  allowedSentences: TAROT_COPY_ALLOWED_SENTENCES,
};

/** 투자·재산 증식·복권·도박·로또 표현 */
const FORBIDDEN_TOPIC_WORDS =
  /주식|코인|비트코인|가상화폐|투자|매수|매도|종목|재산 증식|복권|로또|도박|베팅|배팅|선물|당첨/;

const SUIT_GROUPS: readonly TarotSuitGroupType[] = [
  'major',
  'wands',
  'cups',
  'swords',
  'pentacles',
];
const TOPIC_KEYS: readonly TarotTopicKeyType[] = [
  'love',
  'career',
  'money',
  'daily',
];
const STORY_TOPICS: readonly TarotTopicSelectionType[] = ['all', ...TOPIC_KEYS];
const POSITIONS: readonly TarotSpreadPositionKeyType[] = [
  'past',
  'present',
  'future',
];
const POSITION_WORD: Record<TarotSpreadPositionKeyType, string> = {
  past: '과거',
  present: '현재',
  future: '미래',
};
const ORIENTATIONS = ['upright', 'reversed'] as const;
const TONES = ['upright', 'mixed', 'reversed'] as const;

type StoryCellType = NamedTextType & {
  kind: 'position' | 'closing';
  position?: TarotSpreadPositionKeyType;
};

/** 가이드 본문(GUIDE_PARAGRAPHS)은 export가 없어 소스의 문자열 리터럴을 읽는다 */
function readGuideParagraphs(pathSuffix: string): string[] {
  const file = readSourceFiles(['.tsx']).find((f) =>
    f.path.endsWith(pathSuffix)
  );
  if (!file) return [];
  const block =
    /GUIDE_PARAGRAPHS: readonly string\[\] = \[([\s\S]*?)\n\];/.exec(
      file.content
    );
  if (!block) return [];
  return [...block[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((m) =>
    m[1].replaceAll("\\'", "'")
  );
}

const DAILY_GUIDE = readGuideParagraphs(
  'tarot/daily/components/guide.component.tsx'
);
const THREE_GUIDE = readGuideParagraphs(
  'tarot/three-card/components/guide.component.tsx'
);

const tarotMenuGroup = MENU_LIST.find((group) => group.group === 'tarot');

const CARD_TEXTS = collectTexts(
  TAROT_CARDS.map((card): [string, unknown] => [
    `카드 ${card.id} ${card.nameKo}`,
    {
      nameKo: card.nameKo,
      nameEn: card.nameEn,
      upright: card.upright,
      reversed: card.reversed,
      note: card.note ?? '',
    },
  ])
);

const OTHER_TEXTS = collectTexts([
  ['분야 상수', { ...topicConstants }],
  ['분야 해석 문장 40', TAROT_TOPIC_READINGS],
  ['흐름 이야기 문장 45', TAROT_STORY_SETS],
  ['가이드 1장', DAILY_GUIDE],
  ['가이드 3장', THREE_GUIDE],
  ['FAQ 오늘의 타로', TAROT_DAILY_FAQ],
  ['FAQ 3장 타로', TAROT_THREE_CARD_FAQ],
  ['고지 문구', { ...noticeConstants }],
  ['상담전화 공용 상수', { ...crisisPhoneConstants }],
  ['질문·분야 문구', { ...questionConstants }],
  ['위치 안내', { ...spreadConstants }],
  ['SEO 상수', { ...seoConstants }],
  ['메뉴 타로 그룹', tarotMenuGroup ?? {}],
]);

const TOPIC_CELLS: NamedTextType[] = SUIT_GROUPS.flatMap((group) =>
  TOPIC_KEYS.flatMap((topic) =>
    ORIENTATIONS.map((orientation) => ({
      where: `분야 문장 ${group}/${topic}/${orientation}`,
      text: TAROT_TOPIC_READINGS[group]?.[topic]?.[orientation] ?? '',
    }))
  )
);

const STORY_CELLS: StoryCellType[] = STORY_TOPICS.flatMap((topic) => [
  ...POSITIONS.flatMap((position) =>
    ORIENTATIONS.map(
      (orientation): StoryCellType => ({
        where: `이야기 ${topic}/${position}/${orientation}`,
        text:
          TAROT_STORY_SETS[topic]?.positions?.[position]?.[orientation] ?? '',
        kind: 'position',
        position,
      })
    )
  ),
  ...TONES.map(
    (tone): StoryCellType => ({
      where: `이야기 ${topic}/closing/${tone}`,
      text: TAROT_STORY_SETS[topic]?.closing?.[tone] ?? '',
      kind: 'closing',
    })
  ),
]);

function violationsOf(items: readonly NamedTextType[]): string[] {
  return items.flatMap((item) => findForbidden(item, RULE));
}

describe('문구 데이터: 카드 78장·FAQ·고지·분야 예시·위치 안내·메뉴·SEO', () => {
  it('검사 대상이 모두 있다', () => {
    expect(TAROT_CARDS).toHaveLength(78);
    expect(tarotMenuGroup?.items.map((i) => i.label)).toEqual([
      '오늘의 타로',
      '3장 타로 (과거·현재·미래)',
    ]);
    expect(CARD_TEXTS.length).toBeGreaterThan(78 * 8);
    expect(TAROT_COPY_ALLOWED_SENTENCES.length).toBeGreaterThan(0);
    expect(DAILY_GUIDE.length).toBeGreaterThan(0);
    expect(THREE_GUIDE.length).toBeGreaterThan(0);
  });

  it('AC-19: 카드 78장 전 필드에 금지 표현이 없다', () => {
    const violations = violationsOf(CARD_TEXTS);
    expect(violations, violations.join('\n')).toEqual([]);
  });

  it('AC-19: FAQ·고지·분야 예시·위치 안내·SEO·메뉴에 금지 표현이 없다 (예외는 면책 허용 문장뿐)', () => {
    const violations = violationsOf(OTHER_TEXTS);
    expect(violations, violations.join('\n')).toEqual([]);
  });

  it('AC-19, v2 AC-22: 허용 예외 문장은 부정 고지 3개(결과 면책, 이용 안내 2항, 이야기 안내)뿐이다', () => {
    expect([...TAROT_COPY_ALLOWED_SENTENCES]).toEqual([
      '타로는 오락과 자기 성찰을 위한 콘텐츠이며, 결과는 미래를 예측하거나 보장하지 않습니다. 건강·법률·투자 등 중요한 결정은 전문가와 상담하시기 바랍니다.',
      '타로 결과는 과학적으로 입증된 것이 아니며, 미래나 결과를 예측하거나 보장하지 않습니다.',
      '이야기는 세 장의 카드 의미를 이어 쓴 참고용 문장입니다. 미래를 예측하거나 보장하지 않습니다.',
    ]);
    for (const sentence of TAROT_COPY_ALLOWED_SENTENCES) {
      expect(sentence).toMatch(/보장하지 않습니다/);
    }
    // 예외 문장을 지운 뒤에는 어디에도 "보장"이 남지 않는다
    const remaining = [...CARD_TEXTS, ...OTHER_TEXTS].filter((item) =>
      stripAllowed(item.text, TAROT_COPY_ALLOWED_SENTENCES).includes('보장')
    );
    expect(remaining.map((r) => `${r.where}: ${r.text}`)).toEqual([]);
  });

  it('AC-28, AC-19: 상담전화 5개 설명 구절과 안내 문장이 검사 대상에 들어 있고 금지 표현이 없다', () => {
    const mustInclude = [
      '자살 생각과 위기 상황 상담',
      '우울·불안 등 정신건강 위기 상담',
      '삶의 고민과 마음의 어려움 상담',
      '청소년의 고민과 위기 상담',
      '가정폭력·성폭력 등 폭력 피해 상담',
      '세 곳 모두 24시간 운영합니다.',
      '모두 24시간 운영합니다.',
    ];
    for (const phrase of mustInclude) {
      const hits = OTHER_TEXTS.filter((item) => item.text.includes(phrase));
      expect(hits.length, `검사 대상에 "${phrase}"가 없다`).toBeGreaterThan(0);
      expect(violationsOf(hits)).toEqual([]);
    }
    const texts = OTHER_TEXTS.map((item) => item.text);
    for (const number of ['109', '1577-0199', '1588-9191', '1388', '1366']) {
      expect(texts, `번호 ${number}`).toContain(number);
    }
    const promises = OTHER_TEXTS.filter(
      (item) =>
        /TAROT_CRISIS|CRISIS_PHONES|CRISIS_RESULT_LINE/.test(item.where) &&
        /도와 드립니다|해결해 드립니다/.test(item.text)
    );
    expect(promises.map((p) => `${p.where}: ${p.text}`)).toEqual([]);
  });

  it('D4: 카드·FAQ·고지·분야 예시·위치 안내·SEO·메뉴 문장에 해요체 종결이 없다', () => {
    const card = checkHabnidaStyle(CARD_TEXTS);
    const other = checkHabnidaStyle(OTHER_TEXTS);
    const hard = [...card.hard, ...other.hard];
    expect(hard, hard.join('\n')).toEqual([]);
    const question = [...card.questionHaeyo, ...other.questionHaeyo];
    expect(question, question.join('\n')).toEqual([]);
  });

  it('AC-9: 위치 3개 모두 안내 문장이 있다', () => {
    const positions = spreadConstants.TAROT_SPREAD_POSITIONS;
    expect(positions.map((p) => p.label)).toEqual(['과거', '현재', '미래']);
    for (const position of positions) {
      expect(position.guide.trim().length).toBeGreaterThan(10);
    }
  });

  it('v2 AC-3·AC-12: 분야 칩 5개(전체 기본)이고 질문 예시·옛 분야 상수가 없으며 플레이스홀더에 투자·복권·도박·로또가 없다', () => {
    expect(topicConstants.TAROT_TOPICS.map((t) => t.label)).toEqual([
      '전체',
      '연애·인간관계',
      '직업·학업',
      '재물·생활',
      '일상 조언',
    ]);
    expect(topicConstants.TAROT_TOPICS.map((t) => t.key)).toEqual([
      'all',
      'love',
      'career',
      'money',
      'daily',
    ]);
    expect(topicConstants.TAROT_TOPIC_DEFAULT).toBe('all');
    expect(topicConstants.TAROT_TOPIC_GROUP_LABEL).toBe('분야');
    expect(Object.keys(questionConstants)).not.toContain(
      'TAROT_QUESTION_TOPICS'
    );
    expect(JSON.stringify(questionConstants)).not.toContain('examples');
    for (const placeholder of [
      questionConstants.TAROT_QUESTION_PLACEHOLDER_DAILY,
      questionConstants.TAROT_QUESTION_PLACEHOLDER_THREE_CARD,
    ]) {
      expect(placeholder).not.toMatch(FORBIDDEN_TOPIC_WORDS);
    }
  });

  it('FAQ: 페이지마다 3개 이상이고 질문은 "~입니까?" 형태이며 답변이 비어 있지 않다', () => {
    for (const faq of [TAROT_DAILY_FAQ, TAROT_THREE_CARD_FAQ]) {
      expect(faq.length).toBeGreaterThanOrEqual(3);
      for (const item of faq) {
        expect(item.question.trim()).toMatch(/\?$/);
        expect(item.question).not.toMatch(/인가요\?$|나요\?$|까요\?$/);
        expect(item.answer.trim().length).toBeGreaterThan(30);
      }
    }
  });

  it('AC-32(문구): 두 페이지 title·description에 핵심 검색어와 오락·참고용 고지가 있다', () => {
    const daily = seoConstants.TAROT_DAILY_SEO;
    const three = seoConstants.TAROT_THREE_CARD_SEO;
    expect(daily.title).toMatch(/오늘의 타로/);
    expect(three.title).toMatch(/3장 타로/);
    expect(three.title).toMatch(/쓰리카드 타로/);
    expect(daily.description).toMatch(/오락·참고용/);
    expect(three.description).toMatch(/오락·참고용/);
    expect(three.description).toMatch(/3장 타로|과거·현재·미래/);
    expect(three.keywords).toContain('쓰리카드 타로');
  });
});

describe('tarot-v2 문구: 금지 표현과 새 상수', () => {
  it('v2 AC-22: 새 고지 문구·분야 문장 40·이야기 45·SEO·FAQ·가이드에 금지 표현이 없다 (예외는 부정 고지 문장뿐)', () => {
    const targets = collectTexts([
      ['TAROT_TOPIC_NOTICE', topicConstants.TAROT_TOPIC_NOTICE],
      ['TAROT_TOPIC_APPLIED_NOTICE', topicConstants.TAROT_TOPIC_APPLIED_NOTICE],
      ['TAROT_TOPIC_CLEARED_NOTICE', topicConstants.TAROT_TOPIC_CLEARED_NOTICE],
      ['TAROT_TOPIC_LINE_PREFIX', topicConstants.TAROT_TOPIC_LINE_PREFIX],
      [
        'TAROT_QUESTION_USAGE_NOTICE',
        noticeConstants.TAROT_QUESTION_USAGE_NOTICE,
      ],
      ['TAROT_STORY_NOTICE', noticeConstants.TAROT_STORY_NOTICE],
      [
        'TAROT_REDRAW_RESULT_NOTICE',
        noticeConstants.TAROT_REDRAW_RESULT_NOTICE,
      ],
      ['TAROT_REDRAW_NOTICE', noticeConstants.TAROT_REDRAW_NOTICE],
      ['분야 문장 40', TOPIC_CELLS.map((c) => c.text)],
      ['이야기 45', STORY_CELLS.map((c) => c.text)],
      ['SEO', { ...seoConstants }],
      ['FAQ 1장', TAROT_DAILY_FAQ],
      ['FAQ 3장', TAROT_THREE_CARD_FAQ],
      ['가이드 1장', DAILY_GUIDE],
      ['가이드 3장', THREE_GUIDE],
    ]);
    const violations = violationsOf(targets);
    expect(violations, violations.join('\n')).toEqual([]);
  });

  it('v2 AC-22: 새 문구 전체에 투자·재산 증식·복권·도박·로또 표현이 없다', () => {
    const targets = [
      ...TOPIC_CELLS,
      ...STORY_CELLS,
      ...collectTexts([
        ['분야 상수', { ...topicConstants }],
        ['질문 상수', { ...questionConstants }],
        ['SEO', { ...seoConstants }],
        ['가이드 1장', DAILY_GUIDE],
        ['가이드 3장', THREE_GUIDE],
      ]),
    ];
    const hits = targets
      .filter((item) => FORBIDDEN_TOPIC_WORDS.test(item.text))
      .map((item) => `${item.where}: ${item.text}`);
    expect(hits, hits.join('\n')).toEqual([]);
  });
});

describe('tarot-v2 문구: 분야 해석 문장 40개', () => {
  it('v2 AC-5: 그룹 5 x 분야 4 x 방향 2 = 40칸이 빠짐없이 채워져 있다', () => {
    expect(TOPIC_CELLS).toHaveLength(40);
    expect(Object.keys(TAROT_TOPIC_READINGS).sort()).toEqual(
      [...SUIT_GROUPS].sort()
    );
    for (const group of SUIT_GROUPS) {
      expect(Object.keys(TAROT_TOPIC_READINGS[group]).sort()).toEqual(
        [...TOPIC_KEYS].sort()
      );
    }
    const empty = TOPIC_CELLS.filter((c) => c.text.trim() === '').map(
      (c) => c.where
    );
    expect(empty, `빈 칸: ${empty.join(', ')}`).toEqual([]);
  });

  it('v2 C-1: 40문장이 서로 모두 다르다', () => {
    const seen = new Map<string, string>();
    const dup: string[] = [];
    for (const cell of TOPIC_CELLS) {
      const before = seen.get(cell.text);
      if (before) dup.push(`${before} = ${cell.where}`);
      seen.set(cell.text, cell.where);
    }
    expect(dup, dup.join('\n')).toEqual([]);
  });

  it('v2 C-1: 칸마다 완결된 한 문장이고 합니다체이며 자리표시자·카드 이름·위치 이름이 없다', () => {
    const cardNames = TAROT_CARDS.map((c) => c.nameKo);
    const problems: string[] = [];
    for (const cell of TOPIC_CELLS) {
      if (splitSentences(cell.text).length !== 1) {
        problems.push(`${cell.where}: 한 문장이 아님 -> ${cell.text}`);
      }
      if (/[{}]/.test(cell.text)) problems.push(`${cell.where}: 자리표시자`);
      if (!/니다\.$/.test(cell.text)) {
        problems.push(`${cell.where}: 합니다체 종결 아님`);
      }
      for (const word of ['과거', '현재', '미래']) {
        if (cell.text.includes(word)) {
          problems.push(`${cell.where}: 위치 이름 "${word}"`);
        }
      }
      for (const name of cardNames) {
        // 한 글자 이름("힘", "탑", "별", "달")은 일반 단어와 겹치므로 "이름 카드" 꼴만 본다
        if (cell.text.includes(`${name} 카드`)) {
          problems.push(`${cell.where}: 카드 이름 "${name}"`);
        }
      }
    }
    expect(problems, problems.join('\n')).toEqual([]);
  });

  it('v2 C-1: 재물 분야 문장 10개는 생활 습관·소비 태도 범위다 (투자·재산 증식·복권·도박·로또 없음)', () => {
    const money = TOPIC_CELLS.filter((c) => c.where.includes('/money/'));
    expect(money).toHaveLength(10);
    const hits = money.filter((c) => FORBIDDEN_TOPIC_WORDS.test(c.text));
    expect(hits.map((c) => c.where)).toEqual([]);
  });
});

describe('tarot-v2 문구: 흐름 이야기 문장 45개', () => {
  it('v2 AC-11: 5세트 x (위치 틀 6 + 마무리 3) = 45칸이 빠짐없이 채워져 있다', () => {
    expect(STORY_CELLS).toHaveLength(45);
    expect(STORY_CELLS.filter((c) => c.kind === 'position')).toHaveLength(30);
    expect(STORY_CELLS.filter((c) => c.kind === 'closing')).toHaveLength(15);
    const empty = STORY_CELLS.filter((c) => c.text.trim() === '').map(
      (c) => c.where
    );
    expect(empty, `빈 칸: ${empty.join(', ')}`).toEqual([]);
  });

  it('v2 AC-11: 45문장 모두 "수 있습니다."로 끝나고 한 문장이다', () => {
    const bad = STORY_CELLS.filter(
      (c) =>
        !TAROT_STORY_ENDING_PATTERN.test(c.text) ||
        splitSentences(c.text).length !== 1
    ).map((c) => `${c.where}: ${c.text}`);
    expect(bad, bad.join('\n')).toEqual([]);
  });

  it('v2 C-2: 위치 틀은 {card} 1회 + " 카드", 해당 위치 단어 포함, {keyword}는 0~1회 작은따옴표와 조사 규칙을 지킨다', () => {
    const problems: string[] = [];
    for (const cell of STORY_CELLS.filter((c) => c.kind === 'position')) {
      const { text, where } = cell;
      const cardCount = text.split('{card}').length - 1;
      if (cardCount !== 1) problems.push(`${where}: {card} ${cardCount}회`);
      if (!text.includes('{card} 카드')) {
        problems.push(`${where}: {card} 뒤에 " 카드"가 없음`);
      }
      const keywordCount = text.split('{keyword}').length - 1;
      if (keywordCount > 1) {
        problems.push(`${where}: {keyword} ${keywordCount}회`);
      }
      if (
        keywordCount === 1 &&
        !/'\{keyword\}'(의|에서|에|쪽으로)/.test(text)
      ) {
        problems.push(`${where}: {keyword} 따옴표·조사 규칙 위반`);
      }
      const rest = text.replaceAll('{card}', '').replaceAll('{keyword}', '');
      if (/[{}]/.test(rest)) problems.push(`${where}: 알 수 없는 자리표시자`);
      const word = POSITION_WORD[cell.position as TarotSpreadPositionKeyType];
      if (!text.includes(word)) {
        problems.push(`${where}: 위치 단어 "${word}" 없음`);
      }
    }
    expect(problems, problems.join('\n')).toEqual([]);
  });

  it('v2 C-2: 마무리 문장에는 자리표시자가 없다', () => {
    const bad = STORY_CELLS.filter(
      (c) => c.kind === 'closing' && /[{}]/.test(c.text)
    ).map((c) => c.where);
    expect(bad).toEqual([]);
  });

  it('v2 AC-13: 45문장이 서로 모두 다르다 (분야 4세트와 전체 세트 사이 겹침 0)', () => {
    const owner = new Map<string, string>();
    const dup: string[] = [];
    for (const cell of STORY_CELLS) {
      const before = owner.get(cell.text);
      if (before) dup.push(`${before} = ${cell.where}`);
      owner.set(cell.text, cell.where);
    }
    expect(dup, dup.join('\n')).toEqual([]);
  });
});

describe('tarot-v2 문구: 검색·가이드·FAQ·메뉴', () => {
  it('v2 AC-16: 3장 h1·title·description·headerDescription에 "상담"이 없고 "고민을 정리"의 뜻이 있다', () => {
    const three = seoConstants.TAROT_THREE_CARD_SEO;
    for (const text of [
      three.heading,
      three.title,
      three.description,
      three.headerDescription,
    ]) {
      expect(text).not.toContain('상담');
    }
    expect(three.headerDescription).toMatch(/고민.*정리/);
    expect(three.heading).toBe('3장 타로 (과거·현재·미래)');
  });

  it('v2 C-3: 두 페이지의 SEO·가이드·FAQ에 "운세"가 없다', () => {
    const targets = collectTexts([
      ['SEO 1장', seoConstants.TAROT_DAILY_SEO],
      ['SEO 3장', seoConstants.TAROT_THREE_CARD_SEO],
      ['FAQ 1장', TAROT_DAILY_FAQ],
      ['FAQ 3장', TAROT_THREE_CARD_FAQ],
      ['가이드 1장', DAILY_GUIDE],
      ['가이드 3장', THREE_GUIDE],
    ]);
    const hits = targets.filter((t) => t.text.includes('운세'));
    expect(hits.map((h) => h.where)).toEqual([]);
  });

  it('v2 AC-2: 1장 목적 문구에 "가볍게 보는 오늘의 흐름"이 있다', () => {
    expect(seoConstants.TAROT_DAILY_SEO.headerDescription).toContain(
      '가볍게 보는 오늘의 흐름'
    );
  });

  it('v2 AC-26: 가이드가 페이지당 600자 이상이고 두 페이지 문단이 겹치지 않는다', () => {
    expect(DAILY_GUIDE.join('').length).toBeGreaterThanOrEqual(600);
    expect(THREE_GUIDE.join('').length).toBeGreaterThanOrEqual(600);
    expect(DAILY_GUIDE.filter((p) => THREE_GUIDE.includes(p))).toEqual([]);
    const dailySentences = new Set(DAILY_GUIDE.flatMap(splitSentences));
    const copied = THREE_GUIDE.flatMap(splitSentences).filter((sentence) =>
      dailySentences.has(sentence)
    );
    expect(copied).toEqual([]);
  });

  it('v2 AC-26: FAQ 필수 질문이 있고 질문은 "~입니까?"이며 두 페이지 답이 같지 않다', () => {
    const daily = TAROT_DAILY_FAQ.map((f) => f.question);
    const three = TAROT_THREE_CARD_FAQ.map((f) => f.question);
    for (const q of [
      '1장과 3장은 무엇이 다릅니까?',
      '분야를 고르면 해석이 달라집니까?',
      '질문을 적으면 해석에 반영됩니까?',
    ]) {
      expect(daily, '1장 FAQ').toContain(q);
      expect(three, '3장 FAQ').toContain(q);
    }
    expect(three).toContain('3장은 왜 다시 뽑을 수 있습니까?');
    expect(daily.some((q) => q.includes('왜 다시 뽑을 수 없습니까?'))).toBe(
      true
    );
    expect(daily.some((q) => q.endsWith('정확합니까?'))).toBe(true);
    for (const item of [...TAROT_DAILY_FAQ, ...TAROT_THREE_CARD_FAQ]) {
      expect(item.question).toMatch(/니까\?$/);
    }
    for (const d of TAROT_DAILY_FAQ) {
      const same = TAROT_THREE_CARD_FAQ.find((t) => t.answer === d.answer);
      expect(same?.question, `답 복사: ${d.question}`).toBeUndefined();
    }
  });

  it('v2 AC-17: 메뉴 타로 항목 이름이 유지되고 설명에 "운세"(두 항목)·"상담"(3장)이 없다', () => {
    const items = tarotMenuGroup?.items ?? [];
    expect(items.map((i) => i.label)).toEqual([
      '오늘의 타로',
      '3장 타로 (과거·현재·미래)',
    ]);
    for (const item of items) expect(item.description).not.toContain('운세');
    expect(items[1].description).not.toContain('상담');
  });
});
