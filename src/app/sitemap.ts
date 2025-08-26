import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pickle-eight.vercel.app'
  ).replace(/\/+$/, '');

  // 정적 페이지 목록
  const staticRoutes = [
    '/',
    '/lotto',
    '/lotto/normal-generator',
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
    '/quiz/emoji-translation',
    '/random-picker',
    '/random-picker/dice-game',
    '/random-picker/draw-order',
    '/random-picker/ladder-game',
    '/random-picker/name-random',
    '/random-picker/seat-assignment',
    '/random-picker/team-assignment',
    '/privacy',
    '/terms',
  ];

  const priorityByRoute = (route: string): number => {
    if (route === '/') return 1.0;
    if (
      route.startsWith('/lotto') ||
      route.startsWith('/random-picker') ||
      route.startsWith('/quiz')
    )
      return 0.8;
    return 0.6;
  };

  const sitemapEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: priorityByRoute(route),
  }));

  return sitemapEntries;
}
