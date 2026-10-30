import { ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLdComponent } from '@/components/shared/seo/json-ld.component';
import { MENU_LIST } from '@/constants/menu.constant';
import { LatestResultBannerComponent } from '@/features/lotto/components/latest-result-banner.component';
import { buildMetadata, canonicalUrl, jsonLdWebSite } from '@/lib/seo';
import { generateOgImageUrl } from '@/utils/common.util';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME as string;
const TITLE = `${SITE_NAME} - 로또 분석 · 번호 생성`;
const HERO_DESCRIPTION =
  '최신 당첨 번호를 확인하고, 번호를 만들고, 내 번호를 채점하세요. 운을 데이터로 가볍게 들여다보는 연구소입니다.';
const DESCRIPTION =
  '로또 번호 생성/분석, 당첨번호 확인 등 운빨 관련 도구를 무료로 사용하세요.';

const baseMeta = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  pathname: '/',
});

export const metadata: Metadata = {
  ...baseMeta,
  openGraph: {
    ...baseMeta.openGraph,
    images: [generateOgImageUrl(TITLE, DESCRIPTION, SITE_NAME)],
  },
  twitter: {
    ...baseMeta.twitter,
    images: [generateOgImageUrl(TITLE, DESCRIPTION, SITE_NAME)],
  },
};

export default function RootPage() {
  const groups = MENU_LIST.filter((g) => g.items.length > 0);

  return (
    <section className="py-4 md:py-8">
      <JsonLdComponent data={jsonLdWebSite()} />
      <JsonLdComponent
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: groups.map((g, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: g.label,
            url: canonicalUrl(g.href ?? g.items[0].href),
          })),
        }}
      />
      <div className="max-w-2xl">
        <h1 className="text-4xl font-extrabold md:text-5xl">{SITE_NAME}</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">
          {HERO_DESCRIPTION}
        </p>
      </div>

      <div className="mt-8">
        <LatestResultBannerComponent />
      </div>

      {/* 메뉴가 추가되면 MENU_LIST 기준으로 자동 노출 */}
      <div className="mt-12">
        <h2 className="text-xl font-extrabold">서비스</h2>
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {groups.map((g) => (
            <li key={g.group}>
              <Link
                href={g.href ?? g.items[0].href}
                className="group flex items-center justify-between gap-4 px-1 py-4 transition-colors hover:bg-secondary/70 focus-visible:outline-2 focus-visible:outline-ring md:px-3"
              >
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="text-base font-bold">{g.label}</span>
                    {g.comingSoon && (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                        준비 중
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    {g.items.map((item) => item.label).join(', ')}
                  </span>
                </span>
                <ChevronRight
                  className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
