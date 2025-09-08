import { Toaster } from 'sonner';
import HeroPage from './hero/page';
import HomePage from './home/page';
import { Metadata } from 'next';
import { generateOgImageUrl } from '@/utils';
import { JsonLdComponent } from '@/components';
import { buildMetadata, jsonLdWebSite } from '@/lib';

const baseMeta = buildMetadata({
  title: `${process.env.NEXT_PUBLIC_SITE_NAME} - 랜덤 추첨·로또·자리배정·퀴즈`,
  description:
    '로또 번호 생성/분석, 이름 추첨, 자리 배정, 사다리, 주사위, 퀴즈, 추천 등 다양한 랜덤 도구를 무료로 사용하세요.',
  pathname: '/',
});

export const metadata: Metadata = {
  ...baseMeta,
  openGraph: {
    ...baseMeta.openGraph,
    images: [
      generateOgImageUrl(
        `${process.env.NEXT_PUBLIC_SITE_NAME} - 랜덤 추첨·로또·자리배정·퀴즈`,
        '로또 번호 생성/분석, 이름 추첨, 자리 배정, 사다리, 주사위, 퀴즈, 추천 등 다양한 랜덤 도구를 무료로 사용하세요.',
        process.env.NEXT_PUBLIC_SITE_NAME as string
      ),
    ],
  },
  twitter: {
    ...baseMeta.twitter,
    images: [
      generateOgImageUrl(
        `${process.env.NEXT_PUBLIC_SITE_NAME} - 랜덤 추첨·로또·자리배정·퀴즈`,
        '로또 번호 생성/분석, 이름 추첨, 자리 배정, 사다리, 주사위, 퀴즈, 추천 등 다양한 랜덤 도구를 무료로 사용하세요.',
        process.env.NEXT_PUBLIC_SITE_NAME as string
      ),
    ],
  },
};

export default function RootPage() {
  return (
    <>
      <JsonLdComponent data={[jsonLdWebSite()]} />
      <JsonLdComponent
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: '로또 번호는 어떻게 생성되나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '로또 번호는 무작위 알고리즘으로 생성되며, 분석/추천 기능은 통계 기반 패턴을 참고용으로 제공합니다. 특정 당첨을 보장하지 않습니다.',
                },
              },
              {
                '@type': 'Question',
                name: '이름 추첨/자리 배정은 공정한가요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '동일 확률의 무작위 방식을 사용합니다. 클릭 시점과 횟수 등의 이벤트는 형평성 기록을 위해 저장될 수 있으며, 개인화 목적에는 사용하지 않습니다.',
                },
              },
              {
                '@type': 'Question',
                name: '내 정보는 저장되나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '핵심 기능 이용에 필수적이지 않은 개인정보 저장은 최소화하며, 비필수 분석/광고는 동의 기반으로만 실행됩니다. 자세한 내용은 개인정보처리방침을 참고하세요.',
                },
              },
            ],
          },
        ]}
      />
      <div className="bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 flex flex-col">
        <div className="max-w-8xl mx-auto w-full p-8">
          <HeroPage />
          <HomePage />
        </div>
        <Toaster />
      </div>
    </>
  );
}
