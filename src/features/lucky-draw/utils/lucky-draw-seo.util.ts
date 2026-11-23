import { MENU_GROUP_NAME_ENUM, MENU_LIST } from '@/constants/menu.constant';
import { canonicalUrl, jsonLdBreadcrumb, jsonLdFaq } from '@/lib/seo';
import { LUCKY_DRAW_FAQ } from '../constants/lucky-draw-faq.constant';
import {
  LUCKY_DRAW_BREADCRUMB_GROUP,
  LUCKY_DRAW_SEO,
} from '../constants/lucky-draw-seo.constant';
import type { LuckyDrawPageKeyType } from '../types/lucky-draw.type';

/** 페이지별 JSON-LD 배열: BreadcrumbList, FAQPage */
export function getLuckyDrawJsonLd(
  pageKey: LuckyDrawPageKeyType
): Record<string, unknown>[] {
  const seo = LUCKY_DRAW_SEO[pageKey];
  const path =
    pageKey === 'hub'
      ? [
          {
            name: LUCKY_DRAW_BREADCRUMB_GROUP.name,
            item: canonicalUrl(LUCKY_DRAW_BREADCRUMB_GROUP.pathname),
          },
        ]
      : [
          {
            name: LUCKY_DRAW_BREADCRUMB_GROUP.name,
            item: canonicalUrl(LUCKY_DRAW_BREADCRUMB_GROUP.pathname),
          },
          { name: seo.breadcrumbName, item: canonicalUrl(seo.pathname) },
        ];
  return [
    jsonLdBreadcrumb([{ name: '홈', item: canonicalUrl('/') }, ...path]),
    jsonLdFaq(LUCKY_DRAW_FAQ[pageKey]),
  ];
}

/**
 * 출시 전(`comingSoon`)에는 검색 색인을 막는다.
 * `buildMetadata()`는 항상 index라 페이지 metadata에서 펼쳐 덮어쓴다.
 * 출시 때 메뉴의 `comingSoon`을 지우면 자동으로 빈 객체가 된다.
 */
export function getLuckyDrawRobots(): {
  robots?: { index: false; follow: false };
} {
  const group = MENU_LIST.find(
    (menu) => menu.group === MENU_GROUP_NAME_ENUM.LUCKY_DRAW
  );
  return group?.comingSoon ? { robots: { index: false, follow: false } } : {};
}
