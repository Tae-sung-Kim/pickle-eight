import type { MetadataRoute } from 'next';
import { MENU_LIST } from '@/constants/menu.constant';
import { getDreamTopicPaths } from '@/features/dream/utils/dream-topic.util';
import { FORTUNE_COMPATIBILITY_ROUTES } from '@/features/fortune/constants/fortune-compatibility-route.constant';
import { SITE_URL } from '@/lib/seo';

const RECENT_DRAWS = 200 as const; // 최근 N개 회차 포함

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = SITE_URL;
  const isLocalHost = /localhost|127\.0\.0\.1/i.test(siteUrl);
  // Skip when explicitly requested, when running outside Vercel (local build), or when SITE_URL is localhost
  const skipDynamicFetch: boolean =
    process.env.SITEMAP_SKIP_FETCH === '1' ||
    !process.env.VERCEL ||
    isLocalHost;

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

  // 동적: 로또 최신 회차 조회 후 최근 N개 생성
  const dynamicLottoDraws: string[] = [];
  if (!skipDynamicFetch) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${siteUrl}/api/lotto/draws?latest=1`, {
        // sitemap은 서버 실행 → 캐시 길게
        next: { revalidate: 60 * 60 },
        signal: controller.signal,
      });
      clearTimeout(id);
      if (res.ok) {
        const json = (await res.json()) as {
          data?: { lastDrawNumber?: number };
        };
        const last: number | undefined = json.data?.lastDrawNumber;
        if (typeof last === 'number' && last > 0) {
          const from = Math.max(1, last - RECENT_DRAWS + 1);
          for (let n = from; n <= last; n += 1)
            dynamicLottoDraws.push(`/lotto/${n}`);
        }
      }
    } catch {
      // 네트워크 실패 시 동적 회차는 생략 (정적/메뉴 경로만 포함)
    }
  }

  // 경로 중복 제거
  const allRoutes = Array.from(
    new Set([
      ...staticRoutes,
      ...menuRoutes,
      ...compatibilityRoutes,
      ...dreamTopicRoutes,
      ...dynamicLottoDraws,
    ])
  );

  const priorityByRoute = (route: string): number => {
    if (route.startsWith('/lotto')) return 0.8;
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
