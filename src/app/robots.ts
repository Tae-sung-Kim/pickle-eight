import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = SITE_URL;
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // 화면 렌더링에 쓰는 조회 API(draws, stats)는 크롤러가 읽을 수 있어야 한다.
        disallow: ['/api/lotto/sync', '/api/lotto/export', '/api/csp-report'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
