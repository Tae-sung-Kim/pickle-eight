import { MEAL_MAP_PROVIDERS } from '@/features/meal/constants/meal-map.constant';
import type {
  MealAreaInputResultType,
  MealMapLinkType,
  MealMenuType,
} from '@/features/meal/types/meal.type';

/** 메뉴 쪽 검색어. mapQuery가 없으면 name */
export function getMealMapQuery(menu: MealMenuType): string {
  return menu.mapQuery ?? menu.name;
}

/** 지도로 넘길 전체 검색어. 검사를 통과한 동네 이름만 앞에 붙인다. 중복 제거 없음 */
export function getMealMapSearchText(
  menu: MealMenuType,
  area: MealAreaInputResultType
): string {
  const query = getMealMapQuery(menu);
  return area.status === 'valid' ? `${area.value} ${query}` : query;
}

/** 지도 서비스별 검색 링크. 고정 baseUrl 뒤에 인코딩한 검색어만 붙인다 */
export function buildMealMapLinks(
  menu: MealMenuType,
  area: MealAreaInputResultType
): readonly MealMapLinkType[] {
  const encoded = encodeURIComponent(getMealMapSearchText(menu, area));

  return MEAL_MAP_PROVIDERS.map((provider) => ({
    provider: provider.key,
    label: provider.label,
    href: `${provider.baseUrl}${encoded}`,
  }));
}
