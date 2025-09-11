import { Metadata } from 'next';
import { LottoCheckComponent } from './components';
import {
  BackHubPageComponent,
  ContentWrapperComponent,
  TitleWrapperComponent,
  JsonLdComponent,
} from '@/components';
import { generateOgImageUrl, getOgTag } from '@/utils';
import { MENU_GROUP_NAME_ENUM } from '@/constants';
import { canonicalUrl, jsonLdBreadcrumb, jsonLdWebSite } from '@/lib';

export const metadata: Metadata = {
  title: '로또 번호 채점기 - 당첨 등수 확인',
  description:
    '회차 번호와 선택한 6개 번호를 입력해 당첨 등수를 빠르게 확인하세요. 실시간 채점과 결과 요약을 제공합니다.',
  keywords: ['로또', '로또채점', '로또번호확인', '로또당첨확인', '로또조회'],
  openGraph: {
    title: '로또 번호 채점기 - 당첨 등수 확인',
    description:
      '회차 번호와 선택한 6개 번호를 입력해 당첨 등수를 빠르게 확인하세요. 실시간 채점과 결과 요약을 제공합니다.',
    url:
      process.env.NEXT_PUBLIC_SITE_URL + `/${MENU_GROUP_NAME_ENUM.LOTTO}/check`,
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    images: [
      generateOgImageUrl(
        '로또 번호 채점기 - 당첨 등수 확인',
        '회차 번호와 선택한 6개 번호를 입력해 당첨 등수를 빠르게 확인하세요. 실시간 채점과 결과 요약을 제공합니다.',
        '로또 번호 채점기',
        getOgTag({ label: '채점기' })
      ),
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '로또 번호 채점기 - 당첨 등수 확인',
    description:
      '회차 번호와 선택한 6개 번호를 입력해 당첨 등수를 빠르게 확인하세요. 실시간 채점과 결과 요약을 제공합니다.',
    images: [
      generateOgImageUrl(
        '로또 번호 채점기 - 당첨 등수 확인',
        '회차 번호와 선택한 6개 번호를 입력해 당첨 등수를 빠르게 확인하세요. 실시간 채점과 결과 요약을 제공합니다.',
        '로또 번호 채점기',
        getOgTag({ label: '채점기' })
      ),
    ],
  },
  alternates: {
    canonical:
      process.env.NEXT_PUBLIC_SITE_URL + `${MENU_GROUP_NAME_ENUM.LOTTO}/check`,
  },
};

export default function LottoCheckPage() {
  const crumbs = jsonLdBreadcrumb([
    { name: 'Home', item: canonicalUrl('/') },
    { name: '로또 허브', item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.LOTTO}`) },
    {
      name: '로또 번호 채점기',
      item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.LOTTO}/check`),
    },
  ]);
  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.LOTTO}>
      <JsonLdComponent data={[jsonLdWebSite(), crumbs]} />
      <BackHubPageComponent type={MENU_GROUP_NAME_ENUM.LOTTO} />

      <div className="mx-auto max-w-5xl p-8">
        <TitleWrapperComponent
          type={MENU_GROUP_NAME_ENUM.LOTTO}
          title="로또 번호 채점기"
          description="회차 번호와 선택한 6개 번호를 입력해 당첨 등수를 확인하세요."
        />

        <LottoCheckComponent />
      </div>
    </ContentWrapperComponent>
  );
}
