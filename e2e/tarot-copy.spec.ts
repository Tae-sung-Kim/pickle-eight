import fs from 'node:fs';
import path from 'node:path';
import { expect, type Page, test } from '@playwright/test';
import * as crisisPhoneConstants from '@/constants/crisis-phone.constant';
import { MENU_LIST } from '@/constants/menu.constant';
import { TAROT_CARDS } from '@/features/tarot/constants/tarot-cards.constant';
import {
  TAROT_COPY_ALLOWED_SENTENCES,
  TAROT_FORBIDDEN_PATTERNS,
  TAROT_FORBIDDEN_TERMS,
  TAROT_STORY_ENDING_PATTERN,
  TAROT_TRADEMARK_TERMS,
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
  TarotCardType,
  TarotSpreadPositionKeyType,
  TarotSuitGroupType,
  TarotTopicKeyType,
  TarotTopicSelectionType,
} from '@/features/tarot/types/tarot.type';
import {
  buildTarotThreeCardStory,
  getTarotStoryTone,
} from '@/features/tarot/utils/tarot-story.util';
import {
  getTarotSuitGroup,
  getTarotTopicReading,
} from '@/features/tarot/utils/tarot-topic.util';

const ROOT = process.cwd();
const RULE_FILE = path.join(
  'src',
  'features',
  'tarot',
  'constants',
  'tarot-copy-rule.constant.ts'
);
const DEV_GUIDE_FILE = path.join(
  'src',
  'features',
  'tarot',
  'tarot-dev-guide.md'
);

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

/** 허용 예외 문장을 먼저 지운다 */
function stripAllowed(text: string): string {
  let result = text;
  for (const sentence of TAROT_COPY_ALLOWED_SENTENCES) {
    result = result.split(sentence).join('');
  }
  return result;
}

