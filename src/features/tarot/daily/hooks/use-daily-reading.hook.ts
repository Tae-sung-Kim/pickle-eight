'use client';

import { useCallback, useEffect, useReducer } from 'react';

import {
  TAROT_ANNOUNCE_TEMPLATES,
  TAROT_ORIENTATION_LABELS,
} from '@/features/tarot/constants/tarot-notice.constant';
import {
  readTarotDailyCard,
  writeTarotDailyCard,
} from '@/features/tarot/services/tarot-daily-storage.service';
import type {
  TarotCardType,
  TarotDrawnCardType,
} from '@/features/tarot/types/tarot.type';
import {
  formatTarotCardName,
  getTarotCardById,
} from '@/features/tarot/utils/tarot-card.util';
import { drawTarotCard } from '@/features/tarot/utils/tarot-draw.util';
import { getKoreaDateKey } from '@/lib/date';

// design.md 12.3 확정 타입
export type TarotDailyReadingStateType =
  | Readonly<{ status: 'checking' }>
  | Readonly<{ status: 'idle' }>
  | Readonly<{
      status: 'crisis';
      drawn: TarotDrawnCardType;
      isSaveFailed: boolean;
    }>
  | Readonly<{
      status: 'revealed';
      drawn: TarotDrawnCardType;
      /** 'drawn': 방금 뽑음(뒤집기 연출, 질문 줄). 'restored': 재방문 복원(연출 없음, 상태 줄) */
      source: 'drawn' | 'restored';
      /** 뒤집기 연출 진행 중. restored는 항상 false */
      isFlipping: boolean;
      isSaveFailed: boolean;
    }>;

type TarotDailyReadingActionType =
  | Readonly<{ type: 'RESTORE'; drawn: TarotDrawnCardType }>
  | Readonly<{ type: 'EMPTY' }>
  | Readonly<{
      type: 'DRAW';
      drawn: TarotDrawnCardType;
      isSaveFailed: boolean;
      hasCrisis: boolean;
    }>
  | Readonly<{ type: 'CONTINUE' }>
  | Readonly<{ type: 'FLIP_DONE' }>;

export type TarotDailyDrawOptionsType = Readonly<{
  isReversedEnabled: boolean;
  /** 클릭 핸들러에서 계산한 값. 다음 상태를 고르는 데만 쓰고 저장하지 않는다 */
  hasCrisis: boolean;
}>;

const INITIAL_STATE: TarotDailyReadingStateType = { status: 'checking' };

function reducer(
  state: TarotDailyReadingStateType,
  action: TarotDailyReadingActionType
): TarotDailyReadingStateType {
  switch (action.type) {
    case 'RESTORE':
      if (state.status !== 'checking' && state.status !== 'idle') return state;
      return {
        status: 'revealed',
        drawn: action.drawn,
        source: 'restored',
        isFlipping: false,
        isSaveFailed: false,
      };
    case 'EMPTY':
      return state.status === 'checking' ? { status: 'idle' } : state;
    case 'DRAW':
      if (state.status !== 'idle') return state;
      if (action.hasCrisis) {
        return {
          status: 'crisis',
          drawn: action.drawn,
          isSaveFailed: action.isSaveFailed,
        };
      }
      return {
        status: 'revealed',
        drawn: action.drawn,
        source: 'drawn',
        isFlipping: true,
        isSaveFailed: action.isSaveFailed,
      };
    case 'CONTINUE':
      if (state.status !== 'crisis') return state;
      return {
        status: 'revealed',
        drawn: state.drawn,
        source: 'drawn',
        isFlipping: true,
        isSaveFailed: state.isSaveFailed,
      };
    case 'FLIP_DONE':
      if (state.status !== 'revealed' || !state.isFlipping) return state;
      return { ...state, isFlipping: false };
    default:
      return state;
  }
}

function fillTemplate(
  template: string,
  values: Readonly<Record<string, string>>
): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, value),
    template
  );
}

/** aria-live 공지 문구. revealed일 때만 채운다. 질문 텍스트는 넣지 않는다 */
function getAnnouncement(
  state: TarotDailyReadingStateType,
  card: TarotCardType | undefined
): string {
  if (state.status !== 'revealed' || !card) return '';
  const values = {
    card: formatTarotCardName(card),
    orientation: state.drawn.isReversed
      ? TAROT_ORIENTATION_LABELS.reversed
      : TAROT_ORIENTATION_LABELS.upright,
  };
  return fillTemplate(
    state.source === 'drawn'
      ? TAROT_ANNOUNCE_TEMPLATES.dailyDrawn
      : TAROT_ANNOUNCE_TEMPLATES.dailyRestored,
    values
  );
}

/**
 * 오늘의 타로 상태 훅 (useReducer).
 * - 마운트 후 저장값을 확인한다. 서버 HTML과 첫 클라이언트 렌더는 checking으로 같다.
 * - 질문은 이 훅에 들어오지 않는다(카드 선택과 무관, 저장·전송 없음).
 */
export function useDailyReading() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  useEffect(() => {
    const restored = readTarotDailyCard(getKoreaDateKey());
    dispatch(
      restored ? { type: 'RESTORE', drawn: restored } : { type: 'EMPTY' }
    );
  }, []);

  const draw = useCallback(
    ({ isReversedEnabled, hasCrisis }: TarotDailyDrawOptionsType) => {
      // 페이지를 연 채 자정이 지난 경우를 위해 클릭 시점에 날짜 키를 다시 계산한다
      const todayKey = getKoreaDateKey();

      // 다른 탭에서 이미 뽑았다면 하루 1장 고정(AC-6)을 위해 그 카드를 보여 준다
      const existing = readTarotDailyCard(todayKey);
      if (existing) {
        dispatch({ type: 'RESTORE', drawn: existing });
        return;
      }

      const drawn = drawTarotCard(isReversedEnabled);
      // 위기 표현이 있어도 저장은 같은 시점에 한다(카드 선택은 질문과 무관)
      const isSaved = writeTarotDailyCard(todayKey, drawn);
      dispatch({ type: 'DRAW', drawn, isSaveFailed: !isSaved, hasCrisis });
    },
    []
  );

  const continueReveal = useCallback(() => dispatch({ type: 'CONTINUE' }), []);
  const completeFlip = useCallback(() => dispatch({ type: 'FLIP_DONE' }), []);

  const card =
    state.status === 'crisis' || state.status === 'revealed'
      ? getTarotCardById(state.drawn.cardId)
      : undefined;

  return {
    state,
    /** crisis·revealed일 때 뽑은 카드 데이터 */
    card,
    announcement: getAnnouncement(state, card),
    draw,
    continueReveal,
    completeFlip,
  };
}
