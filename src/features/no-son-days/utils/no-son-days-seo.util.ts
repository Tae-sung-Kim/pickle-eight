import { canonicalUrl, SITE_NAME } from '@/lib/seo';
import { NO_SON_DAYS_HUB_PATH } from '../constants/no-son-days-route.constant';
import { NO_SON_DAYS_SEO } from '../constants/no-son-days-seo.constant';
import { getNoSonDaysYears } from './no-son-days.util';

export type NoSonDaysSeoType = Readonly<{
  title: string;
  description: string;
  pathname: string;
  keywords: readonly string[];
  ogImage: Readonly<{ alt: string; tag: string }>;
}>;

/** '/no-son-days/2027' */
export function getNoSonDaysYearPath(year: number): string {
  return `${NO_SON_DAYS_HUB_PATH}/${year}`;
}

/** 사이트맵용 24개 */
export function getNoSonDaysYearPaths(): readonly string[] {
  return getNoSonDaysYears().map(getNoSonDaysYearPath);
}

export function buildNoSonDaysYearSeo(year: number): NoSonDaysSeoType {
  const seo = NO_SON_DAYS_SEO.year;
  return {
    title: seo.title(year),
    description: seo.description(year),
    pathname: getNoSonDaysYearPath(year),
    keywords: seo.keywords(year),
    ogImage: { alt: seo.ogAlt(year), tag: NO_SON_DAYS_SEO.ogTag },
  };
}

/** 홈 > 손 없는 날 달력 [> {year}년 손 없는 날] */
export function buildNoSonDaysBreadcrumb(
  year?: number
): ReadonlyArray<{ name: string; item: string }> {
  const crumbs = [
    { name: SITE_NAME, item: canonicalUrl('/') },
    {
      name: NO_SON_DAYS_SEO.hub.breadcrumbName,
      item: canonicalUrl(NO_SON_DAYS_HUB_PATH),
    },
  ];
  if (year === undefined) return crumbs;
  return [
    ...crumbs,
    {
      name: NO_SON_DAYS_SEO.year.breadcrumbName(year),
      item: canonicalUrl(getNoSonDaysYearPath(year)),
    },
  ];
}
