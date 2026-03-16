import { CreditIndicatorComponent } from '@/features/credit/components/credit-indicator.component';
import { JsonLdComponent } from '@/components/shared/seo/json-ld.component';
import { MENU_GROUP_NAME_ENUM, MENU_LIST } from '@/constants/menu.constant';
import {
  buildMetadata,
  canonicalUrl,
  jsonLdBreadcrumb,
  jsonLdWebSite,
} from '@/lib/seo';
import type { MenuItemType } from '@/types/menu.type';
import { generateOgImageUrl } from '@/utils/common.util';
import { getOgTag } from '@/utils/seo.util';
import type { Metadata } from 'next';
import Link from 'next/link';

const baseMeta = buildMetadata({
  title: '퀴즈 허브 - AI 퀴즈/게임 모음',
  description:
    'AI 기반 퀴즈와 게임을 한 곳에서: 영어 단어, 상식 퀴즈, 사자성어, 숫자 매칭 등.',
  pathname: `/${MENU_GROUP_NAME_ENUM.QUIZ}`,
});

export const metadata: Metadata = {
  ...baseMeta,
  openGraph: {
    ...baseMeta.openGraph,
    images: [
      generateOgImageUrl(
        '퀴즈 허브 - AI 퀴즈/게임 모음 | ' +
          (process.env.NEXT_PUBLIC_SITE_NAME as string),
        'AI 기반 퀴즈와 게임을 한 곳에서: 영어 단어, 상식 퀴즈, 사자성어, 숫자 매칭 등.',
        '퀴즈 허브',
        getOgTag({ href: `/${MENU_GROUP_NAME_ENUM.QUIZ}` })
      ),
    ],
  },
  twitter: {
    ...baseMeta.twitter,
    images: [
      generateOgImageUrl(
        '퀴즈 허브 - AI 퀴즈/게임 모음 | ' +
          (process.env.NEXT_PUBLIC_SITE_NAME as string),
        'AI 기반 퀴즈와 게임을 한 곳에서: 영어 단어, 상식 퀴즈, 사자성어, 숫자 매칭 등.',
        '퀴즈 허브',
        getOgTag({ href: `/${MENU_GROUP_NAME_ENUM.QUIZ}` })
      ),
    ],
  },
};

export default function QuizHubPage() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || '운빨연구소';
  const quizItems = (
    MENU_LIST.find((g) => g.group === MENU_GROUP_NAME_ENUM.QUIZ)?.items ?? []
  ).map((it: MenuItemType) => ({
    href: it.href,
    label: it.label,
    desc: it.description,
    isCredit: it.isCredit,
    isConditionalCredit: it.isConditionalCredit,
  }));

  const crumbs = jsonLdBreadcrumb([
    { name: siteName, item: canonicalUrl('/') },
    { name: '퀴즈 허브', item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.QUIZ}`) },
  ]);

  const theme = {
    ring: 'ring-primary/20',
    hoverRing: 'hover:ring-primary/30',
    headerBadge: 'bg-primary/10 text-primary ring-primary/20',
  } as const;

  return (
    <section className="mx-auto max-w-8xl px-4 py-10">
      <JsonLdComponent data={[jsonLdWebSite(), crumbs]} />
      <JsonLdComponent
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: '데이터는 어디에 저장되나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Firebase 등 클라우드 인프라를 사용할 수 있으며, 개인 식별 정보는 최소화합니다. 상세 내용은 개인정보처리방침을 참고하세요.',
                },
              },
              {
                '@type': 'Question',
                name: '광고나 분석 스크립트는 동의 없이 작동하나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '비필수 범주(분석/광고) 스크립트는 사전 동의가 있을 때만 작동합니다. 동의는 언제든지 철회할 수 있습니다.',
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
          itemListElement: quizItems.map((it, idx) => ({
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
          <span className="text-lg">🧠</span>
          퀴즈/게임
        </span>
      </div>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">퀴즈/게임 허브</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        원하는 퀴즈/게임을 선택하세요.
      </p>
      <ul
        className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2"
        role="list"
        aria-label="퀴즈/게임 목록"
      >
        {quizItems.map((it) => (
          <li key={it.href} role="listitem">
            <Link
              href={it.href}
              className={`block rounded-2xl border border-border surface-card p-5 shadow-sm transition-all duration-200 hover:shadow-md ring-1 ring-transparent ${theme.ring} ${theme.hoverRing}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-foreground truncate">
                  {it.label}
                </div>
                <div className="flex items-center gap-2">
                  {it.isCredit && <CreditIndicatorComponent size="xs" />}
                  {!it.isCredit && it.isConditionalCredit && (
                    <CreditIndicatorComponent
                      size="xs"
                      showText={true}
                      className="border-dashed"
                    />
                  )}
                </div>
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
