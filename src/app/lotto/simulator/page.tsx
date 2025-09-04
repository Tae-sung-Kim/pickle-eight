import {
  ContentWrapperComponent,
  BackHubPageComponent,
  LottoWarningAlertComponent,
  TitleWrapperComponent,
  JsonLd,
} from '@/components';
import { LottoSimulatorComponent } from './components';
import { LOTTO_WARNING_TONE_ENUM, MENU_GROUP_NAME_ENUM } from '@/constants';

import type { Metadata } from 'next';
import { generateOgImageUrl } from '@/utils';
import { canonicalUrl, jsonLdBreadcrumb, jsonLdWebSite } from '@/lib';

export const metadata: Metadata = {
  title: '로또 시뮬레이터 - 가상 추첨·확률 체감 | Pickle Eight',
  description:
    '가상 추첨으로 당첨 확률과 분포를 체감해 보세요. 다양한 옵션으로 시뮬레이션이 가능합니다.',
  keywords: ['로또', '시뮬레이터', '확률', '가상 추첨', '분포', '실험'],
  openGraph: {
    title: '로또 시뮬레이터 - 가상 추첨·확률 체감 | Pickle Eight',
    description:
      '가상 추첨으로 당첨 확률과 분포를 체감해 보세요. 다양한 옵션으로 시뮬레이션이 가능합니다.',
    url:
      process.env.NEXT_PUBLIC_SITE_URL +
      `/${MENU_GROUP_NAME_ENUM.LOTTO}/simulator`,
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
    images: [
      generateOgImageUrl(
        '로또 시뮬레이터 - 가상 추첨·확률 체감 | Pickle Eight',
        '가상 추첨으로 당첨 확률과 분포를 체감해 보세요. 다양한 옵션으로 시뮬레이션이 가능합니다.',
        '로또 시뮬레이터'
      ),
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '로또 시뮬레이터 - 가상 추첨·확률 체감 | Pickle Eight',
    description:
      '가상 추첨으로 당첨 확률과 분포를 체감해 보세요. 다양한 옵션으로 시뮬레이션이 가능합니다.',
    images: [
      generateOgImageUrl(
        '로또 시뮬레이터 - 가상 추첨·확률 체감 | Pickle Eight',
        '가상 추첨으로 당첨 확률과 분포를 체감해 보세요. 다양한 옵션으로 시뮬레이션이 가능합니다.',
        '로또 시뮬레이터'
      ),
    ],
  },
  alternates: {
    canonical:
      process.env.NEXT_PUBLIC_SITE_URL +
      `/${MENU_GROUP_NAME_ENUM.LOTTO}/simulator`,
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
      <JsonLd data={[jsonLdWebSite(), crumbs]} />
      <BackHubPageComponent type={MENU_GROUP_NAME_ENUM.LOTTO} />
      <LottoWarningAlertComponent
        className="mt-4"
        tone={LOTTO_WARNING_TONE_ENUM.DANGER}
        includeAgeNotice
      />
      <div className="mx-auto max-w-5xl p-8">
        <TitleWrapperComponent
          type={MENU_GROUP_NAME_ENUM.LOTTO}
          title="로또 시뮬레이터"
          description="랜덤 추첨을 다회 실행하여 당첨 분포를 확인합니다."
        />

        <LottoSimulatorComponent />
      </div>
    </ContentWrapperComponent>
  );
}
