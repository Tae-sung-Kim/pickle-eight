import { Metadata } from 'next';
import { NumberMatchGameComponent } from './components';
import { generateOgImageUrl, getOgTag } from '@/utils';
import { JsonLd } from '@/components';
import { canonicalUrl, jsonLdBreadcrumb, jsonLdWebSite } from '@/lib';

export const metadata: Metadata = {
  title: '숫자 매칭 게임 - 기억력 테스트 두뇌 트레이닝',
  description:
    '숫자 카드 매칭 게임으로 두뇌 트레이닝을 해보세요! 기억력과 집중력을 향상시키는 재미있는 숫자 맞추기 게임입니다. 다양한 난이도로 도전해보세요!',
  keywords: [
    '숫자게임',
    '기억력게임',
    '두뇌트레이닝',
    '숫자매칭',
    '기억력테스트',
    '숫자카드게임',
    '두뇌개발게임',
    '기억력향상',
    '숫자맞추기',
    '두뇌훈련',
    '인지능력게임',
    '숫자기억게임',
    '두뇌활성화',
    '기억력훈련',
  ],
  openGraph: {
    title: '숫자 매칭 게임 - 기억력 테스트 두뇌 트레이닝',
    description:
      '숫자 카드 매칭 게임으로 두뇌 트레이닝을 해보세요! 기억력과 집중력을 향상시키는 재미있는 숫자 맞추기 게임입니다.',
    url: process.env.NEXT_PUBLIC_SITE_URL + '/quiz/number-match-game',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
    images: [
      generateOgImageUrl(
        '숫자 매칭 게임 - 기억력 테스트 두뇌 트레이닝',
        '숫자 카드 매칭 게임으로 두뇌 트레이닝을 해보세요! 기억력과 집중력을 향상시켜보세요!',
        '숫자 매칭 게임',
        getOgTag({ href: '/quiz/number-match-game' })
      ),
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '숫자 매칭 게임 - 기억력 테스트 두뇌 트레이닝',
    description:
      '숫자 카드 매칭 게임으로 두뇌 트레이닝을 해보세요! 기억력과 집중력을 향상시켜보세요!',
    images: [
      generateOgImageUrl(
        '숫자 매칭 게임 - 기억력 테스트 두뇌 트레이닝',
        '숫자 카드 매칭 게임으로 두뇌 트레이닝을 해보세요! 기억력과 집중력을 향상시켜보세요!',
        '숫자 매칭 게임',
        getOgTag({ href: '/quiz/number-match-game' })
      ),
    ],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL + '/quiz/number-match-game',
  },
  robots: { index: true, follow: true },
};

export default function NumberMatchGamePage() {
  const crumbs = jsonLdBreadcrumb([
    { name: 'Home', item: canonicalUrl('/') },
    { name: '퀴즈 허브', item: canonicalUrl('/quiz') },
    { name: '숫자 매칭 게임', item: canonicalUrl('/quiz/number-match-game') },
  ]);

  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-emerald-50 via-cyan-50 to-sky-50 py-8">
      <div className="w-full max-w-4xl space-y-8">
        <h1 className="text-center text-4xl font-bold tracking-tight">
          숫자 매칭 게임
        </h1>
        <JsonLd data={[jsonLdWebSite(), crumbs]} />
        <NumberMatchGameComponent />
      </div>
    </div>
  );
}
