import { Metadata } from 'next';
import { FourIdiomQuizComponent } from './components';
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
  title: '사자성어 퀴즈 - AI 사자성어 퀴즈 게임',
  description:
    'AI가 출제하는 사자성어 퀴즈! 뜻을 보고 정답 4글자를 맞혀보세요. 기본(BASIC) 모델은 무료이며, 상위 모델 선택 시 문제 생성 시점에 크레딧이 차감됩니다. 난이도 선택, 힌트, 일일 제한 등 다양한 기능으로 재미있게 도전할 수 있습니다.',
  keywords: [
    '사자성어퀴즈',
    '사자성어 게임',
    '한자성어 퀴즈',
    'AI퀴즈',
    'GPT 퀴즈',
    'GPT 모델 선택',
    '기본 모델 무료 퀴즈',
    '사자성어',
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
        getOgTag({ label: 'AI 퀴즈 (BASIC 무료)' })
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
        getOgTag({ label: 'AI 퀴즈 (BASIC 무료)' })
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
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <JsonLdComponent data={[jsonLdWebSite(), crumbs]} />
        <FourIdiomQuizComponent />
      </section>
    </ContentWrapperComponent>
  );
}
