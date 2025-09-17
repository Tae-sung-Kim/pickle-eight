'use client';
import { Card } from '@/components/ui/card';
import { MENU_GROUP_NAME_ENUM } from '@/constants/menu.constant';
import {
  buildMetadata,
  canonicalUrl,
  jsonLdBreadcrumb,
  jsonLdWebSite,
} from '@/lib/seo';
import {
  useMyBudgetQuery,
  useMyNumberSetsQuery,
} from '@/queries/use-lotto-user.query';
import { useLatestLottoDrawQuery } from '@/queries/use-lotto.query';
import { generateOgImageUrl } from '@/utils/common.util';
import { getOgTag } from '@/utils/seo.util';
import type { Metadata } from 'next';
import type { JSX } from 'react';
import { useMemo, useState } from 'react';
import { BudgetTrackerComponent } from './budget-tracker.component';
import { ConstraintsGeneratorComponent } from './constraints-generator.component';
import { FairnessLogComponent } from './fairness-log.component';
import { HotColdTrackerComponent } from './hot-cold-tracker.component';
import { MyNumbersComponent } from './my-numbers.component';
import { JsonLdComponent } from '@/components/shared/seo/json-ld.component';

const baseMeta = buildMetadata({
  title: '로또 대시보드 - 나의 번호, 고급 생성기, 통계',
  description:
    '나의 번호 보관함, 자동 당첨 체크, 고급 제약 조건 생성, 핫/콜드/지연번호 트래커, 공정성 로그, 예산 트래커를 한 곳에서 관리합니다. 참고용 기능이며 당첨을 보장하지 않습니다.',
  pathname: `/${MENU_GROUP_NAME_ENUM.LOTTO}/dashboard`,
});

export const metadata: Metadata = {
  ...baseMeta,
  openGraph: {
    ...baseMeta.openGraph,
    images: [
      generateOgImageUrl(
        '로또 대시보드 | ' + (process.env.NEXT_PUBLIC_SITE_NAME as string),
        '나의 번호, 자동 당첨 체크, 고급 제약, 핫/콜드, 공정성 로그, 예산 트래커를 한 곳에서.',
        '로또 대시보드',
        getOgTag({ href: `/${MENU_GROUP_NAME_ENUM.LOTTO}/dashboard` })
      ),
    ],
  },
  twitter: {
    ...baseMeta.twitter,
    images: [
      generateOgImageUrl(
        '로또 대시보드 | ' + (process.env.NEXT_PUBLIC_SITE_NAME as string),
        '나의 번호, 자동 당첨 체크, 고급 제약, 핫/콜드, 공정성 로그, 예산 트래커를 한 곳에서.',
        '로또 대시보드',
        getOgTag({ href: `/${MENU_GROUP_NAME_ENUM.LOTTO}/dashboard` })
      ),
    ],
  },
};

