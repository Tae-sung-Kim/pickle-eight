import { MENU_GROUP_NAME_ENUM } from '@/constants';
import { LottoAnalysisComponent } from './components';
import {
  ContentWrapperComponent,
  BackHubPageComponent,
  TitleWrapperComponent,
  JsonLdComponent,
} from '@/components';

import type { Metadata } from 'next';
import { generateOgImageUrl, getOgTag } from '@/utils';
import { canonicalUrl, jsonLdBreadcrumb, jsonLdWebSite } from '@/lib';

export const metadata: Metadata = {
  title:
    '로또 분석 - 당첨번호 통계·빈도·패턴 시각화 | ' +
    (process.env.NEXT_PUBLIC_SITE_NAME as string),
  description:
    '로또 당첨번호의 빈도·구간·홀짝·합계·연속수 등 핵심 지표를 시각화로 분석하세요. 참고용 통계이며 당첨을 보장하지 않습니다.',
  keywords: ['로또', '분석', '통계', '빈도', '패턴', '시각화', '당첨번호'],
  openGraph: {
    title:
      '로또 분석 - 빈도·패턴·구간 통계 | ' +
      (process.env.NEXT_PUBLIC_SITE_NAME as string),
    description:
      '회차별 로또 당첨번호를 기반으로 빈도, 구간, 패턴을 한눈에 확인. 전략 수립 참고용 분석 도구입니다.',
    url: canonicalUrl(`${MENU_GROUP_NAME_ENUM.LOTTO}/analysis`),
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
    images: [
      generateOgImageUrl(
        '로또 분석 - 당첨번호 통계·빈도·패턴 시각화 | ' +
          (process.env.NEXT_PUBLIC_SITE_NAME as string),
        '로또 당첨번호의 빈도·구간·홀짝·합계·연속수 등 핵심 지표를 시각화로 분석하세요. 참고용 통계이며 당첨을 보장하지 않습니다.',
        '로또 분석',
        getOgTag({ label: '로또 분석' })
      ),
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title:
      '로또 분석 - 당첨번호 통계·빈도·패턴 시각화 | ' +
      (process.env.NEXT_PUBLIC_SITE_NAME as string),
    description:
      '로또 당첨번호 통계/패턴 분석. 빈도·구간·홀짝·합계·연속수 지표 제공. 참고용이며 당첨 보장 없음.',
    images: [
      generateOgImageUrl(
        '로또 분석 - 당첨번호 통계·빈도·패턴 시각화 | ' +
          (process.env.NEXT_PUBLIC_SITE_NAME as string),
        '로또 당첨번호 통계/패턴 분석. 빈도·구간·홀짝·합계·연속수 지표 제공. 참고용이며 당첨 보장 없음.',
        '로또 분석',
        getOgTag({ label: '로또 분석' })
      ),
    ],
  },
  alternates: {
    canonical: canonicalUrl(`${MENU_GROUP_NAME_ENUM.LOTTO}/analysis`),
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

export default function LottoAnalysisPage() {
  const crumbs = jsonLdBreadcrumb([
    { name: 'Home', item: canonicalUrl('/') },
    { name: '로또 허브', item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.LOTTO}`) },
    {
      name: '로또 분석',
      item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.LOTTO}/analysis`),
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
                name: '분석 지표가 당첨을 보장하나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '아니요. 빈도·패턴 등 통계는 참고용이며 특정 당첨을 보장하지 않습니다.',
                },
              },
              {
                '@type': 'Question',
                name: '분석 데이터는 어디에서 오나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '서버 크론으로 동기화된 Firestore 저장 데이터를 바탕으로 계산합니다.',
                },
              },
            ],
          },
        ]}
      />
      {/* <></> */}
      <BackHubPageComponent type={MENU_GROUP_NAME_ENUM.LOTTO} />

      <div className="mx-auto max-w-5xl p-8">
        <TitleWrapperComponent
          type={MENU_GROUP_NAME_ENUM.LOTTO}
          title="로또 분석"
          description="회차 범위를 선택해 빈도·패턴·구간 통계를 확인하세요. 통계는 참고용이며 당첨을 보장하지 않습니다."
        />
        <LottoAnalysisComponent />
      </div>
    </ContentWrapperComponent>
  );
}
