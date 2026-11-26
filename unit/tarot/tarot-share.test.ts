import { describe, expect, it } from 'vitest';
import { TAROT_CARDS } from '@/features/tarot/constants/tarot-cards.constant';
import {
  TAROT_COPY_ALLOWED_SENTENCES,
  TAROT_FORBIDDEN_PATTERNS,
  TAROT_FORBIDDEN_TERMS,
  TAROT_TRADEMARK_TERMS,
} from '@/features/tarot/constants/tarot-copy-rule.constant';
import { TAROT_ORIENTATION_LABELS } from '@/features/tarot/constants/tarot-notice.constant';
import * as shareConstants from '@/features/tarot/constants/tarot-share.constant';
import { TAROT_SPREAD_POSITIONS } from '@/features/tarot/constants/tarot-spread.constant';
import {
  buildTarotShareCard,
  getTarotFirstSentence,
} from '@/features/tarot/utils/tarot-share.util';
import {
  checkHabnidaStyle,
  collectTexts,
  findForbidden,
} from '../helpers/copy-check.util';

const RULE = {
  forbiddenTerms: TAROT_FORBIDDEN_TERMS,
  forbiddenPatterns: TAROT_FORBIDDEN_PATTERNS,
  allowedSentences: TAROT_COPY_ALLOWED_SENTENCES,
};
const QUESTION = '내 질문 비밀문장';

describe('AC-4: 타로 공유 카드 조립', () => {
  it('요약 첫 문장만 쓴다', () => {
    expect(getTarotFirstSentence('첫째입니다. 둘째입니다.')).toBe(
      '첫째입니다.'
    );
    expect(getTarotFirstSentence('마침표 없는 문장')).toBe('마침표 없는 문장');
  });

  it('1장: 정/역 방향 요약을 첫 문장으로 쓰고 위치 이름은 없다', () => {
    const card = TAROT_CARDS[0];
    for (const isReversed of [false, true]) {
      const built = buildTarotShareCard([{ card, isReversed }], 1);
      const src = isReversed ? card.reversed : card.upright;
      expect(built?.kind).toBe('daily');
      expect(built?.items[0]).toMatchObject({
        positionLabel: null,
        isReversed,
        summary: getTarotFirstSentence(src.summary),
      });
      expect(built?.frame.notice).toBe(shareConstants.TAROT_SHARE_NOTICE);
      expect(built?.frame.pathname).toBe('/tarot/daily');
    }
  });

  it('3장: 위치 라벨 과거·현재·미래, 개수가 다르면 null', () => {
    const inputs = TAROT_SPREAD_POSITIONS.map((position, i) => ({
      card: TAROT_CARDS[i],
      isReversed: i === 1,
      position,
    }));
    const built = buildTarotShareCard(inputs, 3);
    expect(built?.kind).toBe('threeCard');
    expect(built?.items.map((i) => i.positionLabel)).toEqual([
      '과거',
      '현재',
      '미래',
    ]);
    expect(buildTarotShareCard(inputs.slice(0, 2), 3)).toBeNull();
    expect(buildTarotShareCard([], 1)).toBeNull();
  });

  it('질문·날짜·해석 전문·키워드는 결과 객체 어디에도 없다', () => {
    const card = { ...TAROT_CARDS[5] };
    const built = buildTarotShareCard(
      [{ card, isReversed: true, question: QUESTION } as never],
      1
    );
    const json = JSON.stringify({
      ...built,
      items: built?.items.map((i) => ({ ...i, card: undefined })),
    });
    expect(json).not.toContain(QUESTION);
    expect(json).not.toMatch(/\d{4}-\d{2}-\d{2}/);
    // 항목 키는 정해진 4개뿐(키워드·전문 없음)
    expect(Object.keys(built?.items[0] ?? {}).sort()).toEqual([
      'card',
      'isReversed',
      'positionLabel',
      'summary',
    ]);
    const s = built?.items[0].summary ?? '';
    expect(card.reversed.summary.startsWith(s)).toBe(true);
  });

  it('방향 라벨은 TAROT_ORIENTATION_LABELS(정방향/역방향)다', () => {
    expect(TAROT_ORIENTATION_LABELS).toEqual({
      upright: '정방향',
      reversed: '역방향',
    });
  });
});

describe('AC-4, 8: 타로 공유 문구 검사 등록', () => {
  const TEXTS = collectTexts([['타로 공유 상수', { ...shareConstants }]]);

  it('고지 한 줄과 공유 문구 2개가 검사 대상에 있다', () => {
    const joined = TEXTS.map((t) => t.text).join('\n');
    expect(joined).toContain(shareConstants.TAROT_SHARE_NOTICE);
    expect(joined).toContain(shareConstants.TAROT_SHARE_TARGETS.daily.text);
    expect(joined).toContain(shareConstants.TAROT_SHARE_TARGETS.threeCard.text);
  });

  it('금지 표현·패턴·상표성 명칭이 없다', () => {
    const found = TEXTS.flatMap((t) => findForbidden(t, RULE));
    expect(found, found.join('\n')).toEqual([]);
    for (const t of TEXTS)
      for (const term of TAROT_TRADEMARK_TERMS)
        expect(t.text.toLowerCase(), t.where).not.toContain(term.toLowerCase());
  });

  it('고지 한 줄은 합니다체다', () => {
    const r = checkHabnidaStyle([
      { where: 'notice', text: shareConstants.TAROT_SHARE_NOTICE },
    ]);
    expect([...r.hard, ...r.questionHaeyo]).toEqual([]);
  });
});
