import { ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ComingSoonBadgeComponent } from '@/components/common/coming-soon-badge.component';
import { JsonLdComponent } from '@/components/seo/json-ld.component';
import {
  HOME_DESCRIPTION,
  HOME_GROUP_DESCRIPTIONS,
  HOME_HERO_DESCRIPTION,
  HOME_TITLE,
} from '@/constants/home.constant';
import {
  type MENU_GROUP_NAME_ENUM,
  MENU_LIST,
} from '@/constants/menu.constant';
import {
  buildMetadata,
  canonicalUrl,
  generateOgImageUrl,
  jsonLdWebSite,
  SITE_NAME,
} from '@/lib/seo';

const baseMeta = buildMetadata({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  pathname: '/',
});

export const metadata: Metadata = {
  ...baseMeta,
  openGraph: {
    ...baseMeta.openGraph,
    images: [generateOgImageUrl(HOME_TITLE, HOME_DESCRIPTION, SITE_NAME)],
  },
  twitter: {
    ...baseMeta.twitter,
    images: [generateOgImageUrl(HOME_TITLE, HOME_DESCRIPTION, SITE_NAME)],
  },
};

function isHomeGroup(group: string): group is MENU_GROUP_NAME_ENUM {
  return group in HOME_GROUP_DESCRIPTIONS;
}

function describeGroup(group: string, labels: readonly string[]): string {
  return isHomeGroup(group)
    ? HOME_GROUP_DESCRIPTIONS[group]
    : labels.join(', ');
}

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
      <div className="max-w-4xl">
        <h1 className="text-4xl font-extrabold md:text-5xl">{SITE_NAME}</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">
          {HOME_HERO_DESCRIPTION}
        </p>
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
                    {g.comingSoon && <ComingSoonBadgeComponent />}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    {describeGroup(
                      g.group,
                      g.items.map((item) => item.label)
                    )}
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
