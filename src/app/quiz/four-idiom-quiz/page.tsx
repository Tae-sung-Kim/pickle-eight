import { Metadata } from 'next';
import { FourIdiomQuizComponent } from './components';
import { generateOgImageUrl } from '@/utils';

export const metadata: Metadata = {
  title: '사자성어 퀴즈 - AI 사자성어 퀴즈 게임',
  description:
    'AI가 출제하는 사자성어 퀴즈! 뜻을 보고 정답 4글자를 맞혀보세요. 난이도 선택, 힌트, 일일 제한 등 다양한 기능으로 재미있게 도전할 수 있습니다.',
  keywords: [
    '사자성어',
    '사자성어퀴즈',
    '사자성어게임',
    '사자성어퀴즈',
    'AI퀴즈',
    'AI사자성어',
    '사자성어학습',
    '사자성어테스트',
    '사자성어문제',
    '사자성어뜻',
    '사자성어공부',
    '사자성어AI',
    '사자성어맞히기',
    '사자성어퀴즈게임',
  ],
  openGraph: {
    title: '사자성어 퀴즈 - AI 사자성어 퀴즈 게임',
    description:
      'AI가 출제하는 사자성어 퀴즈! 뜻을 보고 정답 4글자를 맞혀보세요. 난이도, 힌트, 일일 제한 등 다양한 기능 제공!',
    url: process.env.NEXT_PUBLIC_SITE_URL + '/quiz/four-idiom-quiz',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
    images: [
      generateOgImageUrl(
        '사자성어 퀴즈 - AI 사자성어 퀴즈 게임',
        'AI가 출제하는 사자성어 퀴즈! 뜻을 보고 정답 4글자를 맞혀보세요. 난이도, 힌트, 일일 제한 등 다양한 기능 제공!',
        '사자성어 퀴즈'
      ),
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '사자성어 퀴즈 - AI 사자성어 퀴즈 게임',
    description:
      'AI가 출제하는 사자성어 퀴즈! 뜻을 보고 정답 4글자를 맞혀보세요.',
    images: [
      generateOgImageUrl(
        '사자성어 퀴즈 - AI 사자성어 퀴즈 게임',
        'AI가 출제하는 사자성어 퀴즈! 뜻을 보고 정답 4글자를 맞혀보세요. 난이도, 힌트, 일일 제한 등 다양한 기능 제공!',
        '사자성어 퀴즈'
      ),
    ],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL + '/quiz/four-idiom-quiz',
  },
};

export default function FourIdiomQuizPage() {
  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 py-8">
      <div className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl bg-white/90 p-8 relative">
        <FourIdiomQuizComponent />
      </div>
    </div>
  );
}
