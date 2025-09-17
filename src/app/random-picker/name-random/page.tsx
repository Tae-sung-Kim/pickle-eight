import { NameRandomComponent } from '@/app/random-picker/name-random/components/root.component';
import { BackHubPageComponent } from '@/components/back-hub.component';
import { ContentWrapperComponent } from '@/components/content-wrapper.component';
import { JsonLdComponent } from '@/components/shared/seo/json-ld.component';
import { MENU_GROUP_NAME_ENUM } from '@/constants/menu.constant';
import { canonicalUrl, jsonLdBreadcrumb, jsonLdWebSite } from '@/lib/seo';
import { generateOgImageUrl } from '@/utils/common.util';
import { getOgTag } from '@/utils/seo.util';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '항목 랜덤 추첨기 - 이름/아이템 뽑기',
  description:
    '여러 항목(이름, 메뉴, 경품 등) 중에서 공정하게 랜덤 추첨! 클릭 한 번으로 캡처/링크 공유까지 지원합니다. 모임, 파티, 이벤트, 경품 추첨 등 다양한 상황에서 활용하세요.',
  keywords: [
    '랜덤추첨',
    '이름추첨',
    '항목추첨',
    '랜덤뽑기',
    '이름뽑기',
    '메뉴뽑기',
    '경품추첨',
    '아이템추첨',
    '랜덤선택',
    '공정추첨',
    '결과공유',
    '캡처공유',
    '링크공유',
    '파티게임',
    '모임게임',
    '추첨기',
    '랜덤이벤트',
    '랜덤추천',
  ],
  openGraph: {
    title: '항목 랜덤 추첨기 - 이름/아이템 뽑기',
    description:
      '여러 항목(이름, 메뉴, 경품 등) 중에서 랜덤으로 하나를 뽑아주는 추첨기! 모임, 파티, 이벤트, 경품 추첨 등 다양한 상황에서 활용하세요.',
    url:
      process.env.NEXT_PUBLIC_SITE_URL +
      `/${MENU_GROUP_NAME_ENUM.RANDOM_PICKER}/name-random`,
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
    images: [
      generateOgImageUrl(
        '항목 랜덤 추첨기 - 이름/아이템 뽑기',
        '여러 항목(이름, 메뉴, 경품 등) 중에서 랜덤으로 하나를 뽑아주는 추첨기! 모임, 파티, 이벤트, 경품 추첨 등 다양한 상황에서 활용하세요.',
        '항목 랜덤 추첨기',
        getOgTag({ label: '랜덤 추첨' })
      ),
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '항목 랜덤 추첨기 - 이름/아이템 뽑기',
    description:
      '여러 항목(이름, 메뉴, 경품 등) 중에서 랜덤으로 하나를 뽑아주는 추첨기! 모임, 파티, 이벤트, 경품 추첨 등 다양한 상황에서 활용하세요.',
    images: [
      generateOgImageUrl(
        '항목 랜덤 추첨기 - 이름/아이템 뽑기',
        '여러 항목(이름, 메뉴, 경품 등) 중에서 랜덤으로 하나를 뽑아주는 추첨기! 모임, 파티, 이벤트, 경품 추첨 등 다양한 상황에서 활용하세요.',
        '항목 랜덤 추첨기',
        getOgTag({ label: '랜덤 추첨' })
      ),
    ],
  },
  alternates: {
    canonical:
      process.env.NEXT_PUBLIC_SITE_URL +
      `/${MENU_GROUP_NAME_ENUM.RANDOM_PICKER}/name-random`,
  },
  robots: { index: true, follow: true },
};

export function NameRandomPage() {
  const crumbs = jsonLdBreadcrumb([
    { name: 'Home', item: canonicalUrl('/') },
    {
      name: '랜덤 도구 허브',
      item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.RANDOM_PICKER}`),
    },
    {
      name: '항목 랜덤 추첨기',
      item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.RANDOM_PICKER}/name-random`),
    },
  ]);
  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.RANDOM_PICKER}>
      <BackHubPageComponent type={MENU_GROUP_NAME_ENUM.RANDOM_PICKER} />
      <JsonLdComponent data={[jsonLdWebSite(), crumbs]} />
      <NameRandomComponent />
    </ContentWrapperComponent>
  );
}
