import { type Dispatch, useReducer } from 'react';

import type { LuckyDrawLotsOpenedCardType } from '../../types/lucky-draw.type';

export type LuckyDrawLotsStateType = Readonly<{
  text: string;
  /** 섞은 카드 수. 섞기 전 null */
  cardCount: number | null;
  /** 연 카드. 연 순서대로. 열지 않은 카드의 항목은 여기 없다 */
  openedCards: readonly LuckyDrawLotsOpenedCardType[];
  /** 마지막 열기 동작. 알림 문장 계산용 */
  lastEvent: 'shuffle' | 'open' | 'open-rest' | null;
  /** 섞을 때마다 1 증가. 이전 묶음에서 온 열기 액션을 버린다 */
  runId: number;
}>;

export type LuckyDrawLotsActionType =
  | { type: 'SET_TEXT'; text: string }
  | { type: 'SHUFFLE'; runId: number; cardCount: number }
  | { type: 'OPEN'; runId: number; card: LuckyDrawLotsOpenedCardType }
  | {
      type: 'OPEN_REST';
      runId: number;
      cards: readonly LuckyDrawLotsOpenedCardType[];
    };

export const LUCKY_DRAW_LOTS_INITIAL_STATE: LuckyDrawLotsStateType = {
  text: '',
  cardCount: null,
  openedCards: [],
  lastEvent: null,
  runId: 0,
};

function canOpen(
  state: LuckyDrawLotsStateType,
  card: LuckyDrawLotsOpenedCardType,
  pending: readonly LuckyDrawLotsOpenedCardType[] = []
): boolean {
  if (state.cardCount === null) return false;
  if (
    !Number.isInteger(card.position) ||
    card.position < 0 ||
    card.position >= state.cardCount
  ) {
    return false;
  }
  return ![...state.openedCards, ...pending].some(
    (opened) => opened.position === card.position
  );
}

export function luckyDrawLotsReducer(
  state: LuckyDrawLotsStateType,
  action: LuckyDrawLotsActionType
): LuckyDrawLotsStateType {
  switch (action.type) {
    case 'SET_TEXT':
      return {
        ...state,
        text: action.text,
        cardCount: null,
        openedCards: [],
        lastEvent: null,
      };
    case 'SHUFFLE':
      return {
        ...state,
        runId: action.runId,
        cardCount: action.cardCount,
        openedCards: [],
        lastEvent: 'shuffle',
      };
    case 'OPEN':
      if (action.runId !== state.runId || !canOpen(state, action.card)) {
        return state;
      }
      return {
        ...state,
        openedCards: [...state.openedCards, action.card],
        lastEvent: 'open',
      };
    case 'OPEN_REST': {
      if (action.runId !== state.runId) return state;
      const added: LuckyDrawLotsOpenedCardType[] = [];
      for (const card of action.cards) {
        if (canOpen(state, card, added)) {
          added.push(card);
        }
      }
      if (added.length === 0) return state;
      return {
        ...state,
        openedCards: [...state.openedCards, ...added],
        lastEvent: 'open-rest',
      };
    }
    default:
      return state;
  }
}

export function useLuckyDrawLots(): [
  LuckyDrawLotsStateType,
  Dispatch<LuckyDrawLotsActionType>,
] {
  return useReducer(luckyDrawLotsReducer, LUCKY_DRAW_LOTS_INITIAL_STATE);
}
