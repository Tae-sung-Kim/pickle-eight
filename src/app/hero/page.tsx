import { HeroBannerComponent } from '@/app/hero/components/banner.component';
import { HeroTodayMessageComponent } from '@/app/hero/components/today-message.component';
import { ConsentNudgeComponent } from '@/components/shared/consent/consent-nudge.component';
import { buildMetadata, canonicalUrl } from '@/lib/seo';
import { generateOgImageUrl } from '@/utils/common.util';
import { Metadata } from 'next';

const baseMeta = buildMetadata({
  title: '오늘의 추천 · 메시지',
  description:
    '오늘의 추천 문구와 메시지를 확인하고 랜덤 도구들을 시작해 보세요.',
  pathname: '/hero',
});

export const metadata: Metadata = {
  ...baseMeta,
  openGraph: {
    ...baseMeta.openGraph,
    images: [
      generateOgImageUrl(
        '오늘의 추천 · 메시지',
        '오늘의 추천 문구와 메시지를 확인하고 랜덤 도구들을 시작해 보세요.',
        '오늘의 추천'
      ),
    ],
  },
  twitter: {
    ...baseMeta.twitter,
    images: [
      generateOgImageUrl(
        '오늘의 추천 · 메시지',
        '오늘의 추천 문구와 메시지를 확인하고 랜덤 도구들을 시작해 보세요.',
        '오늘의 추천'
      ),
    ],
  },
  alternates: {
    ...baseMeta.alternates,
    canonical: canonicalUrl('/hero'),
  },
};

export default function HeroPage() {
  return (
    <>
      <HeroBannerComponent />
      <ConsentNudgeComponent variant="value" />
      <HeroTodayMessageComponent />
    </>
  );
}
