import { generateOgImageUrl } from '@/utils';
import { DiceGameComponent } from './components';
import { Metadata } from 'next';
import {
  BackHubPageComponent,
  ContentWrapperComponent,
  JsonLdComponent,
} from '@/components';
import { canonicalUrl, jsonLdBreadcrumb, jsonLdWebSite } from '@/lib';
import { MENU_GROUP_NAME_ENUM } from '@/constants';

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
    url:
      process.env.NEXT_PUBLIC_SITE_URL +
      `/${MENU_GROUP_NAME_ENUM.RANDOM_PICKER}/dice-game`,
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
    canonical:
      process.env.NEXT_PUBLIC_SITE_URL +
      `/${MENU_GROUP_NAME_ENUM.RANDOM_PICKER}/dice-game`,
  },
  robots: { index: true, follow: true },
};

export default function DiceGamePage() {
  const crumbs = jsonLdBreadcrumb([
    { name: 'Home', item: canonicalUrl('/') },
    {
      name: '랜덤 도구 허브',
      item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.RANDOM_PICKER}`),
    },
    {
      name: '주사위 게임',
      item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.RANDOM_PICKER}/dice-game`),
    },
  ]);
  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.RANDOM_PICKER}>
      <BackHubPageComponent type={MENU_GROUP_NAME_ENUM.RANDOM_PICKER} />
      <JsonLdComponent data={[jsonLdWebSite(), crumbs]} />
      <DiceGameComponent />
    </ContentWrapperComponent>
  );
}
