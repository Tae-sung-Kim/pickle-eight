import { generateOgImageUrl } from '@/utils';
import { SeatAssignmentComponent } from './components';
import { Metadata } from 'next';
import {
  BackHubPageComponent,
  ContentWrapperComponent,
  JsonLdComponent,
} from '@/components';
import { canonicalUrl, jsonLdBreadcrumb, jsonLdWebSite } from '@/lib';
import { MENU_GROUP_NAME_ENUM } from '@/constants';

export const metadata: Metadata = {
  title: '자리 배정기 - 랜덤 좌석/자리 배정',
  description:
    '참가자와 자리 수를 입력하면, 랜덤으로 좌석을 배정해주는 자리 배정기! 모임, 파티, 행사 등에서 공정하게 자리를 정하세요.',
  keywords: [
    '자리배정',
    '랜덤자리',
    '좌석배정',
    '자리추첨',
    '랜덤배정',
    '모임자리',
    '파티자리',
    '행사자리',
    '자리정하기',
    '좌석정하기',
    '랜덤게임',
    '자리배정기',
    '좌석추첨',
    '공정배정',
    '랜덤좌석',
  ],
  openGraph: {
    title: '자리 배정기 - 랜덤 좌석/자리 배정',
    description:
      '참가자와 자리 수를 입력하면, 랜덤으로 좌석을 배정해주는 자리 배정기! 모임, 파티, 행사 등에서 공정하게 자리를 정하세요.',
    url:
      process.env.NEXT_PUBLIC_SITE_URL +
      `/${MENU_GROUP_NAME_ENUM.RANDOM_PICKER}/seat-assignment`,
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
    images: [
      generateOgImageUrl(
        '자리 배정기 - 랜덤 좌석/자리 배정',
        '참가자와 자리 수를 입력하면, 랜덤으로 좌석을 배정해주는 자리 배정기! 모임, 파티, 행사 등에서 공정하게 자리를 정하세요.',
        '자리 배정기'
      ),
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '자리 배정기 - 랜덤 좌석/자리 배정',
    description:
      '참가자와 자리 수를 입력하면, 랜덤으로 좌석을 배정해주는 자리 배정기! 모임, 파티, 행사 등에서 공정하게 자리를 정하세요.',
    images: [
      generateOgImageUrl(
        '자리 배정기 - 랜덤 좌석/자리 배정',
        '참가자와 자리 수를 입력하면, 랜덤으로 좌석을 배정해주는 자리 배정기! 모임, 파티, 행사 등에서 공정하게 자리를 정하세요.',
        '자리 배정기'
      ),
    ],
  },
  alternates: {
    canonical:
      process.env.NEXT_PUBLIC_SITE_URL +
      `/${MENU_GROUP_NAME_ENUM.RANDOM_PICKER}/seat-assignment`,
  },
  robots: { index: true, follow: true },
};

export default function SeatAssignmentPage() {
  const crumbs = jsonLdBreadcrumb([
    { name: 'Home', item: canonicalUrl('/') },
    {
      name: '랜덤 도구 허브',
      item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.RANDOM_PICKER}`),
    },
    {
      name: '자리 배정기',
      item: canonicalUrl(
        `/${MENU_GROUP_NAME_ENUM.RANDOM_PICKER}/seat-assignment`
      ),
    },
  ]);
  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.RANDOM_PICKER}>
      <BackHubPageComponent type={MENU_GROUP_NAME_ENUM.RANDOM_PICKER} />
      <JsonLdComponent data={[jsonLdWebSite(), crumbs]} />
      <SeatAssignmentComponent />
    </ContentWrapperComponent>
  );
}
