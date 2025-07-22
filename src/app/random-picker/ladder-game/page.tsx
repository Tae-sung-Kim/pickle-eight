import { LadderGameComponent } from './components';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '사다리 타기 게임 - 랜덤 결과 추첨기',
  description:
    '참가자와 상품을 입력하면, 사다리 타기를 통해 랜덤하게 결과를 추첨합니다. 애니메이션, 실시간 결과 공개, 재시도 등 다양한 기능 제공!',
  keywords: [
    '사다리타기',
    '사다리게임',
    '랜덤추첨',
    '사다리추첨',
    '결과추첨',
    '사다리랜덤',
    '모임게임',
    '파티게임',
    '사다리타기추첨',
    '사다리매칭',
    '사다리결과',
    '사다리애니메이션',
    '랜덤매칭',
    '경품추첨',
    '상품추첨',
  ],
  openGraph: {
    title: '사다리 타기 게임 - 랜덤 결과 추첨기',
    description:
      '참가자와 상품을 입력하면, 사다리 타기를 통해 랜덤하게 결과를 추첨합니다. 애니메이션, 실시간 결과 공개, 재시도 등 다양한 기능 제공!',
    url: process.env.NEXT_PUBLIC_SITE_URL + '/random-picker/ladder-game',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
    // images: [
    //   {
    //     url: 'https://yourdomain.com/images/ladder-game-og.jpg',
    //     width: 1200,
    //     height: 630,
    //     alt: '사다리 타기 게임',
    //   },
    // ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '사다리 타기 게임 - 랜덤 결과 추첨기',
    description:
      '참가자와 상품을 입력하면, 사다리 타기를 통해 랜덤하게 결과를 추첨합니다. 애니메이션, 실시간 결과 공개, 재시도 등 다양한 기능 제공!',
    // images: ['https://yourdomain.com/images/ladder-game-twitter.jpg'],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL + '/random-picker/ladder-game',
  },
};

export default function LadderGamePage() {
  return <LadderGameComponent />;
}
