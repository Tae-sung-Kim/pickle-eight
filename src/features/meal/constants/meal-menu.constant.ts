import { MEAL_BREAKFAST_MENUS } from '@/features/meal/constants/meal-menu-breakfast.constant';
import { MEAL_DINNER_MENUS } from '@/features/meal/constants/meal-menu-dinner.constant';
import { MEAL_LUNCH_MENUS } from '@/features/meal/constants/meal-menu-lunch.constant';
import type {
  MealCategoryKeyByMealType,
  MealKeyType,
  MealMenuType,
} from '@/features/meal/types/meal.type';

/** 끼니별 메뉴. 화면 코드는 이 값만 쓰고 끼니별 파일을 직접 import하지 않는다 */
export const MEAL_MENUS: {
  readonly [K in MealKeyType]: readonly MealMenuType<
    MealCategoryKeyByMealType[K]
  >[];
} = {
  lunch: MEAL_LUNCH_MENUS,
  dinner: MEAL_DINNER_MENUS,
  breakfast: MEAL_BREAKFAST_MENUS,
};

/** 끼니별 메뉴 개수. 메뉴 목록을 바꾸면 이 값도 같이 바꾼다 */
export const MEAL_MENU_COUNTS = {
  lunch: 120,
  dinner: 180,
  breakfast: 82,
} as const;
