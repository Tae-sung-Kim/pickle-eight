'use client';

import { useCallback, useReducer } from 'react';

import { LUNCH_CATEGORIES } from '@/features/lunch/constants/lunch-category.constant';
import { LUNCH_MENUS } from '@/features/lunch/constants/lunch-menu.constant';
import {
  LUNCH_RESPIN_BUTTON_LABEL,
  LUNCH_SPIN_BUTTON_LABEL,
} from '@/features/lunch/constants/lunch-notice.constant';
import type {
  LunchBrothFilterType,
  LunchCategoryKeyType,
  LunchFilterType,
  LunchMenuType,
} from '@/features/lunch/types/lunch.type';
import {
  filterLunchMenus,
  pickLunchLuckLine,
  pickLunchMenu,
} from '@/features/lunch/utils/lunch-pick.util';

// design.md 8.3 확정 타입
type LunchSpinStateType =
  | Readonly<{ status: 'idle' }>
  | Readonly<{
      status: 'spinning';
      spinId: number;
      menuId: string;
      luckLine: string;
    }>
  | Readonly<{
      status: 'done';
      spinId: number;
      menuId: string;
      luckLine: string;
    }>;

export type LunchTodayStateType = Readonly<{
  filter: LunchFilterType;
  spin: LunchSpinStateType;
  /** 마지막으로 쓴 spinId */
  spinSeq: number;
  /** 직전 메뉴 id. 조건을 바꿔도 남긴다(4.3) */
  lastPickedId: string | null;
}>;

type LunchTodayActionType =
  | { type: 'TOGGLE_CATEGORY'; category: LunchCategoryKeyType }
  | { type: 'SET_BROTH'; broth: LunchBrothFilterType }
  | { type: 'SPIN_START'; spinId: number; menuId: string; luckLine: string }
  | { type: 'SPIN_END'; spinId: number };

const INITIAL_STATE: LunchTodayStateType = {
  filter: {
    categories: LUNCH_CATEGORIES.map((category) => category.key),
    broth: 'all',
  },
  spin: { status: 'idle' },
  spinSeq: 0,
  lastPickedId: null,
};

function lunchTodayReducer(
  state: LunchTodayStateType,
  action: LunchTodayActionType
): LunchTodayStateType {
  switch (action.type) {
    case 'TOGGLE_CATEGORY': {
      // 회전 중 조건 변경 무시 (AC-7)
      if (state.spin.status === 'spinning') {
        return state;
      }
      const selected = new Set(state.filter.categories);
      if (selected.has(action.category)) {
        selected.delete(action.category);
      } else {
        selected.add(action.category);
      }
      // 칩 순서(LUNCH_CATEGORIES)대로 유지
      const categories = LUNCH_CATEGORIES.map((c) => c.key).filter((key) =>
        selected.has(key)
      );
      return {
        ...state,
        filter: { ...state.filter, categories },
        spin: { status: 'idle' },
      };
    }
    case 'SET_BROTH': {
      if (state.spin.status === 'spinning') {
        return state;
      }
      return {
        ...state,
        filter: { ...state.filter, broth: action.broth },
        spin: { status: 'idle' },
      };
    }
    case 'SPIN_START': {
      if (state.spin.status === 'spinning') {
        return state;
      }
      return {
        ...state,
        spin: {
          status: 'spinning',
          spinId: action.spinId,
          menuId: action.menuId,
          luckLine: action.luckLine,
        },
        spinSeq: action.spinId,
        lastPickedId: action.menuId,
      };
    }
    case 'SPIN_END': {
      // spinning이고 spinId가 같을 때만 (오래된 콜백 무시)
      if (
        state.spin.status !== 'spinning' ||
        state.spin.spinId !== action.spinId
      ) {
        return state;
      }
      return { ...state, spin: { ...state.spin, status: 'done' } };
    }
    default:
      return state;
  }
}

export function useLunchToday() {
  const [state, dispatch] = useReducer(lunchTodayReducer, INITIAL_STATE);

  // 파생 값은 상태로 두지 않고 렌더링 중 계산한다 (8.3)
  const candidates: readonly LunchMenuType[] = filterLunchMenus(
    LUNCH_MENUS,
    state.filter
  );
  const doneMenuId = state.spin.status === 'done' ? state.spin.menuId : null;
  const resultMenu: LunchMenuType | null =
    LUNCH_MENUS.find((menu) => menu.id === doneMenuId) ?? null;
  const canSpin = candidates.length > 0 && state.spin.status !== 'spinning';
  const spinButtonLabel =
    state.spin.status === 'done'
      ? LUNCH_RESPIN_BUTTON_LABEL
      : LUNCH_SPIN_BUTTON_LABEL;
  const showClearBroth =
    state.filter.categories.length > 0 && candidates.length === 0;

  const toggleCategory = useCallback((category: LunchCategoryKeyType) => {
    dispatch({ type: 'TOGGLE_CATEGORY', category });
  }, []);

  const setBroth = useCallback((broth: LunchBrothFilterType) => {
    dispatch({ type: 'SET_BROTH', broth });
  }, []);

  // 4.5 1~3단계. 난수는 여기서만 쓰고 돌림판은 연출만 한다
  const spin = useCallback(() => {
    if (!canSpin) {
      return;
    }
    const picked = pickLunchMenu(candidates, state.lastPickedId);
    if (!picked) {
      return;
    }
    dispatch({
      type: 'SPIN_START',
      spinId: state.spinSeq + 1,
      menuId: picked.id,
      luckLine: pickLunchLuckLine(picked.category),
    });
  }, [canSpin, candidates, state.lastPickedId, state.spinSeq]);

  const handleSpinEnd = useCallback((spinId: number) => {
    dispatch({ type: 'SPIN_END', spinId });
  }, []);

  return {
    state,
    candidates,
    resultMenu,
    canSpin,
    spinButtonLabel,
    showClearBroth,
    toggleCategory,
    setBroth,
    spin,
    handleSpinEnd,
  };
}
