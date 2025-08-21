import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://pickle-eight.vercel.app';

  // 정적 페이지 목록
  const staticRoutes = [
    '/',
    '/lotto',
    '/lotto/lotto-number',
    // '/lotto/analysis',
    '/lotto/history',
    '/lotto/check',
    // '/lotto/simulator',
    // '/lotto/advanced-generator',
    '/quiz',
    '/quiz/english-word-quiz',
    '/quiz/four-idiom-quiz',
    '/quiz/trivia-quiz',
    '/quiz/number-match-game',
    '/random-picker/dice-game',
    '/random-picker/draw-order',
    '/random-picker/ladder-game',
    '/random-picker/name-random',
    '/random-picker/seat-assignment',
    '/random-picker/team-assignment',
    '/privacy',
    '/terms',
  ];

  const sitemapEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '/' ? 1 : 0.8,
  }));

  return sitemapEntries;
}
