import { generateOgImageUrl } from '@/utils';
import { DiceGameComponent } from './components';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '주사위 게임 - 랜덤 주사위 추첨기',
  description:
    '여러 명이 함께 즐기는 랜덤 주사위 게임! 참가자 추가, 애니메이션 주사위 굴리기, 더블 효과, 공동 우승 등 재미있는 기능을 제공합니다.',
  keywords: [
    '주사위',
    '주사위게임',
    '랜덤주사위',
    '주사위추첨',
    '주사위돌리기',
    '더블주사위',
    '주사위애니메이션',
    '랜덤게임',
    '모임게임',
    '파티게임',
    '주사위우승자',
    '주사위공동우승',
    '주사위추첨기',
  ],
  openGraph: {
    title: '주사위 게임 - 랜덤 주사위 추첨기',
    description:
      '여러 명이 함께 즐기는 랜덤 주사위 게임! 참가자 추가, 애니메이션 주사위 굴리기, 더블 효과, 공동 우승 등 재미있는 기능을 제공합니다.',
    url: process.env.NEXT_PUBLIC_SITE_URL + '/random-picker/dice-game',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
    images: [
      generateOgImageUrl(
        '주사위 게임 - 랜덤 주사위 추첨기',
        '여러 명이 함께 즐기는 랜덤 주사위 게임! 참가자 추가, 애니메이션 주사위 굴리기, 더블 효과, 공동 우승 등 재미있는 기능을 제공합니다.',
        '주사위 게임'
      ),
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '주사위 게임 - 랜덤 주사위 추첨기',
    description:
      '여러 명이 함께 즐기는 랜덤 주사위 게임! 참가자 추가, 애니메이션 주사위 굴리기, 더블 효과, 공동 우승 등 재미있는 기능을 제공합니다.',
    images: [
      generateOgImageUrl(
        '주사위 게임 - 랜덤 주사위 추첨기',
        '여러 명이 함께 즐기는 랜덤 주사위 게임! 참가자 추가, 애니메이션 주사위 굴리기, 더블 효과, 공동 우승 등 재미있는 기능을 제공합니다.',
        '주사위 게임'
      ),
    ],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL + '/random-picker/dice-game',
  },
};

export default function DiceGamePage() {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <DiceGameComponent />
    </div>
  );
}
