import type { Metadata } from 'next';
import Link from 'next/link';
import { MENU_LIST } from '@/constants/menu.constant';
import { generateOgImageUrl, getOgTag } from '@/utils';

export const metadata: Metadata = {
  title: '퀴즈 허브 - AI 퀴즈/게임 모음 | Pickle Eight',
  description:
    'AI 기반 퀴즈와 게임을 한 곳에서: 영어 단어, 상식 퀴즈, 사자성어, 숫자 매칭 등.',
  keywords: [
    '퀴즈허브',
    'AI퀴즈',
    '퀴즈게임',
    '영어단어퀴즈',
    '상식퀴즈',
    '사자성어퀴즈',
    '숫자매칭게임',
    '두뇌트레이닝',
  ],
  openGraph: {
    title: '퀴즈 허브 - AI 퀴즈/게임 모음 | Pickle Eight',
    description:
      'AI 기반 퀴즈와 게임을 한 곳에서: 영어 단어, 상식 퀴즈, 사자성어, 숫자 매칭 등.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/quiz`,
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
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
    card: 'summary_large_image',
    title: '퀴즈 허브 - AI 퀴즈/게임 모음 | Pickle Eight',
    description:
      'AI 기반 퀴즈와 게임을 한 곳에서: 영어 단어, 상식 퀴즈, 사자성어, 숫자 매칭 등.',
    images: [
      generateOgImageUrl(
        '퀴즈 허브 - AI 퀴즈/게임 모음 | Pickle Eight',
        'AI 기반 퀴즈와 게임을 한 곳에서: 영어 단어, 상식 퀴즈, 사자성어, 숫자 매칭 등.',
        '퀴즈 허브',
        getOgTag({ href: '/quiz' })
      ),
    ],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/quiz`,
  },
};

export default function QuizHubPage() {
  const quizItems = (
    MENU_LIST.find((g) => g.group === 'quiz')?.items ?? []
  ).map((it) => ({ href: it.href, label: it.label, desc: it.description }));

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://pickle-eight.vercel.app';
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Pickle Eight';
  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: siteName,
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '퀴즈 허브',
        item: `${baseUrl}/quiz`,
      },
    ],
  } as const;

  const theme = {
    ring: 'ring-violet-200',
    hoverRing: 'hover:ring-violet-300',
    headerBadge: 'bg-violet-50 text-violet-700 ring-violet-100',
  } as const;

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
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
