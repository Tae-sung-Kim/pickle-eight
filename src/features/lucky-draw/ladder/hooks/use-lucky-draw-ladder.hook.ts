'use client';

import { useReducer } from 'react';

import { LUCKY_DRAW_DEFAULT_REVEAL_MODE } from '../../constants/lucky-draw-limit.constant';
import type {
  LuckyDrawLadderGameType,
  LuckyDrawRevealModeType,
} from '../../types/lucky-draw.type';

export type LuckyDrawLadderStateType = Readonly<{
  participantText: string;
  resultText: string;
  revealMode: LuckyDrawRevealModeType;
  /** "시작" 전 null */
  game: LuckyDrawLadderGameType | null;
  isRevealed: boolean;
  /** 경로를 다 그린 참가자 열. 마지막 값이 지금 보이는 경로 */
  tracedColumns: readonly number[];
  tracing: Readonly<{ column: number; runId: number }> | null;
  runSeq: number;
}>;

type LuckyDrawLadderActionType =
  | { type: 'SET_PARTICIPANT_TEXT'; text: string }
  | { type: 'SET_RESULT_TEXT'; text: string }
  | { type: 'SET_REVEAL_MODE'; mode: LuckyDrawRevealModeType }
  | { type: 'START'; game: LuckyDrawLadderGameType }
  | { type: 'TRACE_START'; column: number }
  | { type: 'TRACE_END'; runId: number }
  | { type: 'REVEAL_ALL' };

const INITIAL_STATE: LuckyDrawLadderStateType = {
  participantText: '',
  resultText: '',
  revealMode: LUCKY_DRAW_DEFAULT_REVEAL_MODE,
  game: null,
  isRevealed: false,
  tracedColumns: [],
  tracing: null,
  runSeq: 0,
};

function clearResult(
  state: LuckyDrawLadderStateType
): LuckyDrawLadderStateType {
  return {
    ...state,
    game: null,
    isRevealed: false,
    tracedColumns: [],
    tracing: null,
  };
}

function reducer(
  state: LuckyDrawLadderStateType,
  action: LuckyDrawLadderActionType
): LuckyDrawLadderStateType {
  switch (action.type) {
    case 'SET_PARTICIPANT_TEXT':
      return { ...clearResult(state), participantText: action.text };
    case 'SET_RESULT_TEXT':
      return { ...clearResult(state), resultText: action.text };
    case 'SET_REVEAL_MODE':
      return {
        ...state,
        revealMode: action.mode,
        isRevealed: action.mode === 'all',
        tracedColumns: [],
        tracing: null,
      };
    case 'START':
      return {
        ...state,
        game: action.game,
        isRevealed: state.revealMode === 'all',
        tracedColumns: [],
        tracing: null,
        runSeq: state.runSeq + 1,
      };
    case 'TRACE_START': {
      if (!state.game || state.tracing) return state;
      if (state.revealMode === 'hidden' && !state.isRevealed) return state;
      const runId = state.runSeq + 1;
      return {
        ...state,
        tracing: { column: action.column, runId },
        runSeq: runId,
      };
    }
    case 'TRACE_END': {
      if (!state.tracing || state.tracing.runId !== action.runId) return state;
      const column = state.tracing.column;
      return {
        ...state,
        tracing: null,
        tracedColumns: [
          ...state.tracedColumns.filter((c) => c !== column),
          column,
        ],
      };
    }
    case 'REVEAL_ALL':
      return { ...state, isRevealed: true };
    default:
      return state;
  }
}

export function useLuckyDrawLadder() {
  return useReducer(reducer, INITIAL_STATE);
}
