import { Metadata } from 'next';
import { LottoNumberComponent } from './components';
import { generateOgImageUrl } from '@/utils';
import { LottoWarningAlertComponent, JsonLd } from '@/components';
import Link from 'next/link';
import {
  buildMetadata,
  canonicalUrl,
  jsonLdBreadcrumb,
  jsonLdWebSite,
} from '@/lib';

const baseMeta = buildMetadata({
  title: '로또 번호 생성기 - 추천하는 행운의 번호',
  description:
    '추천하는 행운의 로또 번호로 당첨의 기회를 잡아보세요! 무작위 생성 및 통계 기반 추천 번호를 제공합니다.',
  pathname: '/lotto/lotto-number',
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
    canonical: canonicalUrl('/lotto/lotto-number'),
  },
};

export default function LottoPage() {
  const crumbs = jsonLdBreadcrumb([
    { name: 'Home', item: canonicalUrl('/') },
    { name: '로또 허브', item: canonicalUrl('/lotto') },
    { name: '로또 번호 생성기', item: canonicalUrl('/lotto/lotto-number') },
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <JsonLd data={[jsonLdWebSite(), crumbs]} />
      <div className="mb-2">
        <Link
          href="/lotto"
          className="text-sm text-muted-foreground hover:underline"
        >
          &larr; 로또 허브
        </Link>
      </div>
      <LottoWarningAlertComponent tone="danger" includeAgeNotice />
      <div className="mt-4">
        <LottoNumberComponent />
      </div>
    </div>
  );
}
