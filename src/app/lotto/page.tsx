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
  title: '로또 허브 - 로또 분석/번호 생성',
  description:
    '로또 번호 생성, 당첨번호 확인, 회차별 기록 등 로또 관련 기능을 한 곳에서 제공합니다.',
  pathname: '/lotto',
});

export const metadata: Metadata = {
  ...baseMeta,
  openGraph: {
    ...baseMeta.openGraph,
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
    ...baseMeta.twitter,
    images: [
      generateOgImageUrl(
        '로또 허브 - 로또 분석/번호 생성 | Pickle Eight',
        '로또 번호 생성, 당첨번호 확인, 회차별 기록 등 로또 관련 기능을 한 곳에서 제공합니다.',
        '로또 허브',
        getOgTag({ href: '/lotto' })
      ),
    ],
  },
};

export default function LottoHubPage() {
  const lottoItems = (
    MENU_LIST.find((g) => g.group === 'lotto')?.items ?? []
  ).map((it) => ({ href: it.href, label: it.label, desc: it.description }));

  const crumbs = jsonLdBreadcrumb([
    { name: 'Home', item: canonicalUrl('/') },
    { name: '로또 허브', item: canonicalUrl('/lotto') },
  ]);

  const theme = {
    ring: 'ring-emerald-200',
    hoverRing: 'hover:ring-emerald-300',
    headerBadge: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
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
                name: '로또 번호 추천은 어떻게 이루어지나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '무작위 생성과 과거 빈도·패턴 등 통계 정보를 참고해 조합을 제안합니다. 특정 당첨을 보장하지 않으며 참고용입니다.',
                },
              },
              {
                '@type': 'Question',
                name: '연령 제한이 있나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '로또 관련 기능은 만 19세 이상에게만 제공됩니다. 성인 확인(에이지 게이트)을 통해 접근이 제한됩니다.',
                },
              },
              {
                '@type': 'Question',
                name: '개인정보가 저장되나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '핵심 기능에 불필요한 개인정보 저장은 최소화합니다. 비필수 분석/광고는 동의가 있을 때만 실행됩니다. 자세한 내용은 개인정보처리방침을 확인하세요.',
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
