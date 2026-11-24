import {
  SHARE_CARD_LIST_LIMITS,
  SHARE_TEXTS,
} from '@/constants/share.constant';
import { maskShareName, truncateShareList } from '@/lib/share';
import {
  LUCKY_DRAW_SHARE_TEXTS,
  luckyDrawLotsNumberTemplate,
} from '../constants/lucky-draw-share.constant';
import type {
  LuckyDrawLadderShareCardType,
  LuckyDrawLotsOpenedCardType,
  LuckyDrawLotsShareCardType,
  LuckyDrawRouletteShareCardType,
  LuckyDrawShareFrameType,
  LuckyDrawToolKeyType,
} from '../types/lucky-draw.type';

/** "외 n개" */
export function formatLuckyDrawShareMore(hiddenCount: number): string {
  return SHARE_TEXTS.moreTemplate.replace('{n}', String(hiddenCount));
}

function buildFrame(tool: LuckyDrawToolKeyType): LuckyDrawShareFrameType {
  const text = LUCKY_DRAW_SHARE_TEXTS[tool];
  return {
    featureName: text.featureName,
    pathname: text.pathname,
    notice: text.notice,
    accent: 'lucky',
  };
}

/**
 * 사다리 카드. 입력은 화면에 공개된 이름과 결과 쌍뿐이다.
 * 가림은 참가자 이름만 대상이다(결과 칸은 그대로).
 */
export function buildLadderShareCard(
  input: Readonly<{
    rows: readonly Readonly<{ name: string; result: string }>[];
    isMasked: boolean;
  }>
): LuckyDrawLadderShareCardType | null {
  if (input.rows.length === 0) return null;
  const { items, hiddenCount } = truncateShareList(
    input.rows,
    SHARE_CARD_LIST_LIMITS.ladderRows
  );
  return {
    frame: buildFrame('ladder'),
    body: {
      rows: items.map((row) => ({
        left: input.isMasked ? maskShareName(row.name) : row.name,
        right: row.result,
      })),
      hiddenCount,
    },
  };
}

/**
 * 돌림판 카드. pickedLabel이 null(공개 전, 결과 없음)이면 null.
 * candidates는 그 회전의 칸 항목만 받는다.
 */
export function buildRouletteShareCard(
  input: Readonly<{
    pickedLabel: string | null;
    candidates: readonly string[];
    isMasked: boolean;
    shouldIncludeCandidates: boolean;
  }>
): LuckyDrawRouletteShareCardType | null {
  if (input.pickedLabel === null) return null;
  const mask = (label: string): string =>
    input.isMasked ? maskShareName(label) : label;
  const truncated = truncateShareList(
    input.candidates,
    SHARE_CARD_LIST_LIMITS.rouletteCandidates
  );
  return {
    frame: buildFrame('roulette'),
    body: {
      picked: mask(input.pickedLabel),
      candidates: input.shouldIncludeCandidates
        ? truncated.items.map(mask)
        : null,
      hiddenCount: input.shouldIncludeCandidates ? truncated.hiddenCount : 0,
    },
  };
}

/** 제비뽑기 카드. 열린 카드만 연 순서대로 넣고 닫힌 카드는 개수도 넣지 않는다 */
export function buildLotsShareCard(
  input: Readonly<{ openedCards: readonly LuckyDrawLotsOpenedCardType[] }>
): LuckyDrawLotsShareCardType | null {
  if (input.openedCards.length === 0) return null;
  const { items, hiddenCount } = truncateShareList(
    input.openedCards,
    SHARE_CARD_LIST_LIMITS.lotsRows
  );
  return {
    frame: buildFrame('lots'),
    body: {
      rows: items.map((card) => ({
        left: luckyDrawLotsNumberTemplate.replace(
          '{n}',
          String(card.position + 1)
        ),
        right: card.label,
      })),
      hiddenCount,
    },
  };
}
