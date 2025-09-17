import { LottoNormalGeneratorComponent } from '@/app/lotto/normal-generator/components/root.component';
import { BackHubPageComponent } from '@/components/back-hub.component';
import { ContentWrapperComponent } from '@/components/content-wrapper.component';
import { JsonLdComponent } from '@/components/shared/seo/json-ld.component';
import { MENU_GROUP_NAME_ENUM } from '@/constants/menu.constant';
import {
  buildMetadata,
  canonicalUrl,
  jsonLdBreadcrumb,
  jsonLdWebSite,
} from '@/lib/seo';
import { generateOgImageUrl } from '@/utils/common.util';
import { Metadata } from 'next';

const baseMeta = buildMetadata({
  title: '로또 번호 생성기 - 추천하는 행운의 번호',
  description:
    '추천하는 행운의 로또 번호로 당첨의 기회를 잡아보세요! 무작위 생성 및 통계 기반 추천 번호를 제공합니다.',
  pathname: `/${MENU_GROUP_NAME_ENUM.LOTTO}/normal-generator`,
});

export const metadata: Metadata = {
  ...baseMeta,
  openGraph: {
    ...baseMeta.openGraph,
    images: [
      generateOgImageUrl(
        '로또 번호 생성기 - 추천하는 행운의 번호',
        '추천하는 행운의 로또 번호로 당첨의 기회를 잡아보세요!',
        '로또 번호 생성기'
      ),
    ],
  },
  twitter: {
    ...baseMeta.twitter,
    images: [
      generateOgImageUrl(
        '로또 번호 생성기 - 추천하는 행운의 번호',
        '추천하는 행운의 로또 번호로 당첨의 기회를 잡아보세요!',
        '로또 번호 생성기'
      ),
    ],
  },
  alternates: {
    canonical: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.LOTTO}/normal-generator`),
  },
};

export function LottoPage() {
  const crumbs = jsonLdBreadcrumb([
    { name: 'Home', item: canonicalUrl('/') },
    {
      name: '로또 허브',
      item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.LOTTO}`),
    },
    {
      name: '로또 번호 생성기',
      item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.LOTTO}/normal-generator`),
    },
  ]);

  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.LOTTO}>
      <BackHubPageComponent type={MENU_GROUP_NAME_ENUM.LOTTO} />

      <JsonLdComponent data={[jsonLdWebSite(), crumbs]} />
      <div className="mx-auto max-w-5xl p-8">
        <LottoNormalGeneratorComponent />
      </div>
    </ContentWrapperComponent>
  );
}
