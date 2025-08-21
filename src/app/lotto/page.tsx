import type { Metadata } from 'next';
import Link from 'next/link';
import { MENU_LIST } from '@/constants/menu.constant';

export const metadata: Metadata = {
  title: '로또 허브 - 번호 생성, 분석, 회차별, 확인 | Pickle Eight',
  description:
    '로또 관련 모든 도구를 한 곳에서: 번호 생성, 분석, 회차별 기록, 당첨 확인, 시뮬레이터, 고급 생성기.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/lotto`,
  },
};

export default function LottoHubPage() {
  const lottoItems = (
    MENU_LIST.find((g) => g.group === 'lotto')?.items ?? []
  ).map((it) => ({ href: it.href, label: it.label, desc: it.description }));

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">로또 허브</h1>
      <p className="mt-2 text-sm text-gray-600">원하는 도구를 선택하세요.</p>
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
