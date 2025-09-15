import { HomeMenuGridComponent } from './components';
import { Metadata } from 'next';
import { generateOgImageUrl } from '@/utils';
import {
  buildMetadata,
  canonicalUrl,
  jsonLdBreadcrumb,
  jsonLdWebSite,
} from '@/lib';
import { JsonLdComponent } from '@/components';

const baseMeta = buildMetadata({
  title: '홈 - 랜덤 추첨 · 게임 · 퀴즈 모음',
  description:
    '로또, 이름 추첨, 자리 배정, 사다리, 주사위, 퀴즈 등 다양한 랜덤 도구를 한 곳에서 사용하세요.',
  pathname: '/home',
});

export const metadata: Metadata = {
  ...baseMeta,
  openGraph: {
    ...baseMeta.openGraph,
    images: [
      generateOgImageUrl(
        '홈 - 랜덤 추첨 · 게임 · 퀴즈 모음',
        '로또, 이름 추첨, 자리 배정, 사다리, 주사위, 퀴즈 등 다양한 랜덤 도구를 한 곳에서 사용하세요.',
        '홈'
      ),
    ],
  },
  twitter: {
    ...baseMeta.twitter,
    images: [
      generateOgImageUrl(
        '홈 - 랜덤 추첨 · 게임 · 퀴즈 모음',
        '로또, 이름 추첨, 자리 배정, 사다리, 주사위, 퀴즈 등 다양한 랜덤 도구를 한 곳에서 사용하세요.',
        '홈'
      ),
    ],
  },
  alternates: {
    ...baseMeta.alternates,
    canonical: canonicalUrl('/home'),
  },
};

export default function HomePage() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || '운빨연구소';
  const crumbs = jsonLdBreadcrumb([
    { name: siteName, item: canonicalUrl('/') },
    { name: '홈', item: canonicalUrl('/home') },
  ]);
  return (
    <>
      <JsonLdComponent data={[jsonLdWebSite(), crumbs]} />
      <HomeMenuGridComponent />
    </>
  );
}
