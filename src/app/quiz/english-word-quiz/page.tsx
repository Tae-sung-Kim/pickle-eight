import { Metadata } from 'next';
import { EnglishWordQuizComponent } from './components';
import { generateOgImageUrl, getOgTag } from '@/utils';
import {
  BackHubPageComponent,
  ContentWrapperComponent,
  TitleWrapperComponent,
} from '@/components';
import { MENU_GROUP_NAME_ENUM } from '@/constants';

export const metadata: Metadata = {
  title: 'AI 영어 단어 퀴즈 - 뜻 보고 단어 맞히기',
  description:
    '뜻을 보고 알맞은 영어 단어를 맞혀보는 퀴즈! 기본(BASIC) 모델은 무료이며, 상위 모델 선택 시 문제 생성 시점에 크레딧이 차감됩니다. 재미있게 단어 실력을 테스트하고 영어 실력을 키워보세요.',
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
    'GPT 퀴즈',
    'GPT 모델 선택',
    '기본 모델 무료 퀴즈',
  ],
  openGraph: {
    title: 'AI 영어 단어 퀴즈 - 뜻 보고 단어 맞히기',
    description:
      '뜻을 보고 알맞은 영어 단어를 맞혀보는 퀴즈! 기본(BASIC) 무료, 상위 모델 선택 시 문제 생성 시점 차감.',
    url:
      process.env.NEXT_PUBLIC_SITE_URL +
      `/${MENU_GROUP_NAME_ENUM.QUIZ}/english-word-quiz`,
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
    images: [
      generateOgImageUrl(
        'AI 영어 단어 퀴즈 - 뜻 보고 단어 맞히기',
        '뜻을 보고 알맞은 영어 단어를 맞혀보는 퀴즈! 재미있게 단어 실력을 테스트하고 영어 실력을 키워보세요.',
        'AI 영어 단어 퀴즈',
        getOgTag({ href: `/${MENU_GROUP_NAME_ENUM.QUIZ}/english-word-quiz` })
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
        'AI 영어 단어 퀴즈',
        getOgTag({ href: `/${MENU_GROUP_NAME_ENUM.QUIZ}/english-word-quiz` })
      ),
    ],
  },
  alternates: {
    canonical:
      process.env.NEXT_PUBLIC_SITE_URL +
      `/${MENU_GROUP_NAME_ENUM.QUIZ}/english-word-quiz`,
  },
};

export default function EnglishWordQuizPage() {
  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.QUIZ}>
      <BackHubPageComponent type={MENU_GROUP_NAME_ENUM.QUIZ} />
      {/* Hero */}
      <TitleWrapperComponent
        type={MENU_GROUP_NAME_ENUM.QUIZ}
        title="영어 단어 퀴즈"
        description="단어의 뜻을 보고 알맞은 영어 단어를 맞춰보세요!"
      />

      {/* Content */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="mt-2">
          <EnglishWordQuizComponent />
        </div>
      </section>
    </ContentWrapperComponent>
  );
}
