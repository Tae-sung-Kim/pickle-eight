'use client';

import { useCallback, useReducer } from 'react';
import type { NoSonMonthCursorType } from '@/features/no-son-days/types/no-son-days.type';
import {
  getNoSonInitialMonth,
  moveNoSonMonth,
} from '@/features/no-son-days/utils/no-son-days.util';
import type { CalendarYmdType } from '@/types/calendar.type';

type StateType = Readonly<{
  cursor: NoSonMonthCursorType;
  /** 사용자가 직접 달을 옮겼는지 */
  moved: boolean;
}>;

type ActionType =
  | Readonly<{ type: 'prev' }>
  | Readonly<{ type: 'next' }>
  | Readonly<{ type: 'sync-today'; today: CalendarYmdType }>;

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'prev':
    case 'next': {
      const next = moveNoSonMonth(
        state.cursor,
        action.type === 'prev' ? -1 : 1
      );
      return next ? { cursor: next, moved: true } : state;
    }
    case 'sync-today': {
      if (state.moved) return state;
      const target = getNoSonInitialMonth(action.today);
      if (
        target.year === state.cursor.year &&
        target.month === state.cursor.month
      ) {
        return state;
      }
      return { cursor: target, moved: false };
    }
    default:
      return state;
  }
}

/** 달 커서(연·월)와 이동 가능 여부 */
export function useCalendarMonth(initialMonth: NoSonMonthCursorType) {
  const [state, dispatch] = useReducer(reducer, {
    cursor: initialMonth,
    moved: false,
  });

  const canPrev = moveNoSonMonth(state.cursor, -1) !== null;
  const canNext = moveNoSonMonth(state.cursor, 1) !== null;

  const prev = useCallback(() => dispatch({ type: 'prev' }), []);
  const next = useCallback(() => dispatch({ type: 'next' }), []);
  const syncToday = useCallback(
    (today: CalendarYmdType) => dispatch({ type: 'sync-today', today }),
    []
  );

  return { cursor: state.cursor, canPrev, canNext, prev, next, syncToday };
}
