'use client';

import { useCallback, useReducer } from 'react';

import { TAROT_THREE_CARD_COUNT } from '@/features/tarot/constants/tarot-spread.constant';
import type { TarotDrawnCardType } from '@/features/tarot/types/tarot.type';
import { drawTarotCards } from '@/features/tarot/utils/tarot-draw.util';
import { hasTarotCrisisSignal } from '@/features/tarot/utils/tarot-safety.util';

/**
 * 3장 타로 진행 상태 (design.md 12.3 확정).
 * 결과는 이 리듀서(메모리)에만 있고 어떤 저장소에도 쓰지 않는다(AC-25).
 * 질문은 이 상태에 넣지 않는다. 위기 감지 결과도 상태에 저장하지 않는다.
 */
export type TarotThreeCardReadingStateType =
  | Readonly<{ status: 'idle' }>
  | Readonly<{ status: 'crisis'; drawn: readonly TarotDrawnCardType[] }>
  | Readonly<{
      status: 'revealed';
      drawn: readonly TarotDrawnCardType[];
      /** 뒤집기 연출 진행 중 */
      isFlipping: boolean;
    }>;

export type TarotThreeCardReadingActionType =
  | Readonly<{
      type: 'DRAW';
      drawn: readonly TarotDrawnCardType[];
      hasCrisis: boolean;
    }>
  // crisis → revealed(isFlipping true)
  | Readonly<{ type: 'CONTINUE' }>
  // isFlipping → false
  | Readonly<{ type: 'FLIP_DONE' }>
  // "다시 뽑기": idle로 복귀 (카드는 연출 없이 뒷면)
  | Readonly<{ type: 'RESET' }>;

const INITIAL_STATE: TarotThreeCardReadingStateType = { status: 'idle' };

function reducer(
  state: TarotThreeCardReadingStateType,
  action: TarotThreeCardReadingActionType
): TarotThreeCardReadingStateType {
  switch (action.type) {
    case 'DRAW':
      if (state.status !== 'idle') return state;
      return action.hasCrisis
        ? { status: 'crisis', drawn: action.drawn }
        : { status: 'revealed', drawn: action.drawn, isFlipping: true };
    case 'CONTINUE':
      if (state.status !== 'crisis') return state;
      return { status: 'revealed', drawn: state.drawn, isFlipping: true };
    case 'FLIP_DONE':
      if (state.status !== 'revealed' || !state.isFlipping) return state;
      return { ...state, isFlipping: false };
    case 'RESET':
      return state.status === 'idle' ? state : INITIAL_STATE;
    default:
      return state;
  }
}

export function useThreeCardReading() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  /**
   * 클릭 핸들러에서만 부른다. 위기 감지는 여기서 한 번 계산해 다음 상태를 고르는 데만 쓰고
   * 저장·전송·로그하지 않는다. 질문은 카드 선택에 영향을 주지 않는다.
   */
  const draw = useCallback((isReversedEnabled: boolean, question: string) => {
    const drawn = drawTarotCards(TAROT_THREE_CARD_COUNT, isReversedEnabled);
    dispatch({
      type: 'DRAW',
      drawn,
      hasCrisis: hasTarotCrisisSignal(question),
    });
  }, []);

  const continueReading = useCallback(() => {
    dispatch({ type: 'CONTINUE' });
  }, []);

  const finishFlip = useCallback(() => {
    dispatch({ type: 'FLIP_DONE' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    state,
    isFlipping: state.status === 'revealed' && state.isFlipping,
    draw,
    continueReading,
    finishFlip,
    reset,
  };
}
