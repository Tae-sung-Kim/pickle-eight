import type { Metadata } from 'next';
import { generateOgImageUrl, getOgTag } from '@/utils';
import {
  ContentWrapperComponent,
  BackHubPageComponent,
  TitleWrapperComponent,
  JsonLdComponent,
} from '@/components';
import { canonicalUrl, jsonLdBreadcrumb, jsonLdWebSite } from '@/lib';
import { MENU_GROUP_NAME_ENUM } from '@/constants';
import { LottoSimulatorComponent } from './components';

export const metadata: Metadata = {
  title:
    '로또 시뮬레이터 - 대량 무작위 추첨 분포 확인 | ' +
    (process.env.NEXT_PUBLIC_SITE_NAME as string),
  description:
    '티켓 수와 반복 횟수를 설정해 로또 추첨을 다회 시뮬레이션하고 등수 분포를 확인하세요. 난수 기반 참고용이며 당첨 보장 없음.',
  keywords: [
    '로또',
    '시뮬레이터',
    '시뮬레이션',
    '확률',
    '분포',
    '난수',
    '반복',
  ],
  openGraph: {
    title:
      '로또 시뮬레이터 - 확률/분포 체감 | ' +
      (process.env.NEXT_PUBLIC_SITE_NAME as string),
    description:
      '대량 난수 추첨으로 결과 분포를 시각화. 티켓 수/반복 횟수 설정 지원. 참고용 통계이며 당첨 보장 없음.',
    url: canonicalUrl(`${MENU_GROUP_NAME_ENUM.LOTTO}/simulator`),
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
    images: [
      generateOgImageUrl(
        '로또 시뮬레이터 - 대량 무작위 추첨 분포 확인 | ' +
          (process.env.NEXT_PUBLIC_SITE_NAME as string),
        '티켓 수와 반복 횟수를 설정해 로또 추첨을 다회 시뮬레이션하고 등수 분포를 확인하세요. 난수 기반 참고용이며 당첨 보장 없음.',
        '로또 시뮬레이터',
        getOgTag({ label: '로또 시뮬레이터' })
      ),
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title:
      '로또 시뮬레이터 - 대량 무작위 추첨 분포 확인 | ' +
      (process.env.NEXT_PUBLIC_SITE_NAME as string),
    description:
      '대량 난수 기반 시뮬레이션으로 등수 분포를 확인. 티켓 수/반복 설정 지원. 참고용이며 당첨 보장 없음.',
    images: [
      generateOgImageUrl(
        '로또 시뮬레이터 - 대량 무작위 추첨 분포 확인 | ' +
          (process.env.NEXT_PUBLIC_SITE_NAME as string),
        '대량 난수 기반 시뮬레이션으로 등수 분포를 확인. 티켓 수/반복 설정 지원. 참고용이며 당첨 보장 없음.',
        '로또 시뮬레이터',
        getOgTag({ label: '로또 시뮬레이터' })
      ),
    ],
  },
  alternates: {
    canonical: canonicalUrl(`${MENU_GROUP_NAME_ENUM.LOTTO}/simulator`),
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

export default function LottoSimulatorPage() {
  const crumbs = jsonLdBreadcrumb([
    { name: 'Home', item: canonicalUrl('/') },
    { name: '로또 허브', item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.LOTTO}`) },
    {
      name: '로또 시뮬레이터',
      item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.LOTTO}/simulator`),
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
                name: '시뮬레이션 결과가 실제 당첨 확률과 같나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '아니요. 난수 기반 반복 실험의 분포를 보여주는 참고용 지표이며 특정 당첨을 보장하지 않습니다.',
                },
              },
              {
                '@type': 'Question',
                name: '어떤 난수 방식을 사용하나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '플랫폼 표준의 CSPRNG 계열 원칙을 따르는 무작위 추출을 사용합니다. 구현에 따라 성능/방식이 다를 수 있습니다.',
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
          title="로또 시뮬레이터"
          description="티켓 수와 반복 횟수를 설정해 시뮬레이션을 실행하세요. 결과 분포는 참고용이며 당첨을 보장하지 않습니다."
        />
        <LottoSimulatorComponent />
      </div>
    </ContentWrapperComponent>
  );
}
