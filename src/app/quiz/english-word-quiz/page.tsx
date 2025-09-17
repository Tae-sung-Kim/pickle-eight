import { EnglishWordQuizComponent } from "@/app/quiz/english-word-quiz/components/root.component";
import { BackHubPageComponent } from "@/components/back-hub.component";
import { ContentWrapperComponent } from "@/components/content-wrapper.component";
import { TitleWrapperComponent } from "@/components/title-warpper.component";
import { MENU_GROUP_NAME_ENUM } from "@/constants/menu.constant";
import { generateOgImageUrl } from "@/utils/common.util";
import { getOgTag } from "@/utils/seo.util";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI 영어 단어 퀴즈 - 뜻 보고 단어 맞히기',
  description:
    '뜻을 보고 알맞은 영어 단어를 맞혀보는 퀴즈! 크레딧 소모 없이 자유롭게 즐기며 단어 실력을 테스트해 보세요.',
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
  ],
  openGraph: {
    title: 'AI 영어 단어 퀴즈 - 뜻 보고 단어 맞히기',
    description:
      '뜻을 보고 알맞은 영어 단어를 맞혀보는 퀴즈! 크레딧 소모 없이 자유롭게 즐겨보세요.',
    url:
      process.env.NEXT_PUBLIC_SITE_URL +
      `/${MENU_GROUP_NAME_ENUM.QUIZ}/english-word-quiz`,
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
    images: [
      generateOgImageUrl(
        'AI 영어 단어 퀴즈 - 뜻 보고 단어 맞히기',
        '뜻을 보고 알맞은 영어 단어를 맞혀보는 퀴즈! 크레딧 없이 자유롭게 즐겨보세요.',
        'AI 영어 단어 퀴즈',
        getOgTag({ href: `/${MENU_GROUP_NAME_ENUM.QUIZ}/english-word-quiz` })
      ),
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '영어 단어 퀴즈 - 뜻 보고 단어 맞히기',
    description:
      '뜻을 보고 알맞은 영어 단어를 맞혀보는 퀴즈! 크레딧 없이 자유롭게 즐겨보세요.',
    images: [
      generateOgImageUrl(
        'AI 영어 단어 퀴즈 - 뜻 보고 단어 맞히기',
        '뜻을 보고 알맞은 영어 단어를 맞혀보는 퀴즈! 크레딧 없이 자유롭게 즐겨보세요.',
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

export function EnglishWordQuizPage() {
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
