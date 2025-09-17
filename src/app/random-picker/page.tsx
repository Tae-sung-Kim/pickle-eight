import { CreditIndicatorComponent } from '@/components/shared/credit/credit-indicator.component';
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
  title: '랜덤 도구 허브 - 이름 뽑기/자리 배정/사다리/주사위',
  description:
    '이름 뽑기, 자리 배정, 사다리 타기, 주사위 굴리기, 랜덤 순서 정하기 등 다양한 랜덤 도구를 한 곳에서 사용하세요.',
  pathname: '/random-picker',
});

export const metadata: Metadata = {
  ...baseMeta,
  openGraph: {
    ...baseMeta.openGraph,
    images: [
      generateOgImageUrl(
        '랜덤 도구 허브 - 이름 뽑기/자리 배정/사다리/주사위',
        '이름 뽑기, 자리 배정, 사다리 타기, 주사위 굴리기, 랜덤 순서 정하기 등 다양한 랜덤 도구를 한 곳에서 사용하세요.',
        '랜덤 도구 허브',
        getOgTag({ href: '/random-picker' })
      ),
    ],
  },
  twitter: {
    ...baseMeta.twitter,
    images: [
      generateOgImageUrl(
        '랜덤 도구 허브 - 이름 뽑기/자리 배정/사다리/주사위',
        '이름 뽑기, 자리 배정, 사다리 타기, 주사위 굴리기, 랜덤 순서 정하기 등 다양한 랜덤 도구를 한 곳에서 사용하세요.',
        '랜덤 도구 허브',
        getOgTag({ href: '/random-picker' })
      ),
    ],
  },
};

const randomItems = (
  MENU_LIST.find((g) => g.group === MENU_GROUP_NAME_ENUM.RANDOM_PICKER)
    ?.items ?? []
).map((it) => ({
  href: it.href,
  label: it.label,
  desc: it.description,
  isCredit: it.isCredit,
}));

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || '운빨연구소';
const crumbs = jsonLdBreadcrumb([
  { name: siteName, item: canonicalUrl('/') },
  {
    name: '랜덤 도구 허브',
    item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.RANDOM_PICKER}`),
  },
]);

const theme = {
  ring: 'ring-primary/20',
  hoverRing: 'hover:ring-primary/30',
  headerBadge: 'bg-primary/10 text-primary ring-primary/20',
} as const;

export default function RandomPickerHubPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <JsonLdComponent data={[jsonLdWebSite(), crumbs]} />
      <JsonLdComponent
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: '이름 추첨은 공정한가요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '동일 확률의 무작위 방식을 사용합니다. 클릭 시점과 횟수 등의 이벤트는 형평성 확인 목적의 기록을 위해 저장될 수 있습니다.',
                },
              },
              {
                '@type': 'Question',
                name: '자리 배정은 어떻게 이루어지나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '입력한 이름과 좌석 수를 기반으로 무작위 배정합니다. 좌석 레이아웃은 시각적으로 확인할 수 있습니다.',
                },
              },
              {
                '@type': 'Question',
                name: '개인정보는 어떻게 처리되나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '핵심 기능에 불필요한 개인정보 저장은 최소화하고, 분석/광고 등 비필수 목적은 동의가 있을 때만 실행합니다. 자세한 내용은 개인정보처리방침을 참고하세요.',
                },
              },
            ],
          },
        ]}
      />
      <JsonLdComponent
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: randomItems.map((it, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: it.label,
            url: canonicalUrl(it.href),
            description: it.desc,
          })),
        }}
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
      <p className="mt-2 text-sm text-muted-foreground">
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
              className={`block rounded-2xl border border-border bg-surface-card p-5 shadow-sm transition-all duration-200 hover:shadow-md ring-1 ring-transparent ${theme.ring} ${theme.hoverRing}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-foreground truncate">
                  {it.label}
                </div>
                {it.isCredit && <CreditIndicatorComponent size="xs" />}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {it.desc}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
