import type { Metadata } from 'next';
import { generateOgImageUrl, getOgTag } from '@/utils';
import { EmojiTranslationComponent } from './components';
import { JsonLd } from '@/components';
import { canonicalUrl, jsonLdBreadcrumb, jsonLdWebSite } from '@/lib';

export const metadata: Metadata = {
  title: 'AI 이모지 번역 퀴즈',
  description: '이모지 힌트만 보고 정답을 맞혀보세요.',
  keywords: [
    '이모지퀴즈',
    '이모지 번역',
    '이모지 게임',
    '이모지 맞추기',
    'AI퀴즈',
    '퀴즈게임',
    '그림퀴즈',
    '수수께끼',
  ],
  robots: { index: true, follow: true },
  openGraph: {
    title: 'AI 이모지 번역 퀴즈',
    description: '이모지 힌트만 보고 정답을 맞혀보세요.',
    url: process.env.NEXT_PUBLIC_SITE_URL + '/quiz/emoji-translation',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
    images: [
      generateOgImageUrl(
        'AI 이모지 번역 퀴즈',
        '이모지 힌트만 보고 정답을 맞혀보세요.',
        '이모지 퀴즈',
        getOgTag({ href: '/quiz/emoji-translation' })
      ),
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI 이모지 번역 퀴즈',
    description: '이모지 힌트만 보고 정답을 맞혀보세요.',
    images: [
      generateOgImageUrl(
        'AI 이모지 번역 퀴즈',
        '이모지 힌트만 보고 정답을 맞혀보세요.',
        '이모지 퀴즈',
        getOgTag({ href: '/quiz/emoji-translation' })
      ),
    ],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL + '/quiz/emoji-translation',
  },
};

export default function EmojiTranslationPage() {
  const crumbs = jsonLdBreadcrumb([
    { name: 'Home', item: canonicalUrl('/') },
    { name: '퀴즈 허브', item: canonicalUrl('/quiz') },
    { name: '이모지 번역 퀴즈', item: canonicalUrl('/quiz/emoji-translation') },
  ]);
  return (
    <div className="w-full">
      {/* Hero */}
      <section className="w-full bg-gradient-to-b from-muted/50 to-transparent">
        <div className="mx-auto max-w-3xl px-4 pt-12 pb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            이모지 번역 퀴즈
          </h1>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground">
            이모지 조합이 의미하는 것을 맞혀보세요. 실제로 통용되는
            명칭/작품/표현만 정답입니다.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="mt-2">
          <JsonLd data={[jsonLdWebSite(), crumbs]} />
          <EmojiTranslationComponent />
        </div>
      </section>
    </div>
  );
}
