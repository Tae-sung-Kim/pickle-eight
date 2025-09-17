import { TeamAssignmentComponent } from '@/app/random-picker/team-assignment/components/root.component';
import { BackHubPageComponent } from '@/components/back-hub.component';
import { ContentWrapperComponent } from '@/components/content-wrapper.component';
import { JsonLdComponent } from '@/components/shared/seo/json-ld.component';
import { MENU_GROUP_NAME_ENUM } from '@/constants/menu.constant';
import { canonicalUrl, jsonLdBreadcrumb, jsonLdWebSite } from '@/lib/seo';
import { generateOgImageUrl } from '@/utils/common.util';
import { getOgTag } from '@/utils/seo.util';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '팀 배정기 - 랜덤 팀 나누기/조 편성',
  description:
    '참가자 명단과 팀 개수를 입력하면, 랜덤으로 팀을 나누어주는 팀 배정기! 공정한 배정과 결과 공유(캡처/링크)를 지원합니다.',
  keywords: [
    '팀배정',
    '랜덤팀',
    '팀나누기',
    '조편성',
    '랜덤조',
    '팀분배',
    '팀추첨',
    '팀랜덤',
    '조추첨',
    '모임팀',
    '워크샵팀',
    '수업조',
    '게임팀',
    '공정팀배정',
    '랜덤분배',
  ],
  openGraph: {
    title: '팀 배정기 - 랜덤 팀 나누기/조 편성',
    description:
      '참가자 명단과 팀 개수를 입력하면, 랜덤으로 팀을 나누어주는 팀 배정기! 모임, 수업, 워크샵, 게임 등에서 공정하게 팀을 나눠보세요.',
    url:
      process.env.NEXT_PUBLIC_SITE_URL +
      `/${MENU_GROUP_NAME_ENUM.RANDOM_PICKER}/team-assignment`,
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
    images: [
      generateOgImageUrl(
        '팀 배정기 - 랜덤 팀 나누기/조 편성',
        '참가자 명단과 팀 개수를 입력하면, 랜덤으로 팀을 나누어주는 팀 배정기! 모임, 수업, 워크샵, 게임 등에서 공정하게 팀을 나눠보세요.',
        '팀 배정기',
        getOgTag({ label: '팀 배정' })
      ),
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '팀 배정기 - 랜덤 팀 나누기/조 편성',
    description:
      '참가자 명단과 팀 개수를 입력하면, 랜덤으로 팀을 나누어주는 팀 배정기! 모임, 수업, 워크샵, 게임 등에서 공정하게 팀을 나눠보세요.',
    images: [
      generateOgImageUrl(
        '팀 배정기 - 랜덤 팀 나누기/조 편성',
        '참가자 명단과 팀 개수를 입력하면, 랜덤으로 팀을 나누어주는 팀 배정기! 모임, 수업, 워크샵, 게임 등에서 공정하게 팀을 나눠보세요.',
        '팀 배정기'
      ),
    ],
  },
  alternates: {
    canonical:
      process.env.NEXT_PUBLIC_SITE_URL +
      `/${MENU_GROUP_NAME_ENUM.RANDOM_PICKER}/team-assignment`,
  },
  robots: { index: true, follow: true },
};

export default function TeamAssignmentPage() {
  const crumbs = jsonLdBreadcrumb([
    { name: 'Home', item: canonicalUrl('/') },
    {
      name: '랜덤 도구 허브',
      item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.RANDOM_PICKER}`),
    },
    {
      name: '팀 배정기',
      item: canonicalUrl(
        `/${MENU_GROUP_NAME_ENUM.RANDOM_PICKER}/team-assignment`
      ),
    },
  ]);
  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.RANDOM_PICKER}>
      <BackHubPageComponent type={MENU_GROUP_NAME_ENUM.RANDOM_PICKER} />
      <JsonLdComponent data={[jsonLdWebSite(), crumbs]} />
      <TeamAssignmentComponent />
    </ContentWrapperComponent>
  );
}
