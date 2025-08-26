import { generateOgImageUrl } from '@/utils';
import { TeamAssignmentComponent } from './components';
import { Metadata } from 'next';
import { ContentWrapperComponent, JsonLd } from '@/components';
import { canonicalUrl, jsonLdBreadcrumb, jsonLdWebSite } from '@/lib';

export const metadata: Metadata = {
  title: '팀 배정기 - 랜덤 팀 나누기/조 편성',
  description:
    '참가자 명단과 팀 개수를 입력하면, 랜덤으로 팀을 나누어주는 팀 배정기! 모임, 수업, 워크샵, 게임 등에서 공정하게 팀을 나눠보세요.',
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
    url: process.env.NEXT_PUBLIC_SITE_URL + '/random-picker/team-assignment',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
    images: [
      generateOgImageUrl(
        '팀 배정기 - 랜덤 팀 나누기/조 편성',
        '참가자 명단과 팀 개수를 입력하면, 랜덤으로 팀을 나누어주는 팀 배정기! 모임, 수업, 워크샵, 게임 등에서 공정하게 팀을 나눠보세요.',
        '팀 배정기'
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
      process.env.NEXT_PUBLIC_SITE_URL + '/random-picker/team-assignment',
  },
  robots: { index: true, follow: true },
};

export default function TeamAssignmentPage() {
  const crumbs = jsonLdBreadcrumb([
    { name: 'Home', item: canonicalUrl('/') },
    { name: '랜덤 도구 허브', item: canonicalUrl('/random-picker') },
    { name: '팀 배정기', item: canonicalUrl('/random-picker/team-assignment') },
  ]);
  return (
    <ContentWrapperComponent type="random">
      <JsonLd data={[jsonLdWebSite(), crumbs]} />
      <TeamAssignmentComponent />
    </ContentWrapperComponent>
  );
}
