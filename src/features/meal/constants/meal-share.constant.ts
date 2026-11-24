import { MEAL_HUB_PATH } from '@/features/meal/constants/meal-seo.constant';

/** 뭐 먹지 공유 문구와 대상. 값은 모두 고정 상수다(사용자 입력 없음) */
export const MEAL_SHARE_FEATURE_NAME = '오늘 뭐 먹지';
export const MEAL_SHARE_NOTICE =
  '재미로 고른 메뉴예요. 개인 정보는 담기지 않아요.';

export const MEAL_SHARE_TARGET = {
  pathname: MEAL_HUB_PATH,
  title: MEAL_SHARE_FEATURE_NAME,
  text: '오늘 뭐 먹지 돌림판으로 메뉴를 뽑아 봤어요.',
  fileName: 'share-meal.png',
} as const;
