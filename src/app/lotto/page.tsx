import type { Metadata } from 'next';
import Link from 'next/link';
import { MENU_LIST } from '@/constants/menu.constant';
import { generateOgImageUrl, getOgTag } from '@/utils';

export const metadata: Metadata = {
  title: '로또 허브 - 로또 분석/번호 생성 | Pickle Eight',
  description:
    '로또 번호 생성, 당첨번호 확인, 회차별 기록 등 로또 관련 기능을 한 곳에서 제공합니다.',
  openGraph: {
    title: '로또 허브 - 로또 분석/번호 생성 | Pickle Eight',
    description:
      '로또 번호 생성, 당첨번호 확인, 회차별 기록 등 로또 관련 기능을 한 곳에서 제공합니다.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/lotto`,
    siteName: process.env.NEXT_PUBLIC_SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
    images: [
      generateOgImageUrl(
        '로또 허브 - 로또 분석/번호 생성 | Pickle Eight',
        '로또 번호 생성, 당첨번호 확인, 회차별 기록 등 로또 관련 기능을 한 곳에서 제공합니다.',
        '로또 허브',
        getOgTag({ href: '/lotto' })
      ),
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '로또 허브 - 로또 분석/번호 생성 | Pickle Eight',
    description:
      '로또 번호 생성, 당첨번호 확인, 회차별 기록 등 로또 관련 기능을 한 곳에서 제공합니다.',
    images: [
      generateOgImageUrl(
        '로또 허브 - 로또 분석/번호 생성 | Pickle Eight',
        '로또 번호 생성, 당첨번호 확인, 회차별 기록 등 로또 관련 기능을 한 곳에서 제공합니다.',
        '로또 허브',
        getOgTag({ href: '/lotto' })
      ),
    ],
  },
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/lotto` },
};

export default function LottoHubPage() {
  const lottoItems = (
    MENU_LIST.find((g) => g.group === 'lotto')?.items ?? []
  ).map((it) => ({ href: it.href, label: it.label, desc: it.description }));

  const theme = {
    ring: 'ring-emerald-200',
    hoverRing: 'hover:ring-emerald-300',
    headerBadge: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  } as const;

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ${theme.headerBadge}`}
        >
          <span className="text-lg">🍀</span>
          로또
        </span>
      </div>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">로또 허브</h1>
      <p className="mt-2 text-sm text-gray-600">원하는 기능을 선택하세요.</p>
      <ul
        className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2"
        role="list"
        aria-label="로또 기능 목록"
      >
        {lottoItems.map((it) => (
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
