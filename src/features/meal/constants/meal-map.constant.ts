import type { MealMapProviderKeyType } from '@/features/meal/types/meal.type';

/**
 * 지도 검색 링크 고정값 (design 6.1, 6.2).
 * 호스트와 경로 앞부분은 여기서만 정하고, 검색어만 encodeURIComponent로 뒤에 붙인다.
 * 쿼리 파라미터, 앱 딥링크, 지도 API, 로고는 쓰지 않는다.
 */
export const MEAL_MAP_HOSTS = {
  kakao: 'map.kakao.com',
  naver: 'map.naver.com',
  google: 'www.google.com',
} as const satisfies Record<MealMapProviderKeyType, string>;

export const MEAL_MAP_PROVIDERS: ReadonlyArray<
  Readonly<{
    key: MealMapProviderKeyType;
    label: string;
    /** https://호스트/경로앞부분/ 까지. 뒤에 인코딩한 검색어만 붙인다 */
    baseUrl: string;
  }>
> = [
  {
    key: 'kakao',
    label: '카카오맵',
    baseUrl: `https://${MEAL_MAP_HOSTS.kakao}/link/search/`,
  },
  {
    key: 'naver',
    label: '네이버지도',
    baseUrl: `https://${MEAL_MAP_HOSTS.naver}/p/search/`,
  },
  {
    key: 'google',
    label: '구글 지도',
    baseUrl: `https://${MEAL_MAP_HOSTS.google}/maps/search/?api=1&query=`,
  },
];

/** 링크 공통 속성 (Q5) */
export const MEAL_MAP_LINK_ATTRS = {
  target: '_blank',
  rel: 'noopener noreferrer nofollow',
} as const;

/** 링크 묶음 제목(h3)과 외부 이동 sr-only 안내 */
export const MEAL_MAP_HEADING = '지도에서 찾아보기';
export const MEAL_MAP_SR_NOTICE = '(새 탭에서 외부 사이트 열림)';
