import { HomeMenuGridComponent } from './components';
import { Metadata } from 'next';
import { generateOgImageUrl } from '@/utils';

export const metadata: Metadata = {
  title: '홈 - 랜덤 추첨 · 게임 · 퀴즈 모음 | Pickle Eight',
  description:
    '로또, 이름 추첨, 자리 배정, 사다리, 주사위, 퀴즈 등 다양한 랜덤 도구를 한 곳에서 사용하세요.',
  keywords: ['랜덤', '추첨', '퀴즈', '게임', '도구 모음', '홈', 'pickle eight'],
  openGraph: {
    title: '홈 - 랜덤 추첨 · 게임 · 퀴즈 모음 | Pickle Eight',
    description:
      '로또, 이름 추첨, 자리 배정, 사다리, 주사위, 퀴즈 등 다양한 랜덤 도구를 한 곳에서 사용하세요.',
    url: process.env.NEXT_PUBLIC_SITE_URL + '/home',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
    images: [
      generateOgImageUrl(
        '홈 - 랜덤 추첨 · 게임 · 퀴즈 모음 | Pickle Eight',
        '로또, 이름 추첨, 자리 배정, 사다리, 주사위, 퀴즈 등 다양한 랜덤 도구를 한 곳에서 사용하세요.',
        '홈'
      ),
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '홈 - 랜덤 추첨 · 게임 · 퀴즈 모음 | Pickle Eight',
    description:
      '로또, 이름 추첨, 자리 배정, 사다리, 주사위, 퀴즈 등 다양한 랜덤 도구를 한 곳에서 사용하세요.',
    images: [
      generateOgImageUrl(
        '홈 - 랜덤 추첨 · 게임 · 퀴즈 모음 | Pickle Eight',
        '로또, 이름 추첨, 자리 배정, 사다리, 주사위, 퀴즈 등 다양한 랜덤 도구를 한 곳에서 사용하세요.',
        '홈'
      ),
    ],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL + '/home',
  },
};

export default function HomePage() {
  return <HomeMenuGridComponent />;
}
