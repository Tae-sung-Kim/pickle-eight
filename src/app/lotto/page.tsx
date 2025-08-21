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

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">로또 허브</h1>
      <p className="mt-2 text-sm text-gray-600">원하는 기능을 선택하세요.</p>
      <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lottoItems.map((it) => (
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
