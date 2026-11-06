import type { JSX } from 'react';

import { FORTUNE_STAR_SIGN_GUIDE } from '@/features/fortune/constants/fortune-guide.constant';
import {
  FORTUNE_STAR_SIGN_GUIDE_RANGES,
  FORTUNE_STAR_SIGNS,
} from '@/features/fortune/constants/fortune-star-sign.constant';

const TABLE_TITLE = '12별자리 일반적인 기간';
const TABLE_HEADERS = { sign: '별자리', range: '기간(월.일)' } as const;
/** AC-26: 해마다 하루 정도 달라질 수 있다는 안내 */
const RANGE_NOTE = '날짜는 해마다 하루 정도 달라질 수 있습니다.';

/**
 * FortuneStarSignGuideComponent
 * - 별자리 보는 법(FORTUNE_STAR_SIGN_GUIDE) + 12별자리 일반 기간 표. 서버 컴포넌트.
 * - 본문이 비어 있어도 표는 그린다. 표는 안내용이며 판정에 쓰지 않는다.
 */
export function FortuneStarSignGuideComponent(): JSX.Element {
  return (
    <section className="space-y-6">
      {FORTUNE_STAR_SIGN_GUIDE.map((section) => (
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
        <p className="max-w-[68ch] text-sm leading-7 text-foreground sm:text-base">
          {RANGE_NOTE}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full max-w-md border-collapse text-left text-sm leading-6 text-foreground">
            <caption className="sr-only">{TABLE_TITLE}</caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="px-2 py-2 font-semibold">
                  {TABLE_HEADERS.sign}
                </th>
                <th scope="col" className="px-2 py-2 font-semibold">
                  {TABLE_HEADERS.range}
                </th>
              </tr>
            </thead>
            <tbody>
              {FORTUNE_STAR_SIGNS.map((sign) => (
                <tr key={sign.key} className="border-b border-border">
                  <th
                    scope="row"
                    className="px-2 py-2 font-semibold whitespace-nowrap"
                  >
                    {sign.name}
                  </th>
                  <td className="px-2 py-2 tabular-nums">
                    {FORTUNE_STAR_SIGN_GUIDE_RANGES[sign.key]}
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
