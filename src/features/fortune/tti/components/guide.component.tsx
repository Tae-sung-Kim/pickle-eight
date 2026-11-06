import type { JSX } from 'react';

import { FORTUNE_TTI_GUIDE } from '@/features/fortune/constants/fortune-guide.constant';
import {
  FORTUNE_MAX_BIRTH,
  FORTUNE_MIN_BIRTH,
} from '@/features/fortune/constants/fortune-input.constant';
import {
  FORTUNE_ZODIAC,
  FORTUNE_ZODIAC_BASE_OFFSET,
  FORTUNE_ZODIAC_CYCLE,
} from '@/features/fortune/constants/fortune-zodiac.constant';

const TABLE_TITLE = '12띠와 출생 연도 대응';
const TABLE_HEADERS = {
  zodiac: '띠',
  years: '출생 연도',
  note: '입춘 기준 안내',
} as const;
const SPRING_NOTE_TEMPLATE = '입춘 전에 태어나면 {띠}';

/**
 * 띠별 출생 연도 행. 12년 주기 규칙((연도 - 4) mod 12, 0 = 쥐)으로 만든다.
 * fortune-tti.util 은 import 하지 않는다(달력 표 의존 분리). 범위는 지원 출생 연도(1920~2028)다.
 */
const TTI_YEAR_ROWS = FORTUNE_ZODIAC.map((zodiac, index) => {
  const years: number[] = [];
  for (
    let year = FORTUNE_MIN_BIRTH.year;
    year <= FORTUNE_MAX_BIRTH.year;
    year += 1
  ) {
    const remainder =
      (((year - FORTUNE_ZODIAC_BASE_OFFSET) % FORTUNE_ZODIAC_CYCLE) +
        FORTUNE_ZODIAC_CYCLE) %
      FORTUNE_ZODIAC_CYCLE;
    if (remainder === index) years.push(year);
  }
  const previousName =
    FORTUNE_ZODIAC[(index + FORTUNE_ZODIAC_CYCLE - 1) % FORTUNE_ZODIAC_CYCLE]
      .name;
  return {
    key: zodiac.key,
    name: zodiac.name,
    years: years.join(', '),
    note: SPRING_NOTE_TEMPLATE.replace('{띠}', previousName),
  };
});

/**
 * FortuneTtiGuideComponent
 * - 내 띠 찾는 법(FORTUNE_TTI_GUIDE) + 12띠와 출생 연도 대응 표. 서버 컴포넌트.
 * - 본문이 비어 있어도 표는 그린다.
 */
export function FortuneTtiGuideComponent(): JSX.Element {
  return (
    <section className="space-y-6">
      {FORTUNE_TTI_GUIDE.map((section) => (
        <div key={section.heading} className="space-y-2">
          <h2 className="text-xl leading-tight font-semibold break-keep text-foreground sm:text-2xl">
            {section.heading}
          </h2>
          {section.paragraphs.map((paragraph) => (
            <p
              key={paragraph}
              className="max-w-[68ch] text-sm leading-7 text-foreground sm:text-base"
            >
              {paragraph}
            </p>
          ))}
        </div>
      ))}
      <div className="space-y-2">
        <h2 className="text-xl leading-tight font-semibold break-keep text-foreground sm:text-2xl">
          {TABLE_TITLE}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm leading-6 text-foreground">
            <caption className="sr-only">{TABLE_TITLE}</caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="px-2 py-2 font-semibold">
                  {TABLE_HEADERS.zodiac}
                </th>
                <th scope="col" className="px-2 py-2 font-semibold">
                  {TABLE_HEADERS.years}
                </th>
                <th scope="col" className="px-2 py-2 font-semibold">
                  {TABLE_HEADERS.note}
                </th>
              </tr>
            </thead>
            <tbody>
              {TTI_YEAR_ROWS.map((row) => (
                <tr key={row.key} className="border-b border-border">
                  <th
                    scope="row"
                    className="px-2 py-2 font-semibold whitespace-nowrap"
                  >
                    {row.name}
                  </th>
                  <td className="px-2 py-2 tabular-nums">{row.years}</td>
                  <td className="px-2 py-2 break-keep text-muted-foreground">
                    {row.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
