import { SITE_URL } from "@/lib/seo";
import { MetadataRoute } from 'next';

export function robots(): MetadataRoute.Robots {
  const siteUrl = SITE_URL;
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/lotto/sync', '/api/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
