import { describe, expect, expectTypeOf, it } from 'vitest';
import { SHARE_CARD_LIST_LIMITS } from '@/constants/share.constant';
import * as fortuneShare from '@/features/fortune/constants/fortune-share.constant';
import {
  buildFortuneShareCard,
  type FortuneShareInputType,
} from '@/features/fortune/utils/fortune-share.util';
import * as lottoShare from '@/features/lotto/constants/lotto-share.constant';
import { buildLottoShareCard } from '@/features/lotto/utils/lotto-share.util';

const LUCKY = { color: '초록', direction: '동쪽', numbers: [3, 8] };
const LOTTO_FORBIDDEN = /당첨\s*보장|필승|확률\s*(상승|높)|대박|1등/;

describe('AC-5: 운세 카드', () => {
  it('입력 타입에 생년월일·날짜 키가 없다', () => {
    expectTypeOf<keyof FortuneShareInputType>().toEqualTypeOf<
      'kind' | 'name' | 'summary' | 'lucky'
    >();
  });
  it('결과가 없으면 null, 있으면 이름·요약·행운 요소·고지·주소만', () => {
    expect(buildFortuneShareCard(null)).toBeNull();
    const card = buildFortuneShareCard({
      kind: 'tti',
      name: '쥐띠',
      summary: '차분하게 하루를 보내기 좋습니다.',
      lucky: LUCKY,
    });
    expect(Object.keys(card?.body ?? {}).sort()).toEqual([
      'lucky',
      'name',
      'summary',
    ]);
    expect(card?.frame.featureName).toBe('띠별 운세');
    expect(card?.frame.pathname).toBe(
      fortuneShare.FORTUNE_SHARE_TARGETS.tti.pathname
    );
    expect(card?.frame.notice).toBe(fortuneShare.FORTUNE_SHARE_NOTICE);
  });
  it('오늘의 운세는 이름이 null, 행운 요소가 없으면 lucky만 null', () => {
    const card = buildFortuneShareCard({
      kind: 'today',
      summary: '요약',
      lucky: null,
    });
    expect(card?.body).toEqual({ name: null, summary: '요약', lucky: null });
  });
  it('고지 문구는 승인된 문장이다', () => {
    expect(fortuneShare.FORTUNE_SHARE_NOTICE).toBe(
      '재미로 보는 참고용 결과입니다. 실제 상황과 다를 수 있습니다.'
    );
  });
  it('카드 문구 상수에 금지어(보장, 예측)가 없다', () => {
    const texts = Object.values(
      fortuneShare.FORTUNE_SHARE_FEATURE_NAMES
    ).concat(fortuneShare.FORTUNE_SHARE_NOTICE);
    expect(texts.some((t) => /보장|예측/.test(t))).toBe(false);
  });
});

describe('AC-6: 로또 카드', () => {
  it('번호가 없으면 null, 고지는 문구 상수에서 온다', () => {
    expect(buildLottoShareCard([])).toBeNull();
    const card = buildLottoShareCard([[1, 2, 3, 4, 5, 6]]);
    expect(card?.frame.notice).toBe(lottoShare.LOTTO_SHARE_NOTICE);
    expect(card?.frame.pathname).toBe('/lotto/generator');
    expect(Object.keys(card?.body ?? {}).sort()).toEqual([
      'games',
      'hiddenCount',
    ]);
  });
  it('한도 초과는 줄이고 hiddenCount를 남긴다', () => {
    const limit = SHARE_CARD_LIST_LIMITS.lottoGames;
    const games = Array.from({ length: limit + 2 }, () => [1, 2, 3, 4, 5, 6]);
    const card = buildLottoShareCard(games);
    expect(card?.body.games).toHaveLength(limit);
    expect(card?.body.hiddenCount).toBe(2);
  });
  it('카드 문구에 사행성 연상 표현이 없다', () => {
    const texts = [
      lottoShare.LOTTO_SHARE_FEATURE_NAME,
      lottoShare.LOTTO_SHARE_NOTICE,
      lottoShare.LOTTO_SHARE_TARGET.text,
    ];
    expect(texts.some((t) => LOTTO_FORBIDDEN.test(t))).toBe(false);
  });
});
