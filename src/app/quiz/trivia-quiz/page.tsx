import { Metadata } from 'next';
import { TriviaQuizComponent } from './components';
import { generateOgImageUrl, getOgTag } from '@/utils';
import {
  BackHubPageComponent,
  ContentWrapperComponent,
  JsonLdComponent,
  TitleWrapperComponent,
} from '@/components';
import { canonicalUrl, jsonLdBreadcrumb, jsonLdWebSite } from '@/lib';
import { MENU_GROUP_NAME_ENUM } from '@/constants';

export const metadata: Metadata = {
  title: '상식 퀴즈 - AI 상식/지식 문제 풀기',
  description:
    'AI가 출제하는 상식/지식 퀴즈! 다양한 카테고리와 난이도로 오늘의 퀴즈에 도전해보세요. 기본(BASIC) 모델은 무료이며, 상위 모델 선택 시 문제 생성 시점에 크레딧이 차감됩니다. 정답률, 일일 제한, 즉각 피드백 등 재미와 학습을 동시에!',
  keywords: [
    '상식퀴즈',
    '지식퀴즈',
    'AI퀴즈',
    'GPT 퀴즈',
    'GPT 모델 선택',
    '기본 모델 무료 퀴즈',
    '상식문제',
    '상식테스트',
    '퀴즈게임',
    'AI상식',
    'AI문제',
    '상식게임',
    'AI상식퀴즈',
    '상식AI',
    '상식공부',
    '상식카테고리',
    '퀴즈풀기',
  ],
  openGraph: {
    title: '상식 퀴즈 - AI 상식/지식 문제 풀기',
    description:
      'AI가 출제하는 상식/지식 퀴즈! 다양한 카테고리와 난이도로 오늘의 퀴즈에 도전해보세요.',
    url: process.env.NEXT_PUBLIC_SITE_URL + '/quiz/trivia-quiz',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
    images: [
      generateOgImageUrl(
        '상식 퀴즈 - AI 상식/지식 문제 풀기',
        'AI가 출제하는 상식/지식 퀴즈! 다양한 카테고리와 난이도로 오늘의 퀴즈에 도전해보세요.',
        '상식 퀴즈',
        getOgTag({ href: `/${MENU_GROUP_NAME_ENUM.QUIZ}/trivia-quiz` })
      ),
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '상식 퀴즈 - AI 상식/지식 문제 풀기',
    description:
      'AI가 출제하는 상식/지식 퀴즈! 다양한 카테고리와 난이도로 오늘의 퀴즈에 도전해보세요.',
    images: [
      generateOgImageUrl(
        '상식 퀴즈 - AI 상식/지식 문제 풀기',
        'AI가 출제하는 상식/지식 퀴즈! 다양한 카테고리와 난이도로 오늘의 퀴즈에 도전해보세요.',
        '상식 퀴즈',
        getOgTag({ href: `/${MENU_GROUP_NAME_ENUM.QUIZ}/trivia-quiz` })
      ),
    ],
  },
  alternates: {
    canonical:
      process.env.NEXT_PUBLIC_SITE_URL +
      `/${MENU_GROUP_NAME_ENUM.QUIZ}/trivia-quiz`,
  },
  robots: { index: true, follow: true },
};

export default function TriviaQuizPage() {
  const crumbs = jsonLdBreadcrumb([
    { name: 'Home', item: canonicalUrl('/') },
    { name: '퀴즈 허브', item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.QUIZ}`) },
    {
      name: '상식 퀴즈',
      item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.QUIZ}/trivia-quiz`),
    },
  ]);

  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.QUIZ}>
      <BackHubPageComponent type={MENU_GROUP_NAME_ENUM.QUIZ} />
      {/* Hero */}
      <TitleWrapperComponent
        type={MENU_GROUP_NAME_ENUM.QUIZ}
        title="상식/지식 퀴즈"
        description="다양한 카테고리와 난이도로 오늘의 퀴즈에 도전해보세요."
      />
      {/* Content */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <JsonLdComponent data={[jsonLdWebSite(), crumbs]} />
        <TriviaQuizComponent />
      </section>
    </ContentWrapperComponent>
  );
}
