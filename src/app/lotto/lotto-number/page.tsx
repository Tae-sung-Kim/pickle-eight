import { Metadata } from 'next';
import { LottoNumberComponent } from './components';
import { generateOgImageUrl } from '@/utils';
import {
  LottoWarningAlertComponent,
  JsonLd,
  ContentWrapperComponent,
  BackHubPageComponent,
} from '@/components';
import {
  buildMetadata,
  canonicalUrl,
  jsonLdBreadcrumb,
  jsonLdWebSite,
} from '@/lib';
import { MENU_GROUP_NAME_ENUM } from '@/constants';

const baseMeta = buildMetadata({
  title: '로또 번호 생성기 - 추천하는 행운의 번호',
  description:
    '추천하는 행운의 로또 번호로 당첨의 기회를 잡아보세요! 무작위 생성 및 통계 기반 추천 번호를 제공합니다.',
  pathname: `/${MENU_GROUP_NAME_ENUM.LOTTO}/lotto-number`,
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
    canonical: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.LOTTO}/lotto-number`),
  },
};

export default function LottoPage() {
  const crumbs = jsonLdBreadcrumb([
    { name: 'Home', item: canonicalUrl('/') },
    {
      name: '로또 허브',
      item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.LOTTO}`),
    },
    {
      name: '로또 번호 생성기',
      item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.LOTTO}/lotto-number`),
    },
  ]);

  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.LOTTO}>
      <BackHubPageComponent type={MENU_GROUP_NAME_ENUM.LOTTO} />
      <LottoWarningAlertComponent
        className="mt-4"
        tone="danger"
        includeAgeNotice
      />
      <JsonLd data={[jsonLdWebSite(), crumbs]} />
      <div className="mx-auto max-w-5xl p-4">
        <LottoNumberComponent />
      </div>
    </ContentWrapperComponent>
  );
}
