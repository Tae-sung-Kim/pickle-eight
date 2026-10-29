import type { Metadata } from 'next';
import { MyNumbersComponent } from '@/app/lotto/my-numbers/components/my-numbers.component';
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

const PATHNAME = `/${MENU_GROUP_NAME_ENUM.LOTTO}/my-numbers`;

const baseMeta = buildMetadata({
  title: '나의 번호 보관함 - 저장 번호 자동 당첨 체크',
  description:
    '마음에 드는 로또 번호를 저장하면 저장 이후 추첨되는 회차와 자동으로 비교해 회차별 등수를 보여줍니다. 저장한 번호는 이 브라우저에만 보관되며, 참고용 기능이라 당첨을 보장하지 않습니다.',
  pathname: PATHNAME,
});

export const metadata: Metadata = {
  ...baseMeta,
  openGraph: {
    ...baseMeta.openGraph,
    images: [
      generateOgImageUrl(
        `나의 번호 보관함 | ${process.env.NEXT_PUBLIC_SITE_NAME as string}`,
        '저장한 번호를 최근 회차와 자동으로 비교해 등수를 확인하세요.',
        '나의 번호',
        getOgTag({ href: PATHNAME })
      ),
    ],
  },
  twitter: {
    ...baseMeta.twitter,
    images: [
      generateOgImageUrl(
        `나의 번호 보관함 | ${process.env.NEXT_PUBLIC_SITE_NAME as string}`,
        '저장한 번호를 최근 회차와 자동으로 비교해 등수를 확인하세요.',
        '나의 번호',
        getOgTag({ href: PATHNAME })
      ),
    ],
  },
};

export default function LottoMyNumbersPage() {
  const crumbs = jsonLdBreadcrumb([
    { name: 'Home', item: canonicalUrl('/') },
    {
      name: '로또 허브',
      item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.LOTTO}`),
    },
    { name: '나의 번호', item: canonicalUrl(PATHNAME) },
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
                name: '저장한 번호는 어디에 보관되나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '저장한 번호는 서버로 전송되지 않고 사용 중인 브라우저(localStorage)에만 보관됩니다. 브라우저 데이터를 삭제하거나 다른 기기에서 접속하면 볼 수 없습니다.',
                },
              },
              {
                '@type': 'Question',
                name: '자동 당첨 체크는 어떻게 동작하나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '번호를 저장하면 저장한 날 기준으로 아직 추첨 전인 이번 주 회차(토요일 판매 마감 20:00 이후에는 다음 회차)부터 적용됩니다. 그 회차 이후에 추첨된 당첨 번호와 비교해 회차별 등수를 보여주며, 저장 이전 회차와는 비교하지 않습니다. 당첨 데이터는 Supabase(lotto_draws)에 동기화된 값을 내부 API로 조회합니다. 모든 기능은 참고용이며 당첨을 보장하지 않습니다.',
                },
              },
            ],
          },
        ]}
      />

      <div className="mx-auto max-w-5xl p-8">
        <TitleWrapperComponent
          type={MENU_GROUP_NAME_ENUM.LOTTO}
          title="나의 번호"
          description="번호를 저장하면 저장 이후 추첨되는 회차와 자동으로 비교해 회차별 등수를 보여드려요. 번호 생성기에서 만든 번호도 바로 저장할 수 있습니다."
        />

        <MyNumbersComponent />
      </div>
    </ContentWrapperComponent>
  );
}