/** 금지 표현·미래 확정 어미·상표성 명칭·Rider 계열 명칭 위반 목록 */
function findViolations(item: NamedText): string[] {
  const text = stripAllowed(item.text);
  const found: string[] = [];
  for (const term of TAROT_FORBIDDEN_TERMS) {
    if (text.includes(term)) found.push(`금지 표현 "${term}"`);
  }
  for (const pattern of TAROT_FORBIDDEN_PATTERNS) {
    if (pattern.test(text)) found.push(`금지 패턴 ${pattern}`);
  }
  const lower = text.toLowerCase();
  for (const term of TAROT_TRADEMARK_TERMS) {
    if (lower.includes(term.toLowerCase())) found.push(`상표 명칭 "${term}"`);
  }
  if (/rider/i.test(text)) found.push('Rider 계열 명칭');
  return found.map((reason) => `${item.where}: ${reason} -> ${item.text}`);
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

// 명백한 해요체 종결 (자동 실패)
const HARD_HAEYO =
  /(예요|에요|세요|네요|군요|죠|지요|인가요|할까요|일까요|나요|가요)$/;

type StyleReport = {
  hard: string[];
  /** 요로 끝나지만 명백하지 않은 문장 (후보, 자동 실패 아님) */
  haeyoCandidates: string[];
  /** 다 또는 까로 끝나지 않는 문장 (후보, 자동 실패 아님) */
  nonHabnidaCandidates: string[];
};

function checkStyle(items: NamedText[]): StyleReport {
  const report: StyleReport = {
    hard: [],
    haeyoCandidates: [],
    nonHabnidaCandidates: [],
  };
  for (const item of items) {
    for (const sentence of splitSentences(item.text)) {
      const ending = stripEnding(sentence);
      const line = `${item.where}: ${sentence}`;
      if (HARD_HAEYO.test(ending)) {
        report.hard.push(line);
      } else if (/요$/.test(ending)) {
        report.haeyoCandidates.push(line);
      } else if (!/(다|까)$/.test(ending)) {
        report.nonHabnidaCandidates.push(line);
      }
    }
  }
  return report;
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

const TEXT_EXT = new Set([
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
]);

function rel(file: string): string {
  return path.relative(ROOT, file);
}

// ---------- 검사 대상 문구 ----------

const tarotMenuGroup = MENU_LIST.find((group) => group.group === 'tarot');

const CARD_TEXTS: NamedText[] = collect(
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

/** 가이드 본문(GUIDE_PARAGRAPHS)은 export가 없어 소스의 문자열 리터럴을 읽는다 */
function readGuideParagraphs(file: string): string[] {
  const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const block =
    /GUIDE_PARAGRAPHS: readonly string\[\] = \[([\s\S]*?)\n\];/.exec(source);
  if (!block) return [];
  return [...block[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((m) =>
    m[1].replaceAll("\\'", "'")
  );
}

const DAILY_GUIDE = readGuideParagraphs(
  path.join(
    'src',
    'features',
    'tarot',
    'daily',
    'components',
    'guide.component.tsx'
  )
);
const THREE_GUIDE = readGuideParagraphs(
  path.join(
    'src',
    'features',
    'tarot',
    'three-card',
    'components',
    'guide.component.tsx'
  )
);

/** 투자·재산 증식·복권·도박·로또 표현 (재물 분야 문장 포함 새 문구 전체) */
const FORBIDDEN_TOPIC_WORDS =
  /주식|코인|비트코인|가상화폐|투자|매수|매도|종목|재산 증식|복권|로또|도박|베팅|배팅|선물|당첨/;

const OTHER_TEXTS: NamedText[] = collect([
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

// ---------- 문구 데이터 검사 (QA-2) ----------

test.describe('문구 데이터: 카드 78장·FAQ·고지·분야 예시·위치 안내·메뉴·SEO', () => {
  test('검사 대상이 모두 있다', () => {
    expect(TAROT_CARDS).toHaveLength(78);
    expect(tarotMenuGroup, '메뉴에 타로 그룹이 있어야 한다').toBeTruthy();
    expect(tarotMenuGroup?.items.map((i) => i.label)).toEqual([
      '오늘의 타로',
      '3장 타로 (과거·현재·미래)',
    ]);
    expect(CARD_TEXTS.length).toBeGreaterThan(78 * 8);
    expect(TAROT_COPY_ALLOWED_SENTENCES.length).toBeGreaterThan(0);
  });

  test('AC-19: 카드 78장 전 필드에 금지 표현이 없다', () => {
    const violations = CARD_TEXTS.flatMap(findViolations);
    expect(violations, violations.join('\n')).toEqual([]);
  });

  test('AC-19: FAQ·고지·분야 예시·위치 안내·SEO·메뉴에 금지 표현이 없다 (예외는 면책 허용 문장뿐)', () => {
    const violations = OTHER_TEXTS.flatMap(findViolations);
    expect(violations, violations.join('\n')).toEqual([]);
  });

  test('AC-19: 허용 예외 문장은 "보장하지 않습니다" 같은 부정 고지 문장뿐이다', () => {
    for (const sentence of TAROT_COPY_ALLOWED_SENTENCES) {
      expect(sentence).toMatch(/보장하지 않습니다/);
    }
    // 예외 문장을 지운 뒤에는 어디에도 "보장"이 남지 않는다
    const remaining = [...CARD_TEXTS, ...OTHER_TEXTS].filter((item) =>
      stripAllowed(item.text).includes('보장')
    );
    expect(remaining.map((r) => `${r.where}: ${r.text}`)).toEqual([]);
  });

  test('AC-28, AC-19: 상담전화 5개 설명 구절과 안내 문장이 검사 대상에 들어 있고 금지 표현이 없다', () => {
    const mustInclude = [
      '자살 생각과 위기 상황 상담',
      '우울·불안 등 정신건강 위기 상담',
      '삶의 고민과 마음의 어려움 상담',
      '청소년의 고민과 위기 상담',
      '가정폭력·성폭력 등 폭력 피해 상담',
      '세 곳 모두 24시간 운영합니다.',
      '모두 24시간 운영합니다.',
    ];
    const texts = OTHER_TEXTS.map((item) => item.text);
    for (const phrase of mustInclude) {
      const hits = OTHER_TEXTS.filter((item) => item.text.includes(phrase));
      expect(hits.length, `검사 대상에 "${phrase}"가 없다`).toBeGreaterThan(0);
      expect(hits.flatMap(findViolations)).toEqual([]);
    }
    // 번호 5개도 검사 대상(고지 문구)에 들어 있다
    for (const number of ['109', '1577-0199', '1588-9191', '1388', '1366']) {
      expect(texts, `번호 ${number}`).toContain(number);
    }
    // 효과·결과를 약속하는 표현은 쓰지 않는다 (design: 상담전화 문구)
    const promises = OTHER_TEXTS.filter(
      (item) =>
        /TAROT_CRISIS|CRISIS_PHONES|CRISIS_RESULT_LINE/.test(item.where) &&
        /도와 드립니다|해결해 드립니다/.test(item.text)
    );
    expect(promises.map((p) => `${p.where}: ${p.text}`)).toEqual([]);
  });

  test('AC-18: 카드·FAQ·고지·SEO·메뉴 문구에 상표성 명칭(Rider-Waite 등)이 없다', () => {
    const hits = [...CARD_TEXTS, ...OTHER_TEXTS].filter((item) => {
      const lower = item.text.toLowerCase();
      return (
        TAROT_TRADEMARK_TERMS.some((t) => lower.includes(t.toLowerCase())) ||
        /rider/i.test(item.text)
      );
    });
    expect(hits.map((h) => `${h.where}: ${h.text}`)).toEqual([]);
  });

  test('D4: 카드·FAQ·고지·분야 예시·위치 안내·SEO·메뉴 문장은 합니다체로 통일돼 있다', async () => {
    const testInfo = test.info();
    const cardReport = checkStyle(CARD_TEXTS);
    const otherReport = checkStyle(OTHER_TEXTS);

    const candidates = {
      haeyoCandidates: [
        ...cardReport.haeyoCandidates,
        ...otherReport.haeyoCandidates,
      ],
      nonHabnidaCandidates: [
        ...cardReport.nonHabnidaCandidates,
        ...otherReport.nonHabnidaCandidates,
      ],
    };
    await testInfo.attach('style-candidates.json', {
      body: JSON.stringify(candidates, null, 2),
      contentType: 'application/json',
    });
    console.log(
      `[tarot-copy] 해요체 후보 ${candidates.haeyoCandidates.length}건, 합니다체 아닌 종결 후보 ${candidates.nonHabnidaCandidates.length}건`
    );
    for (const line of [
      ...candidates.haeyoCandidates,
      ...candidates.nonHabnidaCandidates,
    ]) {
      console.log(`[tarot-copy][후보] ${line}`);
    }

    const hard = [...cardReport.hard, ...otherReport.hard];
    expect(hard, hard.join('\n')).toEqual([]);
  });

  test('AC-15: 78장 모두 이름, 정/역방향 키워드 3개씩, 정/역방향 요약이 비어 있지 않다', () => {
    const problems: string[] = [];
    for (const card of TAROT_CARDS) {
      if (!card.nameKo.trim()) problems.push(`${card.id}: 한글 이름 없음`);
      for (const [dir, meaning] of [
        ['정방향', card.upright],
        ['역방향', card.reversed],
      ] as const) {
        const keywords = meaning.keywords;
        if (keywords.length !== 3) {
          problems.push(
            `${card.id} ${card.nameKo} ${dir}: 키워드 ${keywords.length}개`
          );
        }
        for (const keyword of keywords) {
          if (!keyword.trim()) problems.push(`${card.id} ${dir}: 빈 키워드`);
        }
        if (new Set(keywords).size !== keywords.length) {
          problems.push(`${card.id} ${card.nameKo} ${dir}: 키워드 중복`);
        }
        if (!meaning.summary.trim()) {
          problems.push(`${card.id} ${card.nameKo} ${dir}: 요약 없음`);
        }
      }
    }
    expect(problems, problems.join('\n')).toEqual([]);
  });

  test('AC-15(참고): 요약이 1~2문장이다 (후보 보고, 자동 실패 아님)', async () => {
    const testInfo = test.info();
    const candidates: string[] = [];
    for (const card of TAROT_CARDS) {
      for (const [dir, meaning] of [
        ['정방향', card.upright],
        ['역방향', card.reversed],
      ] as const) {
        const count = splitSentences(meaning.summary).length;
        if (count < 1 || count > 2) {
          candidates.push(`${card.id} ${card.nameKo} ${dir}: ${count}문장`);
        }
      }
    }
    await testInfo.attach('summary-sentence-count.json', {
      body: JSON.stringify(candidates, null, 2),
      contentType: 'application/json',
    });
    console.log(`[tarot-copy][요약 문장 수 후보] ${candidates.length}건`);
    for (const line of candidates) console.log(`[tarot-copy][후보] ${line}`);
  });

  test('AC-15(참고): 서로 다른 카드·방향에 같은 요약이 없다', () => {
    const seen = new Map<string, string>();
    const duplicates: string[] = [];
    for (const card of TAROT_CARDS) {
      for (const [dir, meaning] of [
        ['정방향', card.upright],
        ['역방향', card.reversed],
      ] as const) {
        const where = `${card.id} ${card.nameKo} ${dir}`;
        const before = seen.get(meaning.summary);
        if (before) duplicates.push(`${before} = ${where}`);
        seen.set(meaning.summary, where);
      }
    }
    expect(duplicates).toEqual([]);
  });

  test('AC-16: id 0~77 연속, 힘 8, 정의 11, 마이너 이름은 수트 + 랭크 순서이고 코트는 페이지·나이트·퀸·킹이다', () => {
    const suits = [
      { key: 'wands', ko: '완드', en: 'Wands' },
      { key: 'cups', ko: '컵', en: 'Cups' },
      { key: 'swords', ko: '소드', en: 'Swords' },
      { key: 'pentacles', ko: '펜타클', en: 'Pentacles' },
    ] as const;
    const rankKo = [
      '',
      '에이스',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '페이지',
      '나이트',
      '퀸',
      '킹',
    ];
    const rankEn = [
      '',
      'Ace',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
      'Ten',
      'Page',
      'Knight',
      'Queen',
      'King',
    ];

    const problems: string[] = [];
    TAROT_CARDS.forEach((card, index) => {
      if (card.id !== index)
        problems.push(`id 불일치: 위치 ${index}, id ${card.id}`);
      if (!card.nameEn.trim()) problems.push(`${card.id}: 영문 이름 없음`);
    });
    expect(TAROT_CARDS.filter((c) => c.arcana === 'major')).toHaveLength(22);
    expect(TAROT_CARDS.filter((c) => c.arcana === 'minor')).toHaveLength(56);

    const strength = TAROT_CARDS.find((c) => c.nameKo === '힘');
    const justice = TAROT_CARDS.find((c) => c.nameKo === '정의');
    expect(strength?.rank).toBe(8);
    expect(strength?.id).toBe(8);
    expect(justice?.rank).toBe(11);
    expect(justice?.id).toBe(11);

    suits.forEach((suit, suitIndex) => {
      for (let rank = 1; rank <= 14; rank++) {
        const id = 22 + suitIndex * 14 + (rank - 1);
        const card = TAROT_CARDS[id];
        if (card.suit !== suit.key || card.rank !== rank) {
          problems.push(`${id}: 수트·랭크 불일치 (${card.suit} ${card.rank})`);
        }
        if (card.nameKo !== `${suit.ko} ${rankKo[rank]}`) {
          problems.push(
            `${id}: 한글 이름 "${card.nameKo}" (기대 "${suit.ko} ${rankKo[rank]}")`
          );
        }
        if (card.nameEn !== `${rankEn[rank]} of ${suit.en}`) {
          problems.push(`${id}: 영문 이름 "${card.nameEn}"`);
        }
      }
    });
    const names = TAROT_CARDS.map((c) => c.nameKo);
    expect(new Set(names).size).toBe(78);
    expect(problems, problems.join('\n')).toEqual([]);
  });

  test('AC-20(데이터): 죽음 카드(id 13)만 보충 문구가 있고 실제 죽음이 아니라는 뜻이다', () => {
    const withNote = TAROT_CARDS.filter((c) => c.note);
    expect(withNote.map((c) => c.id)).toEqual([13]);
    expect(withNote[0].nameKo).toBe('죽음');
    expect(withNote[0].note).toMatch(/실제 죽음이 아니라/);
  });

  // v2: 기존 AC-12(데이터)(TAROT_QUESTION_TOPICS·examples 검사)는 삭제했다.
  // 대체: 아래 "v2 AC-3·AC-12(데이터)"와 파일 끝 tarot-v2 문구 검사 묶음.
  test('v2 AC-3·AC-12(데이터): 분야 칩 5개(전체 기본)이고 질문 예시·옛 분야 상수가 없으며 플레이스홀더에 투자·복권·도박·로또가 없다', () => {
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

  test('AC-9(데이터): 위치 3개 모두 안내 문장이 있다', () => {
    const positions = spreadConstants.TAROT_SPREAD_POSITIONS;
    expect(positions.map((p) => p.label)).toEqual(['과거', '현재', '미래']);
    for (const position of positions) {
      expect(position.guide.trim().length).toBeGreaterThan(10);
    }
  });

  test('FAQ: 페이지마다 3개 이상이고 질문은 "~입니까?" 형태이며 답변이 비어 있지 않다', () => {
    for (const faq of [TAROT_DAILY_FAQ, TAROT_THREE_CARD_FAQ]) {
      expect(faq.length).toBeGreaterThanOrEqual(3);
      for (const item of faq) {
        expect(item.question.trim()).toMatch(
          /(입니까|합니까|습니까|됩니까|있습니까|없습니까)\?$|\?$/
        );
        expect(item.question).not.toMatch(/인가요\?$|나요\?$|까요\?$/);
        expect(item.answer.trim().length).toBeGreaterThan(30);
      }
    }
  });
});

// ---------- 소스 검사 (AC-18, AC-21) ----------

test.describe('소스 검사', () => {
  test('AC-18: src/와 public/ 소스에 Rider-Waite 계열 명칭이 없다 (검사 목록 파일·tarot-dev-guide.md 제외)', () => {
    const files = [
      ...walkFiles(path.join(ROOT, 'src')),
      ...walkFiles(path.join(ROOT, 'public')),
    ].filter(
      (file) =>
        TEXT_EXT.has(path.extname(file).toLowerCase()) &&
        rel(file) !== RULE_FILE &&
        rel(file) !== DEV_GUIDE_FILE
    );
    expect(files.length).toBeGreaterThan(100);

    const hits: string[] = [];
    for (const file of files) {
      const text = fs.readFileSync(file, 'utf8');
      const lower = text.toLowerCase();
      for (const term of TAROT_TRADEMARK_TERMS) {
        if (lower.includes(term.toLowerCase())) {
          hits.push(`${rel(file)}: "${term}"`);
        }
      }
      if (/rider/i.test(text)) hits.push(`${rel(file)}: Rider`);
    }
    expect(hits, hits.join('\n')).toEqual([]);
  });

  test('AC-18: 화면 코드가 표현 규칙 검사 목록(tarot-copy-rule)을 import하지 않는다', () => {
    const importers = walkFiles(path.join(ROOT, 'src'))
      .filter((file) => /\.(ts|tsx|js|jsx|mjs)$/.test(file))
      .filter((file) => rel(file) !== RULE_FILE)
      .filter((file) =>
        fs.readFileSync(file, 'utf8').includes('tarot-copy-rule')
      )
      .map(rel);
    expect(importers).toEqual([]);
  });

  test('AC-21: 카드 이미지 파일(png, jpg, webp, svg 등)이 타로 경로·타로 이름으로 public/·src/에 없다', async () => {
    const testInfo = test.info();
    const imageExt = new Set([
      '.png',
      '.jpg',
      '.jpeg',
      '.webp',
      '.svg',
      '.gif',
      '.avif',
    ]);
    const images = [
      ...walkFiles(path.join(ROOT, 'src')),
      ...walkFiles(path.join(ROOT, 'public')),
    ].filter((file) => imageExt.has(path.extname(file).toLowerCase()));

    // 사이트 공용 이미지(og-image, noise, icon)는 타로와 무관하다. 목록으로만 남긴다
    await testInfo.attach('image-files.json', {
      body: JSON.stringify(images.map(rel), null, 2),
      contentType: 'application/json',
    });
    console.log(
      `[tarot-copy] 저장소 이미지 파일: ${images.map(rel).join(', ')}`
    );

    const tarotImages = images.filter((file) =>
      /tarot|타로|card|deck|arcana|major|minor|wands|cups|swords|pentacles/i.test(
        rel(file)
      )
    );
    expect(tarotImages.map(rel)).toEqual([]);
  });

  test('AC-21: THIRD_PARTY_NOTICES.md에 이미지 자체 제작 이력이 있다', () => {
    const notices = fs.readFileSync(
      path.join(ROOT, 'THIRD_PARTY_NOTICES.md'),
      'utf8'
    );
    expect(notices).toMatch(/Original artwork and content/);
    expect(notices).toMatch(/inline SVG/);
    expect(notices).toMatch(/No third-party tarot deck images/);
  });

  test('AC-21: docs/tarot/copy-log.md에 78장의 작성자·작성일·검수자 기록이 있다', () => {
    const log = fs.readFileSync(
      path.join(ROOT, 'docs', 'tarot', 'copy-log.md'),
      'utf8'
    );
    const rows = log
      .split('\n')
      .filter((line) => /^\| \d+ \|/.test(line))
      .map((line) => line.split('|').map((cell) => cell.trim()));
    // 카드 행(id 0~77)은 첫 열이 0~77인 행. 웹 검색 표의 행은 첫 열이 문장이라 걸리지 않는다
    const cardRows = rows.filter((cells) => Number(cells[1]) <= 77);
    expect(cardRows).toHaveLength(78);
    const ids = cardRows.map((cells) => Number(cells[1])).sort((a, b) => a - b);
    expect(ids).toEqual(Array.from({ length: 78 }, (_, i) => i));
    for (const cells of cardRows) {
      const [, id, name, author, writtenAt, reviewer, reviewedAt, status] =
        cells;
      expect(author, `${id} ${name} 작성자`).not.toBe('');
      expect(writtenAt, `${id} ${name} 작성일`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(status, `${id} ${name} 상태`).not.toBe('');
      // 검수가 끝난 행(상태 "검수 완료")은 검수자·검수일이 있어야 한다
      if (status === '검수 완료') {
        expect(reviewer, `${id} ${name} 검수자`).not.toBe('');
        expect(reviewedAt, `${id} ${name} 검수일`).toMatch(
          /^\d{4}-\d{2}-\d{2}$/
        );
      }
    }
  });

  test('AC-21(참고): 카드 78장 중 검수 완료 행 수를 보고한다 (자동 실패 아님)', async () => {
    const testInfo = test.info();
    const log = fs.readFileSync(
      path.join(ROOT, 'docs', 'tarot', 'copy-log.md'),
      'utf8'
    );
    const cardRows = log
      .split('\n')
      .filter((line) => /^\| \d+ \|/.test(line))
      .map((line) => line.split('|').map((cell) => cell.trim()))
      .filter((cells) => Number(cells[1]) <= 77);
    const pending = cardRows
      .filter((cells) => cells[7] !== '검수 완료')
      .map((cells) => `${cells[1]} ${cells[2]} (${cells[7]})`);
    await testInfo.attach('review-pending.json', {
      body: JSON.stringify(pending, null, 2),
      contentType: 'application/json',
    });
    console.log(
      `[tarot-copy] 검수 완료 ${cardRows.length - pending.length}/78장, 미검수 ${pending.length}장`
    );
    expect(cardRows).toHaveLength(78);
  });
});

// ---------- 서버 HTML 검사 (JS 비활성) ----------

type PageTexts = {
  blocks: NamedText[];
  head: NamedText[];
  jsonLd: NamedText[];
  labels: NamedText[];
};

async function collectPageTexts(
  page: Page,
  pagePath: string
): Promise<PageTexts> {
  const res = await page.goto(pagePath);
  expect(res?.status()).toBeLessThan(400);
  const raw = await page.evaluate(() => {
    const clean = (s: string | null | undefined) =>
      (s ?? '').replace(/\s+/g, ' ').trim();
    const blocks = Array.from(
      document.body.querySelectorAll(
        'p, li, h1, h2, h3, h4, dt, dd, figcaption, label, button, summary, title'
      )
    )
      // 사이트 공통 머리글·바닥글(로또 중심 문구)은 타로 문구가 아니므로 뺀다
      .filter((el) => el.closest('header, footer') === null)
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        text: clean(el.textContent),
      }))
      .filter((b) => b.text.length > 0);

    const meta = (selector: string) =>
      document.querySelector(selector)?.getAttribute('content') ?? '';
    const head = [
      { where: 'title', text: document.title },
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
      document.querySelectorAll('script[type="application/ld+json"]')
    ).map((el) => el.textContent ?? '');

    const labels = Array.from(
      document.body.querySelectorAll('[aria-label]')
    ).map((el) => clean(el.getAttribute('aria-label')));
    return { blocks, head, jsonLd, labels };
  });

  const jsonLd: NamedText[] = [];
  raw.jsonLd.forEach((text, index) => {
    flattenStrings(JSON.parse(text), `JSON-LD ${index}`, jsonLd);
  });

  const head = raw.head.map((h) => ({
    where: `head ${h.where}`,
    // og:image 주소는 주소 안의 title·alt 값이 읽히도록 풀어서 본다
    text: h.where.includes('image') ? safeDecode(h.text) : h.text,
  }));

  return {
    blocks: raw.blocks.map((b, i) => ({
      where: `본문 ${b.tag} #${i}`,
      text: b.text,
    })),
    head,
    jsonLd: jsonLd.filter(
      (j) => !/^https?:\/\/|^https:\/\/schema\.org/.test(j.text)
    ),
    labels: raw.labels.map((text, i) => ({ where: `aria-label #${i}`, text })),
  };
}

function safeDecode(text: string): string {
  try {
    return decodeURIComponent(text.replace(/\+/g, ' '));
  } catch {
    return text;
  }
}

test.describe('서버 HTML (JS 비활성): 본문, title, description, OG, JSON-LD', () => {
  test.use({ javaScriptEnabled: false });

  for (const pagePath of ['/tarot/daily', '/tarot/three-card']) {
    test(`AC-18, AC-19: ${pagePath} 서버 HTML에 금지 표현·상표 명칭이 없다`, async ({
      page,
    }) => {
      const texts = await collectPageTexts(page, pagePath);
      const all = [
        ...texts.blocks,
        ...texts.head,
        ...texts.jsonLd,
        ...texts.labels,
      ];
      expect(texts.blocks.length).toBeGreaterThan(20);
      expect(texts.head.map((h) => h.where)).toEqual(
        expect.arrayContaining([
          'head title',
          'head description',
          'head og:title',
        ])
      );
      expect(texts.jsonLd.length).toBeGreaterThan(5);

      const violations = all.flatMap(findViolations);
      expect(violations, violations.join('\n')).toEqual([]);
    });

    test(`D4: ${pagePath} 서버 HTML 문장은 합니다체로 통일돼 있다`, async ({
      page,
    }, testInfo) => {
      const texts = await collectPageTexts(page, pagePath);
      // 짧은 명사형 라벨(버튼, 제목, 메뉴, title, OG alt)은 문장 끝 기호가 없어 대상이 아니다
      const sentenceSources = [...texts.blocks, ...texts.head, ...texts.jsonLd];
      const report = checkStyle(sentenceSources);

      await testInfo.attach(
        `style-candidates-${pagePath.replace(/\//g, '_')}.json`,
        {
          body: JSON.stringify(
            {
              haeyoCandidates: report.haeyoCandidates,
              nonHabnidaCandidates: report.nonHabnidaCandidates,
            },
            null,
            2
          ),
          contentType: 'application/json',
        }
      );
      console.log(
        `[tarot-copy] ${pagePath} 해요체 후보 ${report.haeyoCandidates.length}건, 합니다체 아닌 종결 후보 ${report.nonHabnidaCandidates.length}건`
      );
      for (const line of [
        ...report.haeyoCandidates,
        ...report.nonHabnidaCandidates,
      ]) {
        console.log(`[tarot-copy][후보] ${pagePath} ${line}`);
      }
      expect(report.hard, report.hard.join('\n')).toEqual([]);
    });
  }

  test('AC-32(문구): 두 페이지 title·description에 핵심 검색어와 오락·참고용 고지가 있다', async ({
    page,
  }) => {
    const daily = await collectPageTexts(page, '/tarot/daily');
    const three = await collectPageTexts(page, '/tarot/three-card');
    const get = (texts: PageTexts, where: string) =>
      texts.head.find((h) => h.where === `head ${where}`)?.text ?? '';
    expect(get(daily, 'title')).toMatch(/오늘의 타로/);
    expect(get(three, 'title')).toMatch(/3장 타로/);
    expect(get(three, 'title')).toMatch(/쓰리카드 타로/);
    expect(get(daily, 'description')).toMatch(/오락·참고용/);
    expect(get(three, 'description')).toMatch(/오락·참고용/);
    // v2: description 초안(design 13)에서 "쓰리카드 타로"가 빠졌다. 검색어는 title과 keywords가 지킨다
    expect(get(three, 'description')).toMatch(/3장 타로|과거·현재·미래/);
    expect(seoConstants.TAROT_THREE_CARD_SEO.keywords).toContain(
      '쓰리카드 타로'
    );
  });
});

// ---------- tarot-v2 문구 검사 (분야 40문장, 이야기 45문장, 조합 전수) ----------

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

type StoryCell = {
  where: string;
  text: string;
  kind: 'position' | 'closing';
  position?: TarotSpreadPositionKeyType;
};

const TOPIC_CELLS: NamedText[] = SUIT_GROUPS.flatMap((group) =>
  TOPIC_KEYS.flatMap((topic) =>
    ORIENTATIONS.map((orientation) => ({
      where: `분야 문장 ${group}/${topic}/${orientation}`,
      text: TAROT_TOPIC_READINGS[group]?.[topic]?.[orientation] ?? '',
    }))
  )
);

const STORY_CELLS: StoryCell[] = STORY_TOPICS.flatMap((topic) => [
  ...POSITIONS.flatMap((position) =>
    ORIENTATIONS.map(
      (orientation): StoryCell => ({
        where: `이야기 ${topic}/${position}/${orientation}`,
        text:
          TAROT_STORY_SETS[topic]?.positions?.[position]?.[orientation] ?? '',
        kind: 'position',
        position,
      })
    )
  ),
  ...TONES.map(
    (tone): StoryCell => ({
      where: `이야기 ${topic}/closing/${tone}`,
      text: TAROT_STORY_SETS[topic]?.closing?.[tone] ?? '',
      kind: 'closing',
    })
  ),
]);

test.describe('tarot-v2 문구: 금지 표현과 새 상수', () => {
  test('v2 AC-22: 새 고지 문구·분야 문장 40·이야기 45·SEO·FAQ·가이드에 금지 표현이 없다 (예외는 부정 고지 문장뿐)', () => {
    const targets: NamedText[] = collect([
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
      ['SEO', seoConstants],
      ['FAQ 1장', TAROT_DAILY_FAQ],
      ['FAQ 3장', TAROT_THREE_CARD_FAQ],
      ['가이드 1장', DAILY_GUIDE],
      ['가이드 3장', THREE_GUIDE],
    ]);
    const violations = targets.flatMap(findViolations);
    expect(violations, violations.join('\n')).toEqual([]);
  });

  test('v2 AC-22: 새 문구 전체에 투자·재산 증식·복권·도박·로또 표현이 없다', () => {
    const targets: NamedText[] = [
      ...TOPIC_CELLS,
      ...STORY_CELLS,
      ...collect([
        ['분야 상수', { ...topicConstants }],
        ['질문 상수', { ...questionConstants }],
        ['SEO', seoConstants],
        ['가이드 1장', DAILY_GUIDE],
        ['가이드 3장', THREE_GUIDE],
      ]),
    ];
    const hits = targets
      .filter((item) => FORBIDDEN_TOPIC_WORDS.test(item.text))
      .map((item) => `${item.where}: ${item.text}`);
    expect(hits, hits.join('\n')).toEqual([]);
  });

  test('v2 AC-22: 허용 예외 문장은 부정 고지 3개(결과 면책, 이용 안내 2항, 이야기 안내)뿐이다', () => {
    expect(TAROT_COPY_ALLOWED_SENTENCES).toContain(
      noticeConstants.TAROT_STORY_NOTICE
    );
    expect(TAROT_COPY_ALLOWED_SENTENCES).toHaveLength(3);
    for (const sentence of TAROT_COPY_ALLOWED_SENTENCES) {
      expect(sentence).toMatch(/보장하지 않습니다/);
    }
  });

  test('v2: 승인된 고지 문구가 글자 단위로 같다', () => {
    expect(noticeConstants.TAROT_QUESTION_USAGE_NOTICE).toBe(
      '입력한 내용은 카드 선택과 해석에 쓰이지 않으며, 위기 안내가 필요한지 확인하는 데만 쓰입니다.'
    );
    expect(noticeConstants.TAROT_STORY_NOTICE).toBe(
      '이야기는 세 장의 카드 의미를 이어 쓴 참고용 문장입니다. 미래를 예측하거나 보장하지 않습니다.'
    );
    expect(noticeConstants.TAROT_REDRAW_RESULT_NOTICE).toBe(
      '다시 뽑으면 지금 결과는 사라집니다. 같은 고민을 여러 번 뽑기보다 한 번의 결과를 차분히 돌아보시기 바랍니다.'
    );
    expect(topicConstants.TAROT_TOPIC_NOTICE).toBe(
      '분야를 고르면 같은 카드도 그 분야의 관점에서 읽는 문장이 달라집니다. 카드는 무작위로 뽑히며 분야와 관계없이 정해집니다.'
    );
  });
});

test.describe('tarot-v2 문구: 분야 해석 문장 40개', () => {
  test('v2 AC-5: 그룹 5 x 분야 4 x 방향 2 = 40칸이 빠짐없이 채워져 있다', () => {
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

  test('v2 C-1: 40문장이 서로 모두 다르다', () => {
    const seen = new Map<string, string>();
    const dup: string[] = [];
    for (const cell of TOPIC_CELLS) {
      const before = seen.get(cell.text);
      if (before) dup.push(`${before} = ${cell.where}`);
      seen.set(cell.text, cell.where);
    }
    expect(dup, dup.join('\n')).toEqual([]);
  });

  test('v2 C-1: 칸마다 완결된 한 문장이고 합니다체이며 자리표시자·카드 이름·위치 이름이 없다', () => {
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

  test('v2 C-1(참고): "수 있습니다." 종결 권장을 지키지 않은 칸을 보고한다 (자동 실패 아님)', async () => {
    const loose = TOPIC_CELLS.filter((c) => !/수 있습니다\.$/.test(c.text)).map(
      (c) => c.where
    );
    await test.info().attach('topic-ending-candidates.json', {
      body: JSON.stringify(loose, null, 2),
      contentType: 'application/json',
    });
    console.log(`[tarot-copy][분야 문장 권장 종결 아님] ${loose.length}건`);
  });

  test('v2 C-1: 재물 분야 문장 10개는 생활 습관·소비 태도 범위다 (투자·재산 증식·복권·도박·로또 없음)', () => {
    const money = TOPIC_CELLS.filter((c) => c.where.includes('/money/'));
    expect(money).toHaveLength(10);
    const hits = money.filter((c) => FORBIDDEN_TOPIC_WORDS.test(c.text));
    expect(hits.map((c) => c.where)).toEqual([]);
  });

  test('v2 C-1(참고): 역방향 문장의 "다른 각도·속도 늦춤" 렌즈 후보를 보고한다 (자동 실패 아님)', async () => {
    const miss = TOPIC_CELLS.filter(
      (c) =>
        c.where.endsWith('/reversed') &&
        !/다른 (각도|시각|시선|방향|관점)|속도|늦추/.test(c.text)
    ).map((c) => c.where);
    await test.info().attach('topic-reversed-lens.json', {
      body: JSON.stringify(miss, null, 2),
      contentType: 'application/json',
    });
    console.log(`[tarot-copy][역방향 렌즈 후보] ${miss.length}건`);
  });

  test('v2 AC-5: getTarotTopicReading은 상수 칸과 같은 문장을 돌려주고 all이면 null이며 수트 그룹 장수가 맞다', () => {
    for (const group of SUIT_GROUPS) {
      const pool = TAROT_CARDS.filter((c) => getTarotSuitGroup(c) === group);
      expect(pool.length, group).toBe(group === 'major' ? 22 : 14);
      const card = pool[0];
      for (const topic of TOPIC_KEYS) {
        for (const orientation of ORIENTATIONS) {
          expect(
            getTarotTopicReading(card, orientation === 'reversed', topic)
          ).toBe(TAROT_TOPIC_READINGS[group][topic][orientation]);
        }
      }
      expect(getTarotTopicReading(card, false, 'all')).toBeNull();
      expect(getTarotTopicReading(card, true, 'all')).toBeNull();
    }
  });
});

test.describe('tarot-v2 문구: 흐름 이야기 문장 45개', () => {
  test('v2 AC-11: 5세트 x (위치 틀 6 + 마무리 3) = 45칸이 빠짐없이 채워져 있다', () => {
    expect(STORY_CELLS).toHaveLength(45);
    expect(STORY_CELLS.filter((c) => c.kind === 'position')).toHaveLength(30);
    expect(STORY_CELLS.filter((c) => c.kind === 'closing')).toHaveLength(15);
    const empty = STORY_CELLS.filter((c) => c.text.trim() === '').map(
      (c) => c.where
    );
    expect(empty, `빈 칸: ${empty.join(', ')}`).toEqual([]);
  });

  test('v2 AC-11: 45문장 모두 "수 있습니다."로 끝나고 한 문장이다', () => {
    const bad = STORY_CELLS.filter(
      (c) =>
        !TAROT_STORY_ENDING_PATTERN.test(c.text) ||
        splitSentences(c.text).length !== 1
    ).map((c) => `${c.where}: ${c.text}`);
    expect(bad, bad.join('\n')).toEqual([]);
  });

  test('v2 C-2: 위치 틀은 {card} 1회 + " 카드", 해당 위치 단어 포함, {keyword}는 0~1회 작은따옴표와 조사 규칙을 지킨다', () => {
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

  test('v2 C-2: 마무리 문장에는 자리표시자가 없다', () => {
    const bad = STORY_CELLS.filter(
      (c) => c.kind === 'closing' && /[{}]/.test(c.text)
    ).map((c) => c.where);
    expect(bad).toEqual([]);
  });

  test('v2 AC-13: 45문장이 서로 모두 다르다 (분야 4세트와 전체 세트 사이 겹침 0)', () => {
    const owner = new Map<string, string>();
    const dup: string[] = [];
    for (const cell of STORY_CELLS) {
      const before = owner.get(cell.text);
      if (before) dup.push(`${before} = ${cell.where}`);
      owner.set(cell.text, cell.where);
    }
    expect(dup, dup.join('\n')).toEqual([]);

    const allTexts = new Set(
      STORY_CELLS.filter((c) => c.where.startsWith('이야기 all/')).map(
        (c) => c.text
      )
    );
    const overlap = STORY_CELLS.filter(
      (c) => !c.where.startsWith('이야기 all/') && allTexts.has(c.text)
    ).map((c) => c.where);
    expect(overlap).toEqual([]);
  });

  test('v2 AC-11, AC-13: buildTarotThreeCardStory 전수(그룹 5^3 x 방향 2^3 = 1,000 조합, 분야 5개 각각)는 null 0, 4문장, 과거·현재·미래 포함', () => {
    const problems: string[] = [];
    let combos = 0;
    let perTopic = 0;
    for (const topic of STORY_TOPICS) {
      let count = 0;
      for (const g0 of SUIT_GROUPS) {
        for (const g1 of SUIT_GROUPS) {
          for (const g2 of SUIT_GROUPS) {
            const groups = [g0, g1, g2];
            const cards = groups.map((group, slot) => {
              const pool = TAROT_CARDS.filter(
                (c) => getTarotSuitGroup(c) === group
              );
              return pool[slot % pool.length];
            });
            for (let mask = 0; mask < 8; mask++) {
              const entries = POSITIONS.map((positionKey, i) => ({
                positionKey,
                card: cards[i],
                isReversed: Boolean(mask & (1 << i)),
              }));
              combos++;
              count++;
              const label = `${topic} ${groups.join('/')} mask=${mask}`;
              const story = buildTarotThreeCardStory(entries, topic);
              if (story === null) {
                problems.push(`${label}: null`);
                continue;
              }
              const sentenceCount = splitSentences(story).length;
              if (sentenceCount !== 4) {
                problems.push(`${label}: ${sentenceCount}문장`);
              }
              for (const word of ['과거', '현재', '미래']) {
                if (!story.includes(word)) {
                  problems.push(`${label}: "${word}" 없음`);
                }
              }
              if (/[{}]/.test(story)) problems.push(`${label}: 중괄호 잔존`);
              const closing =
                TAROT_STORY_SETS[topic].closing[getTarotStoryTone(entries)];
              if (!story.endsWith(closing)) {
                problems.push(`${label}: 마무리 불일치`);
              }
              if (findViolations({ where: label, text: story }).length > 0) {
                problems.push(`${label}: 금지 표현`);
              }
            }
          }
        }
      }
      perTopic = count;
    }
    expect(perTopic).toBe(1000);
    expect(combos).toBe(5000);
    expect(
      problems.slice(0, 30),
      `${problems.length}건 위반\n${problems.slice(0, 30).join('\n')}`
    ).toEqual([]);
  });

  test('v2 FE-2: buildTarotThreeCardStory는 세 장이 아니거나 위치가 겹치면 null이다', () => {
    const [a, b, c] = TAROT_CARDS;
    const make = (
      positionKey: TarotSpreadPositionKeyType,
      card: TarotCardType
    ) => ({ positionKey, card, isReversed: false });
    expect(buildTarotThreeCardStory([], 'all')).toBeNull();
    expect(
      buildTarotThreeCardStory([make('past', a), make('present', b)], 'all')
    ).toBeNull();
    expect(
      buildTarotThreeCardStory(
        [make('past', a), make('past', b), make('future', c)],
        'all'
      )
    ).toBeNull();
  });
});

test.describe('tarot-v2 문구: 검색·가이드·FAQ', () => {
  test('v2 AC-16: 3장 h1·title·description·headerDescription에 "상담"이 없고 "고민을 정리"의 뜻이 있다', () => {
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

  test('v2 C-3: 두 페이지의 SEO·가이드·FAQ에 "운세"가 없다', () => {
    const targets = collect([
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

  test('v2 AC-2: 1장 목적 문구에 "가볍게 보는 오늘의 흐름"이 있다', () => {
    expect(seoConstants.TAROT_DAILY_SEO.headerDescription).toContain(
      '가볍게 보는 오늘의 흐름'
    );
  });

  test('v2 AC-26: 가이드가 페이지당 600자 이상이고 두 페이지 문단이 겹치지 않는다', () => {
    expect(DAILY_GUIDE.length).toBeGreaterThan(0);
    expect(THREE_GUIDE.length).toBeGreaterThan(0);
    expect(DAILY_GUIDE.join('').length).toBeGreaterThanOrEqual(600);
    expect(THREE_GUIDE.join('').length).toBeGreaterThanOrEqual(600);
    expect(DAILY_GUIDE.filter((p) => THREE_GUIDE.includes(p))).toEqual([]);
    const dailySentences = new Set(DAILY_GUIDE.flatMap(splitSentences));
    const copied = THREE_GUIDE.flatMap(splitSentences).filter((sentence) =>
      dailySentences.has(sentence)
    );
    expect(copied).toEqual([]);
  });

  test('v2 AC-26: FAQ 필수 질문이 있고 질문은 "~입니까?"이며 두 페이지 답이 같지 않다', () => {
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

  test('v2 AC-17: 메뉴 타로 항목 이름이 유지되고 설명에 "운세"(두 항목)·"상담"(3장)이 없다', () => {
    const items = tarotMenuGroup?.items ?? [];
    expect(items.map((i) => i.label)).toEqual([
      '오늘의 타로',
      '3장 타로 (과거·현재·미래)',
    ]);
    for (const item of items) expect(item.description).not.toContain('운세');
    expect(items[1].description).not.toContain('상담');
  });
});
