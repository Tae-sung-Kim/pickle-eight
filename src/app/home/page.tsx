import { HomeMenuGridComponent } from './components';
import { Metadata } from 'next';
import { generateOgImageUrl } from '@/utils';
import { buildMetadata, canonicalUrl } from '@/lib';

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
  return <HomeMenuGridComponent />;
}
