'use client';

import { useCallback, useReducer } from 'react';
import {
  MEAL_DEFAULT_KEY,
  MEAL_LIST,
} from '@/features/meal/constants/meal.constant';
import {
  MEAL_CATEGORIES,
  MEAL_DEFAULT_CATEGORIES,
} from '@/features/meal/constants/meal-category.constant';
import { MEAL_MENUS } from '@/features/meal/constants/meal-menu.constant';
import {
  MEAL_RESPIN_BUTTON_LABEL,
  MEAL_SPIN_BUTTON_LABEL,
} from '@/features/meal/constants/meal-notice.constant';
import type {
  MealBrothFilterType,
  MealCategoryKeyType,
  MealCategoryType,
  MealFilterType,
  MealKeyType,
  MealMenuType,
  MealWeatherSnapshotType,
} from '@/features/meal/types/meal.type';
import {
  carryOverMealCategories,
  filterMealMenus,
  pickMealLuckLine,
  pickMealMenu,
  toggleMealCategory,
} from '@/features/meal/utils/meal-pick.util';
import { getMealWeatherWeightOf } from '@/features/meal/utils/meal-weather.util';

// design.md 8.3 확정 타입
type MealSpinStateType =
  | Readonly<{ status: 'idle' }>
  | Readonly<{
      status: 'spinning';
      spinId: number;
      menuId: string;
      luckLine: string;
      /** 뽑은 순간의 날씨. 이후 지역·스위치가 바뀌어도 고정 */
      weather: MealWeatherSnapshotType;
    }>
  | Readonly<{
      status: 'done';
      spinId: number;
      menuId: string;
      luckLine: string;
      weather: MealWeatherSnapshotType;
    }>;

export type MealRouletteStateType = Readonly<{
  meal: MealKeyType;
  filter: MealFilterType;
  spin: MealSpinStateType;
  /** 마지막으로 쓴 spinId */
  spinSeq: number;
  /** 직전 메뉴 id. 조건을 바꿔도 남기고, 끼니를 바꾸면 지운다 */
  lastPickedId: string | null;
  /** 끼니 변경 알림을 낼지. 카테고리·국물·뽑기 때 false */
  hasMealChanged: boolean;
}>;

type MealRouletteActionType =
  | { type: 'SET_MEAL'; meal: MealKeyType }
  | { type: 'TOGGLE_CATEGORY'; category: MealCategoryKeyType }
  | { type: 'SET_BROTH'; broth: MealBrothFilterType }
  | {
      type: 'SPIN_START';
      spinId: number;
      menuId: string;
      luckLine: string;
      weather: MealWeatherSnapshotType;
    }
  | { type: 'SPIN_END'; spinId: number };

const INITIAL_STATE: MealRouletteStateType = {
  meal: MEAL_DEFAULT_KEY,
  filter: {
    categories: MEAL_DEFAULT_CATEGORIES[MEAL_DEFAULT_KEY].map(
      (category) => category.key
    ),
    broth: 'all',
  },
  spin: { status: 'idle' },
  spinSeq: 0,
  lastPickedId: null,
  hasMealChanged: false,
};

function mealRouletteReducer(
  state: MealRouletteStateType,
  action: MealRouletteActionType
): MealRouletteStateType {
  switch (action.type) {
    case 'SET_MEAL': {
      // 회전 중 변경과 같은 끼니 선택은 무시
      if (state.spin.status === 'spinning' || action.meal === state.meal) {
        return state;
      }
      return {
        ...state,
        meal: action.meal,
        filter: {
          ...state.filter,
          categories: carryOverMealCategories(
            state.filter.categories,
            action.meal
          ),
          broth: 'all',
        },
        spin: { status: 'idle' },
        lastPickedId: null,
        hasMealChanged: true,
      };
    }
    case 'TOGGLE_CATEGORY': {
      // 회전 중 조건 변경 무시 (AC-7)
      if (state.spin.status === 'spinning') {
        return state;
      }
      // 야식 단독 선택 규칙과 칩 순서 유지는 순수 함수가 처리
      const categories = toggleMealCategory(
        state.filter.categories,
        action.category,
        state.meal
      );
      return {
        ...state,
        filter: { ...state.filter, categories },
        spin: { status: 'idle' },
        hasMealChanged: false,
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
        hasMealChanged: false,
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
          weather: action.weather,
        },
        spinSeq: action.spinId,
        lastPickedId: action.menuId,
        hasMealChanged: false,
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

export function useMealRoulette() {
  const [state, dispatch] = useReducer(mealRouletteReducer, INITIAL_STATE);

  // 파생 값은 상태로 두지 않고 렌더링 중 계산한다 (8.3)
  const mealMenus: readonly MealMenuType[] = MEAL_MENUS[state.meal];
  const categoryOptions: readonly MealCategoryType[] =
    MEAL_CATEGORIES[state.meal];
  const mealInfo =
    MEAL_LIST.find((meal) => meal.key === state.meal) ?? MEAL_LIST[0];
  const mealLabel: string = mealInfo.label;
  const luckLabel: string = mealInfo.luckLabel;
  const candidates: readonly MealMenuType[] = filterMealMenus(
    mealMenus,
    state.filter
  );
  const doneMenuId = state.spin.status === 'done' ? state.spin.menuId : null;
  const resultMenu: MealMenuType | null =
    mealMenus.find((menu) => menu.id === doneMenuId) ?? null;
  const canSpin = candidates.length > 0 && state.spin.status !== 'spinning';
  const spinButtonLabel =
    state.spin.status === 'done'
      ? MEAL_RESPIN_BUTTON_LABEL
      : MEAL_SPIN_BUTTON_LABEL;
  const showClearBroth = candidates.length === 0;

  const setMeal = useCallback((meal: MealKeyType) => {
    dispatch({ type: 'SET_MEAL', meal });
  }, []);

  const toggleCategory = useCallback((category: MealCategoryKeyType) => {
    dispatch({ type: 'TOGGLE_CATEGORY', category });
  }, []);

  const setBroth = useCallback((broth: MealBrothFilterType) => {
    dispatch({ type: 'SET_BROTH', broth });
  }, []);

  // 4.5 1~3단계. 난수는 여기서만 쓰고 돌림판은 연출만 한다
  const spin = useCallback(
    (weather: MealWeatherSnapshotType) => {
      if (!canSpin) {
        return;
      }
      const picked = pickMealMenu(
        candidates,
        state.lastPickedId,
        undefined,
        getMealWeatherWeightOf(state.meal, weather)
      );
      if (!picked) {
        return;
      }
      dispatch({
        type: 'SPIN_START',
        spinId: state.spinSeq + 1,
        menuId: picked.id,
        luckLine: pickMealLuckLine(state.meal, picked.category),
        weather,
      });
    },
    [canSpin, candidates, state.lastPickedId, state.meal, state.spinSeq]
  );

  const handleSpinEnd = useCallback((spinId: number) => {
    dispatch({ type: 'SPIN_END', spinId });
  }, []);

  return {
    state,
    candidates,
    resultMenu,
    categoryOptions,
    mealLabel,
    luckLabel,
    canSpin,
    spinButtonLabel,
    showClearBroth,
    setMeal,
    toggleCategory,
    setBroth,
    spin,
    handleSpinEnd,
  };
}
