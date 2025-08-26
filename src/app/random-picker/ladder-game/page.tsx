import { generateOgImageUrl } from '@/utils';
import { LadderGameComponent } from './components';
import { Metadata } from 'next';
import { ContentWrapperComponent, JsonLd } from '@/components';
import { canonicalUrl, jsonLdBreadcrumb, jsonLdWebSite } from '@/lib';

export const metadata: Metadata = {
  title: '사다리 타기 게임 - 랜덤 결과 추첨기',
  description:
    '참가자와 상품을 입력하면, 사다리 타기를 통해 랜덤하게 결과를 추첨합니다. 애니메이션, 실시간 결과 공개, 재시도 등 다양한 기능 제공!',
  keywords: [
    '사다리타기',
    '사다리게임',
    '랜덤추첨',
    '사다리추첨',
    '결과추첨',
    '사다리랜덤',
    '모임게임',
    '파티게임',
    '사다리타기추첨',
    '사다리매칭',
    '사다리결과',
    '사다리애니메이션',
    '랜덤매칭',
    '경품추첨',
    '상품추첨',
  ],
  openGraph: {
    title: '사다리 타기 게임 - 랜덤 결과 추첨기',
    description:
      '참가자와 상품을 입력하면, 사다리 타기를 통해 랜덤하게 결과를 추첨합니다. 애니메이션, 실시간 결과 공개, 재시도 등 다양한 기능 제공!',
    url: process.env.NEXT_PUBLIC_SITE_URL + '/random-picker/ladder-game',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
    images: [
      generateOgImageUrl(
        '사다리 타기 게임 - 랜덤 결과 추첨기',
        '참가자와 상품을 입력하면, 사다리 타기를 통해 랜덤하게 결과를 추첨합니다. 애니메이션, 실시간 결과 공개, 재시도 등 다양한 기능 제공!',
        '사다리 타기 게임'
      ),
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '사다리 타기 게임 - 랜덤 결과 추첨기',
    description:
      '참가자와 상품을 입력하면, 사다리 타기를 통해 랜덤하게 결과를 추첨합니다. 애니메이션, 실시간 결과 공개, 재시도 등 다양한 기능 제공!',
    images: [
      generateOgImageUrl(
        '사다리 타기 게임 - 랜덤 결과 추첨기',
        '참가자와 상품을 입력하면, 사다리 타기를 통해 랜덤하게 결과를 추첨합니다. 애니메이션, 실시간 결과 공개, 재시도 등 다양한 기능 제공!',
        '사다리 타기 게임'
      ),
    ],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL + '/random-picker/ladder-game',
  },
  robots: { index: true, follow: true },
};

export default function LadderGamePage() {
  const crumbs = jsonLdBreadcrumb([
    { name: 'Home', item: canonicalUrl('/') },
    { name: '랜덤 도구 허브', item: canonicalUrl('/random-picker') },
    {
      name: '사다리 타기 게임',
      item: canonicalUrl('/random-picker/ladder-game'),
    },
  ]);
  return (
    <ContentWrapperComponent type="random">
      <JsonLd data={[jsonLdWebSite(), crumbs]} />
      <LadderGameComponent />
    </ContentWrapperComponent>
  );
}
