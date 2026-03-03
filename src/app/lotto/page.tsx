import { JsonLdComponent } from '@/components/shared/seo/json-ld.component';
import { MENU_GROUP_NAME_ENUM, MENU_LIST } from '@/constants/menu.constant';
import {
  buildMetadata,
  canonicalUrl,
  jsonLdBreadcrumb,
  jsonLdWebSite,
} from '@/lib/seo';
import { generateOgImageUrl } from '@/utils/common.util';
import { getOgTag } from '@/utils/seo.util';
import type { Metadata } from 'next';
import Link from 'next/link';

const baseMeta = buildMetadata({
  title: '로또 허브 - 로또 분석/번호 생성',
  description:
    '로또 번호 생성, 당첨번호 확인, 회차별 기록 등 로또 관련 기능을 한 곳에서 제공합니다.',
  pathname: `/${MENU_GROUP_NAME_ENUM.LOTTO}`,
});

export const metadata: Metadata = {
  ...baseMeta,
  openGraph: {
    ...baseMeta.openGraph,
    images: [
      generateOgImageUrl(
        '로또 허브 - 로또 분석/번호 생성 | ' +
          (process.env.NEXT_PUBLIC_SITE_NAME as string),
        '로또 번호 생성, 당첨번호 확인, 회차별 기록 등 로또 관련 기능을 한 곳에서 제공합니다.',
        '로또 허브',
        getOgTag({ href: `/${MENU_GROUP_NAME_ENUM.LOTTO}` })
      ),
    ],
  },
  twitter: {
    ...baseMeta.twitter,
    images: [
      generateOgImageUrl(
        '로또 허브 - 로또 분석/번호 생성 | ' +
          (process.env.NEXT_PUBLIC_SITE_NAME as string),
        '로또 번호 생성, 당첨번호 확인, 회차별 기록 등 로또 관련 기능을 한 곳에서 제공합니다.',
        '로또 허브',
        getOgTag({ href: `/${MENU_GROUP_NAME_ENUM.LOTTO}` })
      ),
    ],
  },
};

export default function LottoHubPage() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || '운빨연구소';
  const lottoItems = (
    MENU_LIST.find((g) => g.group === 'lotto')?.items ?? []
  ).map((it) => ({
    href: it.href,
    label: it.label,
    desc: it.description,
    isCredit: it.isCredit,
    isConditionalCredit: it.isConditionalCredit,
    icon: it.icon as string | undefined,
    colorClass: it.colorClass as string | undefined,
  }));

  const crumbs = jsonLdBreadcrumb([
    { name: siteName, item: canonicalUrl('/') },
    { name: '로또 허브', item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.LOTTO}`) },
  ]);

  const theme = {
    ring: 'ring-primary/30',
    hoverRing: 'hover:ring-primary/40',
    headerBadge: 'bg-primary/10 text-primary ring-primary/20',
  } as const;

  return (
    <section className="px-6 py-10 md:px-8 md:py-12">
      <JsonLdComponent data={[jsonLdWebSite(), crumbs]} />
      <JsonLdComponent
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: lottoItems.map((it, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: it.label,
            url: canonicalUrl(it.href),
            description: it.desc,
          })),
        }}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ${theme.headerBadge}`}
          >
            <span className="text-lg">🍀</span>
            로또
          </span>
        </div>
        <Link
          href={`/${MENU_GROUP_NAME_ENUM.LOTTO}/dashboard`}
          className="rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary ring-1 ring-primary/20 transition-colors hover:bg-primary/15"
        >
          대시보드 열기
        </Link>
      </div>
      <h1 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
        로또 허브
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        로또 관련 도구를 한 곳에서 빠르게 찾으세요. 대시보드, 번호 생성, 통계,
        회차 기록 등.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lottoItems.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="group block rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-muted/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold tracking-tight">
                  {it.label}
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {it.desc}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {it.isConditionalCredit && (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 ring-1 ring-amber-200">
                  일부 크레딧
                </span>
              )}
              {it.isCredit && (
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800 ring-1 ring-emerald-200">
                  크레딧
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
