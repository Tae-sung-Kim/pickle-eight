import type { Metadata } from 'next';
import Link from 'next/link';
import { MENU_LIST } from '@/constants/menu.constant';
import { JsonLd } from '@/components';
import {
  buildMetadata,
  canonicalUrl,
  jsonLdBreadcrumb,
  jsonLdWebSite,
} from '@/lib';
import { generateOgImageUrl, getOgTag } from '@/utils';

const baseMeta = buildMetadata({
  title: '퀴즈 허브 - AI 퀴즈/게임 모음',
  description:
    'AI 기반 퀴즈와 게임을 한 곳에서: 영어 단어, 상식 퀴즈, 사자성어, 숫자 매칭 등.',
  pathname: '/quiz',
});

export const metadata: Metadata = {
  ...baseMeta,
  openGraph: {
    ...baseMeta.openGraph,
    images: [
      generateOgImageUrl(
        '퀴즈 허브 - AI 퀴즈/게임 모음 | Pickle Eight',
        'AI 기반 퀴즈와 게임을 한 곳에서: 영어 단어, 상식 퀴즈, 사자성어, 숫자 매칭 등.',
        '퀴즈 허브',
        getOgTag({ href: '/quiz' })
      ),
    ],
  },
  twitter: {
    ...baseMeta.twitter,
    images: [
      generateOgImageUrl(
        '퀴즈 허브 - AI 퀴즈/게임 모음 | Pickle Eight',
        'AI 기반 퀴즈와 게임을 한 곳에서: 영어 단어, 상식 퀴즈, 사자성어, 숫자 매칭 등.',
        '퀴즈 허브',
        getOgTag({ href: '/quiz' })
      ),
    ],
  },
};

export default function QuizHubPage() {
  const quizItems = (
    MENU_LIST.find((g) => g.group === 'quiz')?.items ?? []
  ).map((it) => ({ href: it.href, label: it.label, desc: it.description }));

  const crumbs = jsonLdBreadcrumb([
    { name: 'Home', item: canonicalUrl('/') },
    { name: '퀴즈 허브', item: canonicalUrl('/quiz') },
  ]);

  const theme = {
    ring: 'ring-violet-200',
    hoverRing: 'hover:ring-violet-300',
    headerBadge: 'bg-violet-50 text-violet-700 ring-violet-100',
  } as const;

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <JsonLd data={[jsonLdWebSite(), crumbs]} />
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: '퀴즈 점수와 랭킹은 어떻게 계산되나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '문항 정답 수와 소요 시간 등을 조합해 점수를 산정할 수 있습니다. 랭킹은 동일 규칙으로 산정된 점수 기준으로 제공됩니다.',
                },
              },
              {
                '@type': 'Question',
                name: '데이터는 어디에 저장되나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Firebase 등 클라우드 인프라를 사용할 수 있으며, 개인 식별 정보는 최소화합니다. 상세 내용은 개인정보처리방침을 참고하세요.',
                },
              },
              {
                '@type': 'Question',
                name: '광고나 분석 스크립트는 동의 없이 작동하나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '비필수 범주(분석/광고) 스크립트는 사전 동의가 있을 때만 작동합니다. 동의는 언제든지 철회할 수 있습니다.',
                },
              },
            ],
          },
        ]}
      />
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ${theme.headerBadge}`}
        >
          <span className="text-lg">🧠</span>
          퀴즈/게임
        </span>
      </div>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">퀴즈/게임 허브</h1>
      <p className="mt-2 text-sm text-gray-600">
        원하는 퀴즈/게임을 선택하세요.
      </p>
      <ul
        className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2"
        role="list"
        aria-label="퀴즈/게임 목록"
      >
        {quizItems.map((it) => (
          <li key={it.href} role="listitem">
            <Link
              href={it.href}
              className={`block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md ring-1 ring-transparent ${theme.ring} ${theme.hoverRing}`}
            >
              <div className="font-semibold text-slate-800">{it.label}</div>
              <div className="mt-1 text-sm text-gray-600">{it.desc}</div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
