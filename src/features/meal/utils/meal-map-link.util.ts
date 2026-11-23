import { MEAL_MAP_PROVIDERS } from '@/features/meal/constants/meal-map.constant';
import type {
  MealMapLinkType,
  MealMenuType,
} from '@/features/meal/types/meal.type';

/** 지도 검색어. mapQuery가 없으면 name. 다른 말을 붙이지 않는다 */
export function getMealMapQuery(menu: MealMenuType): string {
  return menu.mapQuery ?? menu.name;
}

/** 지도 서비스별 검색 링크. 고정 baseUrl 뒤에 인코딩한 검색어만 붙인다 */
export function buildMealMapLinks(
  menu: MealMenuType
): readonly MealMapLinkType[] {
  const encoded = encodeURIComponent(getMealMapQuery(menu));

  return MEAL_MAP_PROVIDERS.map((provider) => ({
    provider: provider.key,
    label: provider.label,
    href: `${provider.baseUrl}${encoded}`,
  }));
}
