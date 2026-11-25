import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ContentWrapperComponent } from '@/components/common/content-wrapper.component';
import { TitleWrapperComponent } from '@/components/common/title-wrapper.component';
import { JsonLdComponent } from '@/components/seo/json-ld.component';
import { MENU_GROUP_NAME_ENUM } from '@/constants/menu.constant';
import { NO_SON_DAYS_VIEW } from '@/features/no-son-days/constants/no-son-days-view.constant';
import { NoSonDaysBreadcrumbComponent } from '@/features/no-son-days/shared/components/breadcrumb.component';
import { NoSonDaysDisclaimerNoticeComponent } from '@/features/no-son-days/shared/components/disclaimer-notice.component';
import {
  buildNoSonYear,
  getNoSonDaysYears,
  parseNoSonDaysYear,
} from '@/features/no-son-days/utils/no-son-days.util';
import {
  buildNoSonDaysBreadcrumb,
  buildNoSonDaysYearSeo,
} from '@/features/no-son-days/utils/no-son-days-seo.util';
import { NoSonDaysYearComponent } from '@/features/no-son-days/year/components/root.component';
import { buildMetadata, jsonLdBreadcrumb } from '@/lib/seo';

type YearPagePropsType = Readonly<{
  params: Promise<{ year: string }>;
}>;

export const dynamicParams = false;

export function generateStaticParams() {
  return getNoSonDaysYears().map((year) => ({ year: String(year) }));
}

export async function generateMetadata({
  params,
}: YearPagePropsType): Promise<Metadata> {
  const year = parseNoSonDaysYear((await params).year);
  if (year === null) notFound();
  const seo = buildNoSonDaysYearSeo(year);
  return buildMetadata({
    title: seo.title,
    description: seo.description,
    pathname: seo.pathname,
    keywords: [...seo.keywords],
    ogImage: seo.ogImage,
  });
}

export default async function NoSonDaysYearPage({ params }: YearPagePropsType) {
  const year = parseNoSonDaysYear((await params).year);
  if (year === null) notFound();
  const data = buildNoSonYear(year);
  if (data === null) notFound();

  return (
    <ContentWrapperComponent type={MENU_GROUP_NAME_ENUM.NO_SON_DAYS}>
      <JsonLdComponent
        data={jsonLdBreadcrumb([...buildNoSonDaysBreadcrumb(year)])}
      />
      <div className="px-4 py-8">
        <NoSonDaysBreadcrumbComponent year={year} />
        <TitleWrapperComponent
          type={MENU_GROUP_NAME_ENUM.NO_SON_DAYS}
          title={NO_SON_DAYS_VIEW.year.title(year)}
          description={NO_SON_DAYS_VIEW.year.description(year)}
        />
        <NoSonDaysDisclaimerNoticeComponent />
        <NoSonDaysYearComponent year={data} />
      </div>
    </ContentWrapperComponent>
  );
}
