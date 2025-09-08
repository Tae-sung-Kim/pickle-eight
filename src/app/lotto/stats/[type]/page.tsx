import type { Metadata } from 'next';
import { JsonLdComponent } from '@/components';
import { canonicalUrl, jsonLdBreadcrumb, jsonLdWebSite } from '@/lib';
import { MENU_GROUP_NAME_ENUM } from '@/constants';

const allowedTypes = ['frequency', 'range', 'odd-even'] as const;

type StatsType = (typeof allowedTypes)[number];

type Params = { type: string };

function isAllowed(type: string): type is StatsType {
  return (allowedTypes as readonly string[]).includes(type);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { type } = await params;
  const valid = isAllowed(type);
  const labelMap: Record<StatsType, string> = {
    frequency: '빈도',
    range: '구간',
    'odd-even': '홀짝',
  };
  const title = valid
    ? `로또 통계 - ${labelMap[type as StatsType]} | ${
        process.env.NEXT_PUBLIC_SITE_NAME
      }`
    : `로또 통계 - 잘못된 유형 | ${process.env.NEXT_PUBLIC_SITE_NAME}`;
  const description = valid
    ? `${labelMap[type as StatsType]} 기반 통계를 확인하세요.`
    : '요청하신 통계 유형이 올바르지 않습니다.';
  const urlType = valid ? type : 'unknown';
  return {
    title,
    description,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/${MENU_GROUP_NAME_ENUM.LOTTO}/stats/${urlType}`,
    },
  };
}

export default async function LottoStatsTypePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { type } = await params;
  const valid = isAllowed(type);
  const crumbs = jsonLdBreadcrumb([
    { name: 'Home', item: canonicalUrl('/') },
    { name: '로또 허브', item: canonicalUrl(`/${MENU_GROUP_NAME_ENUM.LOTTO}`) },
    {
      name: valid ? `통계 - ${type}` : '잘못된 통계 유형',
      item: canonicalUrl(
        `${MENU_GROUP_NAME_ENUM.LOTTO}/stats/${valid ? type : 'unknown'}`
      ),
    },
  ]);
  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <JsonLdComponent data={[jsonLdWebSite(), crumbs]} />
      {valid ? (
        <>
          <h1 className="text-2xl font-bold tracking-tight">통계: {type}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            그래프/표는 추후 연결됩니다.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold tracking-tight">
            잘못된 통계 유형
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            허용된 유형: frequency, range, odd-even
          </p>
        </>
      )}
    </section>
  );
}