const TABS = [
  { key: 'my-numbers', label: '나의 번호', icon: '🔖' },
  { key: 'constraints', label: '고급 생성기', icon: '🎯' },
  { key: 'hot-cold', label: '핫/콜드/지연', icon: '🔥' },
  { key: 'fairness', label: '공정성 로그', icon: '⚖️' },
  { key: 'budget', label: '예산 트래커', icon: '💰' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

function TabBar({
  active,
  onChange,
}: {
  readonly active: TabKey;
  readonly onChange: (key: TabKey) => void;
}): JSX.Element {
  return (
    <div className="sticky top-0 z-10 mt-6 border-b bg-background/80 px-0 shadow-sm ring-1 ring-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl">
        <div className="flex gap-2 overflow-x-auto py-2 pr-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={`whitespace-nowrap rounded-md px-3.5 py-2 text-sm transition-colors ${
                active === t.key
                  ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                  : 'text-muted-foreground hover:bg-muted/60'
              }`}
              aria-current={active === t.key ? 'page' : undefined}
            >
              <span className="mr-1">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  hint,
}: {
  readonly title: string;
  readonly value: string;
  readonly hint?: string;
}): JSX.Element {
  return (
    <Card className="bg-white border-border p-5 md:p-6">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      <div className="mt-1 text-xl font-semibold tracking-tight md:text-2xl">
        {value}
      </div>
      {hint ? (
        <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
      ) : null}
    </Card>
  );
}

export function LottoDashboardComponent(): JSX.Element {
  const [active, setActive] = useState<TabKey>('my-numbers');
  const sidebarNeeded = active === 'constraints' || active === 'hot-cold';

  const crumbs = useMemo(
    () =>
      jsonLdBreadcrumb([
        {
          name: process.env.NEXT_PUBLIC_SITE_NAME || '운빨연구소',
          item: canonicalUrl('/'),
        },
        {
          name: '로또 허브',
          item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.LOTTO}`),
        },
        {
          name: '로또 대시보드',
          item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.LOTTO}/dashboard`),
        },
      ]),
    []
  );

  // Summary data
  const latestQ = useLatestLottoDrawQuery({ enabled: true });
  const mySetsQ = useMyNumberSetsQuery();
  const budgetQ = useMyBudgetQuery();

  const latestDrawText = useMemo(() => {
    const d = latestQ.data;
    if (!d) return '-';
    return `#${d.lastDrawNumber}`;
  }, [latestQ.data]);

  const mySetCountText = useMemo(
    () => String(mySetsQ.data?.length ?? 0),
    [mySetsQ.data]
  );

  const budgetText = useMemo(() => {
    const cap = budgetQ.data?.monthlyCap ?? 0;
    const spent = budgetQ.data?.spent ?? 0;
    if (cap <= 0) return '미설정';
    const pct = Math.min(100, Math.round((spent / cap) * 100));
    return `${pct}% (${spent.toLocaleString()} / ${cap.toLocaleString()})`;
  }, [budgetQ.data]);

  return (
    <section className="w-full mx-auto max-w-6xl px-6 py-10 md:px-8 md:py-12">
      <JsonLdComponent data={[jsonLdWebSite(), crumbs]} />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-primary/20">
            <span className="text-lg">📊</span>
            로또 대시보드
          </span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
            로또 대시보드
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            나의 번호, 고급 제약 생성, 핫/콜드 지표, 공정성 로그, 예산까지 한
            곳에서.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-3">
          <SummaryCard
            title="최근 회차"
            value={latestDrawText}
            hint={latestQ.isFetching ? '업데이트 중…' : undefined}
          />
          <SummaryCard
            title="저장된 번호"
            value={mySetCountText}
            hint={mySetsQ.isFetching ? '불러오는 중…' : undefined}
          />
          <SummaryCard
            title="예산 진행률"
            value={budgetText}
            hint={budgetQ.isFetching ? '동기화 중…' : undefined}
          />
        </div>
      </div>

      {/* Tab bar */}
      <TabBar active={active} onChange={setActive} />

      {/* Content */}
      <div
        className={`mt-8 grid grid-cols-1 gap-8 ${
          sidebarNeeded ? 'xl:grid-cols-3' : ''
        }`}
      >
        {/* Left: main content stacked */}
        <div
          className={`${
            sidebarNeeded ? 'xl:col-span-2' : ''
          } space-y-8 min-w-0`}
        >
          {active === 'my-numbers' && <MyNumbersComponent />}
          {active === 'constraints' && <ConstraintsGeneratorComponent />}
          {active === 'hot-cold' && <HotColdTrackerComponent />}
          {active === 'fairness' && <FairnessLogComponent />}
          {active === 'budget' && <BudgetTrackerComponent />}
        </div>

        {/* Right: tips sidebar (only when needed) */}
        {sidebarNeeded && (
          <div className="hidden space-y-8 xl:block min-w-0">
            {active === 'constraints' && (
              <Card className="border-dashed p-5 text-sm leading-relaxed text-muted-foreground md:p-6 max-w-full">
                제약 팁
                <ul className="mt-2 list-disc pl-4">
                  <li>합계 범위는 넉넉하게 시작한 뒤 점차 좁히세요.</li>
                  <li>연속 제한은 1~2로 완화하면 유효 조합을 찾기 쉽습니다.</li>
                  <li>고정/제외 번호는 서로 충돌하지 않도록 관리하세요.</li>
                </ul>
              </Card>
            )}
            {active === 'hot-cold' && (
              <Card className="border-dashed p-5 text-sm leading-relaxed text-muted-foreground md:p-6 max-w-full">
                지표 설명
                <ul className="mt-2 list-disc pl-4">
                  <li>자주 나온 번호: 전체 빈도 상위</li>
                  <li>오랫동안 안 나온 번호: 최근 미출현 회차 수</li>
                  <li>최근 빈도: 최근 구간에서의 출현 횟수</li>
                </ul>
              </Card>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
