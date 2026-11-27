import type { MetadataRoute } from 'next';
import { MENU_LIST } from '@/constants/menu.constant';
import { getDreamTopicPaths } from '@/features/dream/utils/dream-topic.util';
import { FORTUNE_COMPATIBILITY_ROUTES } from '@/features/fortune/constants/fortune-compatibility-route.constant';
import { getNoSonDaysYearPaths } from '@/features/no-son-days/utils/no-son-days-seo.util';
import { SITE_URL } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = SITE_URL;

  // 정적 필수 페이지
  const staticRoutes: string[] = ['/', '/privacy', '/terms'];

  // 메뉴 기반 동적 경로 (그룹 + 각 아이템)
  const menuRoutes: string[] = MENU_LIST.filter((group) => !group.comingSoon)
    .flatMap((group) => [group.href, ...group.items.map((it) => it.href)])
    .filter((href): href is string => typeof href === 'string');

  // 궁합 하위 페이지 (허브는 메뉴 항목으로 포함됨)
  const compatibilityRoutes: string[] = [
    FORTUNE_COMPATIBILITY_ROUTES.tti,
    FORTUNE_COMPATIBILITY_ROUTES.starSign,
  ];

  // 꿈 해몽 소재 상세 경로 (소재 데이터가 채워지면 자동으로 늘어난다)
  const dreamTopicRoutes: string[] = [...getDreamTopicPaths()];

  // 손 없는 날 연도 경로 24개 (허브는 메뉴 항목으로 포함됨)
  const noSonDaysYearRoutes: string[] = [...getNoSonDaysYearPaths()];

  // 경로 중복 제거
  const allRoutes = Array.from(
    new Set([
      ...staticRoutes,
      ...menuRoutes,
      ...compatibilityRoutes,
      ...dreamTopicRoutes,
      ...noSonDaysYearRoutes,
    ])
  );

  const priorityByRoute = (route: string): number => {
    // 핵심 키워드 페이지를 앞세운다. 로또 회차(/lotto/N)는 얇은 페이지라 sitemap에서 뺐다.
    if (
      route === '/' ||
      /^\/(fortune|tarot|meal|lucky-draw|dream|no-son-days)/.test(route)
    )
      return 0.9;
    return 0.6;
  };

  const sitemapEntries: MetadataRoute.Sitemap = allRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: priorityByRoute(route),
  }));

  return sitemapEntries;
}
