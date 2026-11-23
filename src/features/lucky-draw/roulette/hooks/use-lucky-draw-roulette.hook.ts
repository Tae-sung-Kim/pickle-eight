import { useReducer } from 'react';

import type { LuckyDrawRevealModeType } from '../../types/lucky-draw.type';

export type LuckyDrawRouletteStateType = Readonly<{
  text: string;
  revealMode: Extract<LuckyDrawRevealModeType, 'all' | 'hidden'>;
  shouldRemovePicked: boolean;
  /** 빠진 항목 id */
  removedIds: readonly string[];
  /** 회전 시작 때 고정한 칸 목록. null이면 남은 목록 */
  wheelIds: readonly string[] | null;
  spin: Readonly<{
    status: 'idle' | 'spinning' | 'done';
    spinId: number;
    /** wheelIds 기준 */
    targetIndex: number | null;
    pickedId: string | null;
  }>;
  isRevealed: boolean;
}>;

export type LuckyDrawRouletteActionType =
  | { type: 'SET_TEXT'; text: string }
  | { type: 'SET_REVEAL_MODE'; mode: 'all' | 'hidden' }
  | { type: 'SET_REMOVE_PICKED'; value: boolean }
  | {
      type: 'SPIN_START';
      wheelIds: readonly string[];
      targetIndex: number;
      pickedId: string;
    }
  | { type: 'SPIN_END'; spinId: number }
  | { type: 'REVEAL' }
  | { type: 'RESTORE' };

const INITIAL_STATE: LuckyDrawRouletteStateType = {
  text: '',
  revealMode: 'all',
  shouldRemovePicked: false,
  removedIds: [],
  wheelIds: null,
  spin: { status: 'idle', spinId: 0, targetIndex: null, pickedId: null },
  isRevealed: false,
};

/** 결과가 공개되는 순간에만 뽑힌 항목을 뺀다 */
function applyRemoval(state: LuckyDrawRouletteStateType): readonly string[] {
  const { pickedId } = state.spin;
  if (
    !state.shouldRemovePicked ||
    pickedId === null ||
    state.removedIds.includes(pickedId)
  ) {
    return state.removedIds;
  }
  return [...state.removedIds, pickedId];
}

/** 칸 목록이 바뀌면 이전 인덱스가 무효이므로 spin을 idle로 되돌린다 */
function idleSpin(
  state: LuckyDrawRouletteStateType
): LuckyDrawRouletteStateType['spin'] {
  return {
    status: 'idle',
    spinId: state.spin.spinId,
    targetIndex: null,
    pickedId: null,
  };
}

function reducer(
  state: LuckyDrawRouletteStateType,
  action: LuckyDrawRouletteActionType
): LuckyDrawRouletteStateType {
  switch (action.type) {
    case 'SET_TEXT':
      return {
        ...state,
        text: action.text,
        removedIds: [],
        wheelIds: null,
        spin: {
          status: 'idle',
          spinId: state.spin.spinId,
          targetIndex: null,
          pickedId: null,
        },
        isRevealed: false,
      };
    case 'SET_REVEAL_MODE': {
      if (state.spin.status === 'spinning') return state;
      const isAll = action.mode === 'all';
      const isPending =
        state.spin.status === 'done' && isAll && !state.isRevealed;
      return {
        ...state,
        revealMode: action.mode,
        isRevealed: state.spin.status === 'done' && isAll,
        removedIds: isPending ? applyRemoval(state) : state.removedIds,
      };
    }
    case 'SET_REMOVE_PICKED':
      if (action.value) return { ...state, shouldRemovePicked: true };
      return {
        ...state,
        shouldRemovePicked: false,
        removedIds: [],
        wheelIds: null,
        spin: idleSpin(state),
        isRevealed: false,
      };
    case 'SPIN_START':
      return {
        ...state,
        wheelIds: action.wheelIds,
        spin: {
          status: 'spinning',
          spinId: state.spin.spinId + 1,
          targetIndex: action.targetIndex,
          pickedId: action.pickedId,
        },
        isRevealed: false,
      };
    case 'SPIN_END': {
      if (
        state.spin.status !== 'spinning' ||
        state.spin.spinId !== action.spinId
      ) {
        return state;
      }
      const isAll = state.revealMode === 'all';
      const done: LuckyDrawRouletteStateType = {
        ...state,
        spin: { ...state.spin, status: 'done' },
        isRevealed: isAll,
      };
      return isAll ? { ...done, removedIds: applyRemoval(state) } : done;
    }
    case 'REVEAL':
      if (state.spin.status !== 'done' || state.isRevealed) return state;
      return { ...state, isRevealed: true, removedIds: applyRemoval(state) };
    case 'RESTORE':
      return {
        ...state,
        removedIds: [],
        wheelIds: null,
        spin: idleSpin(state),
        isRevealed: false,
      };
    default:
      return state;
  }
}

export function useLuckyDrawRoulette() {
  return useReducer(reducer, INITIAL_STATE);
}
