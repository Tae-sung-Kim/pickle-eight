import { LottoHistoryComponent } from './components';
import { Metadata } from 'next';
import { generateOgImageUrl } from '@/utils';
import {
  BackHubPageComponent,
  ContentWrapperComponent,
  LottoWarningAlertComponent,
  TitleWrapperComponent,
  JsonLd,
} from '@/components';
import { LOTTO_WARNING_TONE_ENUM, MENU_GROUP_NAME_ENUM } from '@/constants';
import { canonicalUrl, jsonLdBreadcrumb, jsonLdWebSite } from '@/lib';

export const metadata: Metadata = {
  title: '로또 당첨 결과 히스토리 - 회차별 당첨번호 조회',
  description:
    '회차별 로또 당첨번호와 보너스 번호, 1등 당첨 인원 등 기록을 범위로 조회하세요. 최신 회차 기준으로 빠르게 확인할 수 있습니다.',
  keywords: [
    '로또',
    '로또히스토리',
    '로또당첨결과',
    '로또당첨번호',
    '로또조회',
  ],
  openGraph: {
    title: '로또 당첨 결과 히스토리 - 회차별 당첨번호 조회',
    description:
      '회차별 로또 당첨번호와 보너스 번호, 1등 당첨 인원 등 기록을 범위로 조회하세요.',
    url:
      process.env.NEXT_PUBLIC_SITE_URL +
      `/${MENU_GROUP_NAME_ENUM.LOTTO}/history`,
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    images: [
      generateOgImageUrl(
        '로또 당첨 결과 히스토리 - 회차별 당첨번호 조회',
        '회차별 로또 당첨번호와 보너스 번호, 1등 당첨 인원 등 기록을 범위로 조회하세요.',
        '로또 당첨 결과 히스토리'
      ),
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '로또 당첨 결과 히스토리 - 회차별 당첨번호 조회',
    description:
      '회차별 로또 당첨번호와 보너스 번호, 1등 당첨 인원 등 기록을 범위로 조회하세요.',
    images: [
      generateOgImageUrl(
        '로또 당첨 결과 히스토리 - 회차별 당첨번호 조회',
        '회차별 로또 당첨번호와 보너스 번호, 1등 당첨 인원 등 기록을 범위로 조회하세요.',
        '로또 당첨 결과 히스토리'
      ),
    ],
  },
  alternates: {
    canonical:
      process.env.NEXT_PUBLIC_SITE_URL +
      `/${MENU_GROUP_NAME_ENUM.LOTTO}/history`,
  },
};

export default function LottoHistoryPage() {
  const crumbs = jsonLdBreadcrumb([
    { name: 'Home', item: canonicalUrl('/') },
    { name: '로또 허브', item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.LOTTO}`) },
    {
      name: '로또 당첨 결과 히스토리',
      item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.LOTTO}/history`),
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

      <div className="mx-auto max-w-5xl py-4 p-4">
        <TitleWrapperComponent
          type={MENU_GROUP_NAME_ENUM.LOTTO}
          title="로또 당첨 결과 히스토리"
          description="회차 범위를 입력해 조회하세요."
        />

        <LottoHistoryComponent />
      </div>
    </ContentWrapperComponent>
  );
}
