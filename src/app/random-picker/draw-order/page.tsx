import { Metadata } from 'next';
import { DrawOrderComponent } from './components';

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
    // images: [
    //   {
    //     url: 'https://yourdomain.com/images/draw-order-og.jpg',
    //     width: 1200,
    //     height: 630,
    //     alt: '랜덤 추첨기',
    //   },
    // ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '랜덤 순서/상품 추첨기 - 공정한 매칭 뽑기',
    description:
      '참가자와 상품(번호)을 등록하면, 클릭으로 랜덤하게 순서 또는 상품을 추첨하는 공정한 매칭 추첨기! 실시간 공개, 애니메이션, 재추첨 등 다양한 기능 제공.',
    // images: ['https://yourdomain.com/images/draw-order-twitter.jpg'],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL + '/random-picker/draw-order',
  },
};

export default function DrawOrderPage() {
  return <DrawOrderComponent />;
}
