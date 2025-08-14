import { Metadata } from 'next';
import { EnglishWordQuizComponent } from './components';
import { generateOgImageUrl } from '@/utils';

export const metadata: Metadata = {
  title: 'AI 영어 단어 퀴즈 - 뜻 보고 단어 맞히기',
  description:
    '뜻을 보고 알맞은 영어 단어를 맞혀보는 퀴즈! 재미있게 단어 실력을 테스트하고 영어 실력을 키워보세요.',
  keywords: [
    '영어퀴즈',
    '영어단어퀴즈',
    '단어맞추기',
    '영어학습',
    '영어게임',
    '단어게임',
    '영단어',
    '퀴즈',
    'AI영어',
    'AI퀴즈',
  ],
  openGraph: {
    title: 'AI 영어 단어 퀴즈 - 뜻 보고 단어 맞히기',
    description:
      '뜻을 보고 알맞은 영어 단어를 맞혀보는 퀴즈! 재미있게 단어 실력을 테스트하고 영어 실력을 키워보세요.',
    url: process.env.NEXT_PUBLIC_SITE_URL + '/quiz/english-word-quiz',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
    images: [
      generateOgImageUrl(
        'AI 영어 단어 퀴즈 - 뜻 보고 단어 맞히기',
        '뜻을 보고 알맞은 영어 단어를 맞혀보는 퀴즈! 재미있게 단어 실력을 테스트하고 영어 실력을 키워보세요.',
        'AI 영어 단어 퀴즈'
      ),
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '영어 단어 퀴즈 - 뜻 보고 단어 맞히기',
    description:
      '뜻을 보고 알맞은 영어 단어를 맞혀보는 퀴즈! 재미있게 단어 실력을 테스트하고 영어 실력을 키워보세요.',
    images: [
      generateOgImageUrl(
        'AI 영어 단어 퀴즈 - 뜻 보고 단어 맞히기',
        '뜻을 보고 알맞은 영어 단어를 맞혀보는 퀴즈! 재미있게 단어 실력을 테스트하고 영어 실력을 키워보세요.',
        'AI 영어 단어 퀴즈'
      ),
    ],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL + '/quiz/english-word-quiz',
  },
};

export default function EnglishWordQuizPage() {
  return (
    <div className="flex flex-col items-center w-full bg-gray-50 p-4">
      <div className="w-full max-w-2xl mt-8 mb-20">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
          영어 단어 퀴즈
        </h1>
        <p className="text-center text-gray-500 mb-8">
          단어의 뜻을 보고 알맞은 영어 단어를 맞춰보세요!
        </p>
        <EnglishWordQuizComponent />
      </div>
    </div>
  );
}
