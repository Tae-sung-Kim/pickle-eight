import {
  MEAL_SHARE_FEATURE_NAME,
  MEAL_SHARE_NOTICE,
  MEAL_SHARE_TARGET,
} from '@/features/meal/constants/meal-share.constant';
import type { ShareCardFrameType } from '@/types/share.type';

/** 카드 입력. 동네 이름, 카테고리, 운세 문장, 후보 목록은 받지 않는다(AC-7) */
export type MealShareInputType = Readonly<{
  mealLabel: string;
  menuName: string;
}>;

export type MealShareCardType = Readonly<{
  frame: ShareCardFrameType;
  body: MealShareInputType;
}>;

/** 결과가 없으면 null. 호출하는 쪽은 spin.status가 done일 때만 값을 넘긴다 */
export function buildMealShareCard(
  input: MealShareInputType | null
): MealShareCardType | null {
  if (!input) return null;
  return {
    frame: {
      featureName: MEAL_SHARE_FEATURE_NAME,
      pathname: MEAL_SHARE_TARGET.pathname,
      notice: MEAL_SHARE_NOTICE,
      accent: 'meal',
    },
    body: { mealLabel: input.mealLabel, menuName: input.menuName },
  };
}
