import { LUNCH_LUCK_LINES } from '@/features/lunch/constants/lunch-luck.constant';
import type {
  LunchCategoryKeyType,
  LunchFilterType,
  LunchMenuType,
} from '@/features/lunch/types/lunch.type';
import { secureRandomInt } from '@/lib/random';

type RandomIntFnType = (maxExclusive: number) => number;

/** 필터에 맞는 메뉴를 menus 순서 그대로 돌려준다. 카테고리와 국물은 AND */
export function filterLunchMenus(
  menus: readonly LunchMenuType[],
  filter: LunchFilterType
): readonly LunchMenuType[] {
  return menus.filter(
    (menu) =>
      filter.categories.includes(menu.category) &&
      (filter.broth === 'all' || menu.broth === filter.broth)
  );
}

/**
 * 후보 중 하나를 같은 확률로 뽑는다. 후보가 비면 null.
 * previousId가 후보 안에 있고 후보가 2개 이상이면 그 메뉴를 빼고 뽑는다.
 */
export function pickLunchMenu(
  candidates: readonly LunchMenuType[],
  previousId: string | null,
  randomInt: RandomIntFnType = secureRandomInt
): LunchMenuType | null {
  if (candidates.length === 0) {
    return null;
  }

  const pool =
    candidates.length >= 2 && previousId !== null
      ? candidates.filter((menu) => menu.id !== previousId)
      : candidates;

  return pool[randomInt(pool.length)] ?? null;
}

/** 카테고리의 점심운 문구 중 하나를 같은 확률로 고른다 */
export function pickLunchLuckLine(
  category: LunchCategoryKeyType,
  randomInt: RandomIntFnType = secureRandomInt
): string {
  const lines = LUNCH_LUCK_LINES[category];

  return lines[randomInt(lines.length)];
}
