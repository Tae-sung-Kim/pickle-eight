import { LottoAdvancedGeneratorComponent } from '@/app/lotto/advanced-generator/components/root.component';
import { BackHubPageComponent } from '@/components/back-hub.component';
import { ContentWrapperComponent } from '@/components/content-wrapper.component';
import { JsonLdComponent } from '@/components/shared/seo/json-ld.component';
import { TitleWrapperComponent } from '@/components/title-warpper.component';
import { MENU_GROUP_NAME_ENUM } from '@/constants/menu.constant';
import { canonicalUrl, jsonLdBreadcrumb, jsonLdWebSite } from '@/lib/seo';
import { generateOgImageUrl } from '@/utils/common.util';
import { getOgTag } from '@/utils/seo.util';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    '로또 고급 번호 생성기 - 필터·가중치·패턴 기반 생성 | ' +
    (process.env.NEXT_PUBLIC_SITE_NAME as string),
  description:
    '제외 번호, 구간, 홀짝, 연속수, 가중치 등 고급 필터로 로또 번호를 생성하세요. 통계 참고용 조합 제안이며 당첨 보장 없음.',
  keywords: [
    '로또',
    '번호 생성',
    '고급',
    '제외번호',
    '패턴',
    '빈도',
    '조합',
    '분석',
  ],
  openGraph: {
    title:
      '로또 고급 번호 생성기 - 필터·가중치 | ' +
      (process.env.NEXT_PUBLIC_SITE_NAME as string),
    description:
      '빈도/패턴 기준과 사용자 지정 제약으로 맞춤형 조합 생성. 참고용 번호이며 당첨을 보장하지 않습니다.',
    url: canonicalUrl(`${MENU_GROUP_NAME_ENUM.LOTTO}/advanced-generator`),
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
    images: [
      generateOgImageUrl(
        '로또 고급 번호 생성기 - 필터·가중치·패턴 기반 생성 | ' +
          (process.env.NEXT_PUBLIC_SITE_NAME as string),
        '제외 번호, 구간, 홀짝, 연속수, 가중치 등 고급 필터로 로또 번호를 생성하세요. 통계 참고용 조합 제안이며 당첨 보장 없음.',
        '로또 고급 생성기',
        getOgTag({ label: '번호 생성기' })
      ),
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title:
      '로또 고급 번호 생성기 - 필터·가중치·패턴 기반 생성 | ' +
      (process.env.NEXT_PUBLIC_SITE_NAME as string),
    description:
      '제외·구간·홀짝·연속·가중치 필터로 번호 생성. 통계 참고용 제안이며 당첨 보장 없음.',
    images: [
      generateOgImageUrl(
        '로또 고급 번호 생성기 - 필터·가중치·패턴 기반 생성 | ' +
          (process.env.NEXT_PUBLIC_SITE_NAME as string),
        '제외·구간·홀짝·연속·가중치 필터로 번호 생성. 통계 참고용 제안이며 당첨 보장 없음.',
        '로또 고급 생성기',
        getOgTag({ label: '번호 생성기' })
      ),
    ],
  },
  alternates: {
    canonical: canonicalUrl(`${MENU_GROUP_NAME_ENUM.LOTTO}/advanced-generator`),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export function AdvancedGeneratorPage() {
  const crumbs = jsonLdBreadcrumb([
    { name: 'Home', item: canonicalUrl('/') },
    { name: '로또 허브', item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.LOTTO}`) },
    {
      name: '로또 고급 번호 생성기',
      item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.LOTTO}/advanced-generator`),
    },
  ]);

  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.LOTTO}>
      <JsonLdComponent data={[jsonLdWebSite(), crumbs]} />
      <JsonLdComponent
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: '제약/가중치가 당첨을 보장하나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '아니요. 제약과 가중치는 선호 조합을 만드는 도구이며 특정 당첨을 보장하지 않습니다.',
                },
              },
              {
                '@type': 'Question',
                name: '생성기는 어떤 데이터를 참고하나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '서버에서 동기화된 로또 당첨 기록과 선택한 필터/가중치 조건을 참고합니다.',
                },
              },
            ],
          },
        ]}
      />
      <BackHubPageComponent type={MENU_GROUP_NAME_ENUM.LOTTO} />
      <div className="mx-auto max-w-5xl p-8">
        <TitleWrapperComponent
          type={MENU_GROUP_NAME_ENUM.LOTTO}
          title="로또 고급 번호 생성기"
          description="선호 조건(제외·구간·홀짝·연속·가중치)을 적용해 번호를 생성하세요. 참고용 조합이며 당첨을 보장하지 않습니다."
        />
        <LottoAdvancedGeneratorComponent />
      </div>
    </ContentWrapperComponent>
  );
}
