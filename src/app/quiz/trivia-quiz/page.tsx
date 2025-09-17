import { TriviaQuizComponent } from '@/app/quiz/trivia-quiz/components/root.component';
import { BackHubPageComponent } from '@/components/back-hub.component';
import { ContentWrapperComponent } from '@/components/content-wrapper.component';
import { JsonLdComponent } from '@/components/shared/seo/json-ld.component';
import { TitleWrapperComponent } from '@/components/title-warpper.component';
import { MENU_GROUP_NAME_ENUM } from '@/constants/menu.constant';
import { canonicalUrl, jsonLdBreadcrumb, jsonLdWebSite } from '@/lib/seo';
import { generateOgImageUrl } from '@/utils/common.util';
import { getOgTag } from '@/utils/seo.util';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '상식 퀴즈 - AI 상식/지식 문제 풀기',
  description:
    'AI가 출제하는 상식/지식 퀴즈! 다양한 카테고리와 난이도로 오늘의 퀴즈에 도전해보세요. 크레딧 소모 없이 자유롭게 즐길 수 있습니다.',
  keywords: [
    '상식퀴즈',
    '지식퀴즈',
    'AI퀴즈',
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
      'AI가 출제하는 상식/지식 퀴즈! 다양한 카테고리와 난이도로 오늘의 퀴즈에 도전해보세요. 크레딧 없이 자유롭게 즐겨보세요.',
    url: process.env.NEXT_PUBLIC_SITE_URL + '/quiz/trivia-quiz',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
    images: [
      generateOgImageUrl(
        '상식 퀴즈 - AI 상식/지식 문제 풀기',
        'AI가 출제하는 상식/지식 퀴즈! 다양한 카테고리와 난이도로 오늘의 퀴즈에 도전해보세요. 크레딧 없이 자유롭게 즐겨보세요.',
        '상식 퀴즈',
        getOgTag({ href: `/${MENU_GROUP_NAME_ENUM.QUIZ}/trivia-quiz` })
      ),
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '상식 퀴즈 - AI 상식/지식 문제 풀기',
    description:
      'AI가 출제하는 상식/지식 퀴즈! 다양한 카테고리와 난이도로 오늘의 퀴즈에 도전해보세요. 크레딧 없이 자유롭게 즐겨보세요.',
    images: [
      generateOgImageUrl(
        '상식 퀴즈 - AI 상식/지식 문제 풀기',
        'AI가 출제하는 상식/지식 퀴즈! 다양한 카테고리와 난이도로 오늘의 퀴즈에 도전해보세요. 크레딧 없이 자유롭게 즐겨보세요.',
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
