import { Metadata } from 'next';
import { NameRandomComponent } from './components';
import { generateOgImageUrl } from '@/utils';

export const metadata: Metadata = {
  title: '항목 랜덤 추첨기 - 이름/아이템 뽑기',
  description:
    '여러 항목(이름, 메뉴, 경품 등) 중에서 랜덤으로 하나를 뽑아주는 추첨기! 모임, 파티, 이벤트, 경품 추첨 등 다양한 상황에서 활용하세요.',
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
    '파티게임',
    '모임게임',
    '추첨기',
    '랜덤이벤트',
    '랜덤추천',
    '공정추첨',
  ],
  openGraph: {
    title: '항목 랜덤 추첨기 - 이름/아이템 뽑기',
    description:
      '여러 항목(이름, 메뉴, 경품 등) 중에서 랜덤으로 하나를 뽑아주는 추첨기! 모임, 파티, 이벤트, 경품 추첨 등 다양한 상황에서 활용하세요.',
    url: process.env.NEXT_PUBLIC_SITE_URL + '/random-picker/name-random',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
    images: [
      generateOgImageUrl(
        '항목 랜덤 추첨기 - 이름/아이템 뽑기',
        '여러 항목(이름, 메뉴, 경품 등) 중에서 랜덤으로 하나를 뽑아주는 추첨기! 모임, 파티, 이벤트, 경품 추첨 등 다양한 상황에서 활용하세요.',
        '항목 랜덤 추첨기'
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
        '항목 랜덤 추첨기'
      ),
    ],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL + '/random-picker/name-random',
  },
};

export default function NameRandomPage() {
  return <NameRandomComponent />;
}
