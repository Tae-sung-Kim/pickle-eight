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

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />
      <h1 className="text-2xl font-bold tracking-tight">퀴즈/게임 허브</h1>
      <p className="mt-2 text-sm text-gray-600">
        원하는 퀴즈/게임을 선택하세요.
      </p>
      <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quizItems.map((it) => (
          <li
            key={it.href}
            className="rounded-xl border p-4 hover:shadow-md transition-shadow"
          >
            <Link href={it.href} className="block">
              <div className="font-semibold">{it.label}</div>
              <div className="mt-1 text-sm text-gray-600">{it.desc}</div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
