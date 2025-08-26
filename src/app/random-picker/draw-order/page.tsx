import { Metadata } from 'next';
import { DrawOrderComponent } from './components';
import { generateOgImageUrl } from '@/utils';
import { ContentWrapperComponent, JsonLd } from '@/components';
import { canonicalUrl, jsonLdBreadcrumb, jsonLdWebSite } from '@/lib';

export const metadata: Metadata = {
  title: '랜덤 순서/상품 추첨기 - 공정한 매칭 뽑기',
  description:
    '참가자와 상품(번호)을 등록하면, 클릭으로 랜덤하게 순서 또는 상품을 추첨하는 공정한 매칭 추첨기! 실시간 공개, 애니메이션, 재추첨 등 다양한 기능 제공.',
  keywords: [
    '랜덤추첨',
    '순서추첨',
    '상품추첨',
    '랜덤매칭',
    '추첨기',
    '공정추첨',
    '랜덤뽑기',
    '파티게임',
    '모임게임',
    '랜덤순서',
    '경품추첨',
    '번호뽑기',
    '랜덤순서정하기',
    '랜덤상품배정',
  ],
  openGraph: {
    title: '랜덤 순서/상품 추첨기 - 공정한 매칭 뽑기',
    description:
      '참가자와 상품(번호)을 등록하면, 클릭으로 랜덤하게 순서 또는 상품을 추첨하는 공정한 매칭 추첨기! 실시간 공개, 애니메이션, 재추첨 등 다양한 기능 제공.',
    url: process.env.NEXT_PUBLIC_SITE_URL + '/random-picker/draw-order',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
    images: [
      generateOgImageUrl(
        '랜덤 순서/상품 추첨기 - 공정한 매칭 뽑기',
        '참가자와 상품(번호)을 등록하면, 클릭으로 랜덤하게 순서 또는 상품을 추첨하는 공정한 매칭 추첨기! 실시간 공개, 애니메이션, 재추첨 등 다양한 기능 제공.',
        '랜덤 순서/상품 추첨기'
      ),
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '랜덤 순서/상품 추첨기 - 공정한 매칭 뽑기',
    description:
      '참가자와 상품(번호)을 등록하면, 클릭으로 랜덤하게 순서 또는 상품을 추첨하는 공정한 매칭 추첨기! 실시간 공개, 애니메이션, 재추첨 등 다양한 기능 제공.',
    images: [
      generateOgImageUrl(
        '랜덤 순서/상품 추첨기 - 공정한 매칭 뽑기',
        '참가자와 상품(번호)을 등록하면, 클릭으로 랜덤하게 순서 또는 상품을 추첨하는 공정한 매칭 추첨기! 실시간 공개, 애니메이션, 재추첨 등 다양한 기능 제공.',
        '랜덤 순서/상품 추첨기'
      ),
    ],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL + '/random-picker/draw-order',
  },
  robots: { index: true, follow: true },
};

export default function DrawOrderPage() {
  const crumbs = jsonLdBreadcrumb([
    { name: 'Home', item: canonicalUrl('/') },
    { name: '랜덤 도구 허브', item: canonicalUrl('/random-picker') },
    {
      name: '랜덤 순서/상품 추첨기',
      item: canonicalUrl('/random-picker/draw-order'),
    },
  ]);
  return (
    <ContentWrapperComponent type="random">
      <JsonLd data={[jsonLdWebSite(), crumbs]} />
      <DrawOrderComponent />
    </ContentWrapperComponent>
  );
}
