import { LottoAdvancedGeneratorComponent } from './components';
import type { Metadata } from 'next';
import { generateOgImageUrl } from '@/utils';
import {
  BackHubPageComponent,
  ContentWrapperComponent,
  LottoWarningAlertComponent,
  TitleWrapperComponent,
} from '@/components';
import { MENU_GROUP_NAME_ENUM } from '@/constants';

export const metadata: Metadata = {
  title: '로또 고급 번호 생성기 - 필터·패턴·빈도 기반 | Pickle Eight',
  description:
    '제외 번호, 구간, 패턴, 빈도 분석을 활용한 고급 로또 번호 생성. 맞춤형 조합으로 당첨 확률을 높여보세요.',
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
    title: '로또 고급 번호 생성기 - 필터·패턴·빈도 기반 | Pickle Eight',
    description:
      '제외 번호, 구간, 패턴, 빈도 분석을 활용한 고급 로또 번호 생성. 맞춤형 조합으로 당첨 확률을 높여보세요.',
    url: process.env.NEXT_PUBLIC_SITE_URL + '/lotto/advanced-generator',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
    images: [
      generateOgImageUrl(
        '로또 고급 번호 생성기 - 필터·패턴·빈도 기반 | Pickle Eight',
        '제외 번호, 구간, 패턴, 빈도 분석을 활용한 고급 로또 번호 생성. 맞춤형 조합으로 당첨 확률을 높여보세요.',
        '로또 고급 생성기'
      ),
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '로또 고급 번호 생성기 - 필터·패턴·빈도 기반 | Pickle Eight',
    description:
      '제외 번호, 구간, 패턴, 빈도 분석을 활용한 고급 로또 번호 생성. 맞춤형 조합으로 당첨 확률을 높여보세요.',
    images: [
      generateOgImageUrl(
        '로또 고급 번호 생성기 - 필터·패턴·빈도 기반 | Pickle Eight',
        '제외 번호, 구간, 패턴, 빈도 분석을 활용한 고급 로또 번호 생성. 맞춤형 조합으로 당첨 확률을 높여보세요.',
        '로또 고급 생성기'
      ),
    ],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL + '/lotto/advanced-generator',
  },
};

export default function AdvancedGeneratorPage() {
  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.LOTTO}>
      <BackHubPageComponent type={MENU_GROUP_NAME_ENUM.LOTTO} />
      <LottoWarningAlertComponent
        className="mt-4"
        tone="danger"
        includeAgeNotice
      />
      <div className="mx-auto max-w-5xl p-4">
        <TitleWrapperComponent
          type={MENU_GROUP_NAME_ENUM.LOTTO}
          title="로또 고급 번호 생성기"
          description="필터와 가중치를 사용하여 번호를 생성하세요."
        />
        <LottoAdvancedGeneratorComponent />
      </div>
    </ContentWrapperComponent>
  );
}
