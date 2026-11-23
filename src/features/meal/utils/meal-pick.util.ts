import {
  MEAL_CATEGORIES,
  MEAL_DEFAULT_CATEGORIES,
} from '@/features/meal/constants/meal-category.constant';
import { MEAL_LUCK_LINES } from '@/features/meal/constants/meal-luck.constant';
import type {
  MealCategoryKeyType,
  MealFilterType,
  MealKeyType,
  MealMenuType,
} from '@/features/meal/types/meal.type';
import { secureRandomInt } from '@/lib/random';

type RandomIntFnType = (maxExclusive: number) => number;

/**
 * 필터에 맞는 메뉴를 menus 순서 그대로 돌려준다. 카테고리와 국물은 AND.
 * 선택된 카테고리가 0개면 "선택 없음"으로 보고 그 끼니의 기본 후보 전체를 쓴다.
 * 기본 후보는 야식(lateNight)을 뺀 메뉴다(야식은 칩을 직접 켰을 때만 나온다).
 */
export function filterMealMenus(
  menus: readonly MealMenuType[],
  filter: MealFilterType
): readonly MealMenuType[] {
  const noSelection = filter.categories.length === 0;
  return menus.filter(
    (menu) =>
      (noSelection
        ? menu.category !== EXCLUSIVE_CATEGORY_KEY
        : filter.categories.includes(menu.category)) &&
      (filter.broth === 'all' || menu.broth === filter.broth)
  );
}

/**
 * 후보 중 하나를 같은 확률로 뽑는다. 후보가 비면 null.
 * previousId가 후보 안에 있고 후보가 2개 이상이면 그 메뉴를 빼고 뽑는다.
 */
export function pickMealMenu(
  candidates: readonly MealMenuType[],
  previousId: string | null,
  randomInt: RandomIntFnType = secureRandomInt
): MealMenuType | null {
  if (candidates.length === 0) {
    return null;
  }

  const pool =
    candidates.length >= 2 && previousId !== null
      ? candidates.filter((menu) => menu.id !== previousId)
      : candidates;

  return pool[randomInt(pool.length)] ?? null;
}

/** 끼니와 카테고리의 운세 문구 중 하나를 같은 확률로 고른다. 문구가 없으면 빈 문자열 */
export function pickMealLuckLine(
  meal: MealKeyType,
  category: MealCategoryKeyType,
  randomInt: RandomIntFnType = secureRandomInt
): string {
  const linesByCategory: Readonly<
    Partial<Record<MealCategoryKeyType, readonly string[]>>
  > = MEAL_LUCK_LINES[meal];
  const lines = linesByCategory[category];

  if (!lines || lines.length === 0) {
    return '';
  }

  return lines[randomInt(lines.length)] ?? '';
}

/** 단독 선택 카테고리. 켜면 다른 칩이 모두 꺼지고, 다른 칩을 켜면 꺼진다 */
const EXCLUSIVE_CATEGORY_KEY: MealCategoryKeyType = 'lateNight';

/**
 * 카테고리 칩을 누른 뒤의 선택을 돌려준다. 결과는 끼니의 칩 순서다.
 * - 야식(lateNight)을 켜면 야식만 남는다.
 * - 야식이 켜진 상태에서 다른 칩을 누르면 야식을 끄고 그 칩만 켠다.
 * - 그 밖에는 눌린 칩만 켜고 끈다(전부 꺼진 상태도 기존처럼 허용).
 */
export function toggleMealCategory(
  selected: readonly MealCategoryKeyType[],
  toggled: MealCategoryKeyType,
  meal: MealKeyType
): readonly MealCategoryKeyType[] {
  const order: readonly MealCategoryKeyType[] = MEAL_CATEGORIES[meal].map(
    (category) => category.key
  );
  let next: Set<MealCategoryKeyType>;
  if (selected.includes(toggled)) {
    next = new Set(selected);
    next.delete(toggled);
  } else if (toggled === EXCLUSIVE_CATEGORY_KEY) {
    next = new Set([toggled]);
  } else {
    next = new Set(selected);
    next.delete(EXCLUSIVE_CATEGORY_KEY);
    next.add(toggled);
  }
  return order.filter((key) => next.has(key));
}

/**
 * 끼니를 바꿀 때 카테고리 선택을 넘긴다.
 * 지금 선택이 모두 새 끼니에도 있으면 그대로 새 끼니의 칩 순서로 남긴다.
 * 하나라도 새 끼니에 없으면(예: 점심 6개 → 아침) 일부만 남아 후보가 조용히 줄어들므로
 * 새 끼니의 기본 선택(저녁은 야식 제외 6개)을 쓴다.
 */
export function carryOverMealCategories(
  selected: readonly MealCategoryKeyType[],
  nextMeal: MealKeyType
): readonly MealCategoryKeyType[] {
  const nextKeys: readonly MealCategoryKeyType[] = MEAL_CATEGORIES[
    nextMeal
  ].map((category) => category.key);
  const keepable =
    selected.length > 0 && selected.every((key) => nextKeys.includes(key));

  return keepable
    ? nextKeys.filter((key) => selected.includes(key))
    : MEAL_DEFAULT_CATEGORIES[nextMeal].map((category) => category.key);
}
