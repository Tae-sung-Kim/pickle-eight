import { Metadata } from 'next';
import { FourIdiomQuizComponent } from './components';
import { generateOgImageUrl, getOgTag } from '@/utils';
import {
  BackHubPageComponent,
  ContentWrapperComponent,
  JsonLd,
  TitleWrapperComponent,
} from '@/components';
import { canonicalUrl, jsonLdBreadcrumb, jsonLdWebSite } from '@/lib';
import { MENU_GROUP_NAME_ENUM } from '@/constants';

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
    url:
      process.env.NEXT_PUBLIC_SITE_URL +
      `/${MENU_GROUP_NAME_ENUM.QUIZ}/four-idiom-quiz`,
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
    images: [
      generateOgImageUrl(
        '사자성어 퀴즈 - AI 사자성어 퀴즈 게임',
        'AI가 출제하는 사자성어 퀴즈! 뜻을 보고 정답 4글자를 맞혀보세요. 난이도, 힌트, 일일 제한 등 다양한 기능 제공!',
        '사자성어 퀴즈',
        getOgTag({ href: `/${MENU_GROUP_NAME_ENUM.QUIZ}/four-idiom-quiz` })
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
        '사자성어 퀴즈',
        getOgTag({ href: `/${MENU_GROUP_NAME_ENUM.QUIZ}/four-idiom-quiz` })
      ),
    ],
  },
  alternates: {
    canonical:
      process.env.NEXT_PUBLIC_SITE_URL +
      `/${MENU_GROUP_NAME_ENUM.QUIZ}/four-idiom-quiz`,
  },
  robots: { index: true, follow: true },
};

export default function FourIdiomQuizPage() {
  const crumbs = jsonLdBreadcrumb([
    { name: 'Home', item: canonicalUrl('/') },
    { name: '퀴즈 허브', item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.QUIZ}`) },
    {
      name: '사자성어 퀴즈',
      item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.QUIZ}/four-idiom-quiz`),
    },
  ]);

  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.QUIZ}>
      <BackHubPageComponent type={MENU_GROUP_NAME_ENUM.QUIZ} />
      {/* Hero */}
      <TitleWrapperComponent
        type={MENU_GROUP_NAME_ENUM.QUIZ}
        title="사자성어 퀴즈"
        description="뜻을 보고 정답 4글자를 맞혀보세요. 난이도 선택과 힌트 기능을 지원합니다."
      />
      {/* Content */}
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <JsonLd data={[jsonLdWebSite(), crumbs]} />
        <FourIdiomQuizComponent />
      </section>
    </ContentWrapperComponent>
  );
}
