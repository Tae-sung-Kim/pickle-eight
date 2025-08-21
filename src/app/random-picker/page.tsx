import type { Metadata } from 'next';
import Link from 'next/link';
import { MENU_LIST } from '@/constants/menu.constant';
import { generateOgImageUrl, getOgTag } from '@/utils';

export const metadata: Metadata = {
  title: '랜덤 도구 허브 - 이름 뽑기/자리 배정/사다리/주사위 | Pickle Eight',
  description:
    '이름 뽑기, 자리 배정, 사다리 타기, 주사위 굴리기, 랜덤 순서 정하기 등 다양한 랜덤 도구를 한 곳에서 사용하세요.',
  keywords: [
    '랜덤도구',
    '이름뽑기',
    '자리배정',
    '사다리타기',
    '주사위',
    '랜덤순서',
    '팀배정',
  ],
  openGraph: {
    title: '랜덤 도구 허브 - 이름 뽑기/자리 배정/사다리/주사위 | Pickle Eight',
    description:
      '이름 뽑기, 자리 배정, 사다리 타기, 주사위 굴리기, 랜덤 순서 정하기 등 다양한 랜덤 도구를 한 곳에서 사용하세요.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/random-picker`,
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
    images: [
      generateOgImageUrl(
        '랜덤 도구 허브 - 이름 뽑기/자리 배정/사다리/주사위 | Pickle Eight',
        '이름 뽑기, 자리 배정, 사다리 타기, 주사위 굴리기, 랜덤 순서 정하기 등 다양한 랜덤 도구를 한 곳에서 사용하세요.',
        '랜덤 도구 허브',
        getOgTag({ href: '/random-picker' })
      ),
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '랜덤 도구 허브 - 이름 뽑기/자리 배정/사다리/주사위 | Pickle Eight',
    description:
      '이름 뽑기, 자리 배정, 사다리 타기, 주사위 굴리기, 랜덤 순서 정하기 등 다양한 랜덤 도구를 한 곳에서 사용하세요.',
    images: [
      generateOgImageUrl(
        '랜덤 도구 허브 - 이름 뽑기/자리 배정/사다리/주사위 | Pickle Eight',
        '이름 뽑기, 자리 배정, 사다리 타기, 주사위 굴리기, 랜덤 순서 정하기 등 다양한 랜덤 도구를 한 곳에서 사용하세요.',
        '랜덤 도구 허브',
        getOgTag({ href: '/random-picker' })
      ),
    ],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/random-picker`,
  },
};

export default function RandomPickerHubPage() {
  const randomItems = (
    MENU_LIST.find((g) => g.group === 'random')?.items ?? []
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
        name: '랜덤 도구 허브',
        item: `${baseUrl}/random-picker`,
      },
    ],
  } as const;

  const theme = {
    ring: 'ring-indigo-200',
    hoverRing: 'hover:ring-indigo-300',
    headerBadge: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
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
          <span className="text-lg">🎲</span>
          랜덤 도구
        </span>
      </div>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">랜덤 도구 허브</h1>
      <p className="mt-2 text-sm text-gray-600">
        원하는 랜덤 도구를 선택하세요.
      </p>
      <ul
        className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2"
        role="list"
        aria-label="랜덤 도구 목록"
      >
        {randomItems.map((it) => (
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
