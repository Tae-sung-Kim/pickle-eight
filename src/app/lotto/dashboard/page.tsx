import { LottoDashboardComponent } from '@/app/lotto/dashboard/components/root.component';
import { ContentWrapperComponent } from '@/components/content-wrapper.component';
import { JsonLdComponent } from '@/components/shared/seo/json-ld.component';
import { TitleWrapperComponent } from '@/components/title-warpper.component';
import { MENU_GROUP_NAME_ENUM } from '@/constants/menu.constant';
import {
  buildMetadata,
  canonicalUrl,
  jsonLdBreadcrumb,
  jsonLdWebSite,
} from '@/lib/seo';
import { generateOgImageUrl } from '@/utils/common.util';
import { getOgTag } from '@/utils/seo.util';
import type { Metadata } from 'next';

const baseMeta = buildMetadata({
  title: '로또 대시보드 - 나의 번호, 고급 생성기, 통계',
  description:
    '나의 번호 보관함, 자동 당첨 체크, 고급 제약 조건 생성, 핫/콜드/지연번호 트래커, 공정성 로그, 예산 트래커를 한 곳에서 관리합니다. 참고용 기능이며 당첨을 보장하지 않습니다.',
  pathname: `/${MENU_GROUP_NAME_ENUM.LOTTO}/dashboard`,
});

export const metadata: Metadata = {
  ...baseMeta,
  openGraph: {
    ...baseMeta.openGraph,
    images: [
      generateOgImageUrl(
        '로또 대시보드 | ' + (process.env.NEXT_PUBLIC_SITE_NAME as string),
        '나의 번호, 자동 당첨 체크, 고급 제약, 핫/콜드, 공정성 로그, 예산 트래커를 한 곳에서.',
        '로또 대시보드',
        getOgTag({ href: `/${MENU_GROUP_NAME_ENUM.LOTTO}/dashboard` })
      ),
    ],
  },
  twitter: {
    ...baseMeta.twitter,
    images: [
      generateOgImageUrl(
        '로또 대시보드 | ' + (process.env.NEXT_PUBLIC_SITE_NAME as string),
        '나의 번호, 자동 당첨 체크, 고급 제약, 핫/콜드, 공정성 로그, 예산 트래커를 한 곳에서.',
        '로또 대시보드',
        getOgTag({ href: `/${MENU_GROUP_NAME_ENUM.LOTTO}/dashboard` })
      ),
    ],
  },
};

export default function LottoDashboardPage() {
  const crumbs = jsonLdBreadcrumb([
    { name: 'Home', item: canonicalUrl('/') },
    {
      name: '로또 허브',
      item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.LOTTO}`),
    },
    {
      name: '로또 대시보드',
      item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.LOTTO}/dashboard`),
    },
  ]);

  const itemList = [
    {
      name: '나의 번호',
      url: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.LOTTO}/dashboard#my-numbers`),
    },
    {
      name: '고급 생성기',
      url: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.LOTTO}/dashboard#constraints`),
    },
    {
      name: '핫/콜드/지연',
      url: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.LOTTO}/dashboard#hot-cold`),
    },
    {
      name: '공정성 로그',
      url: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.LOTTO}/dashboard#fairness`),
    },
    {
      name: '예산 트래커',
      url: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.LOTTO}/dashboard#budget`),
    },
  ] as const;

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
                name: '대시보드에서 무엇을 할 수 있나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '나의 번호 보관, 자동 당첨 체크, 고급 제약 생성, 핫/콜드/지연 통계, 공정성 로그, 예산 관리까지 한 곳에서 이용할 수 있습니다. 모든 기능은 참고용이며 당첨을 보장하지 않습니다.',
                },
              },
              {
                '@type': 'Question',
                name: '데이터 출처는 무엇인가요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '로또 당첨 데이터는 서버 크론으로 동기화되어 Firestore(lotto_draws)에 저장된 값을 내부 API를 통해 조회합니다. 외부 API를 직접 호출하지 않습니다.',
                },
              },
              {
                '@type': 'Question',
                name: '공정성은 어떻게 보장하나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '번호 생성 시 RNG 유형, 필터, 클릭 횟수 등을 기록하고, 쿨다운 및 시간당 시도 제한을 적용합니다. 일부 로그는 개인 정보 보호를 위해 최소한으로 저장됩니다.',
                },
              },
            ],
          },
        ]}
      />
      <JsonLdComponent
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: itemList.map((it, idx) => ({
              '@type': 'ListItem',
              position: idx + 1,
              url: it.url,
              name: it.name,
            })),
          },
        ]}
      />

      <div className="mx-auto max-w-5xl p-8">
        <TitleWrapperComponent
          type={MENU_GROUP_NAME_ENUM.LOTTO}
          title="로또 대시보드"
          description="나의 번호, 자동 당첨 체크, 고급 제약, 핫/콜드/지연, 공정성 로그, 예산 트래커를 한 곳에서 관리하세요."
        />

        <LottoDashboardComponent />
      </div>
    </ContentWrapperComponent>
  );
}
