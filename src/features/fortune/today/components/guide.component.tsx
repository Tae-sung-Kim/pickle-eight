import type { JSX } from 'react';

import { FORTUNE_TODAY_GUIDE } from '@/features/fortune/constants/fortune-guide.constant';

/**
 * FortuneTodayGuideComponent
 * - 오늘의 운세 사용법·결과 읽는 법. h2 + 단락. 서버 컴포넌트.
 * - 본문은 fortune-guide.constant.ts(C-3b가 채움). 비어 있으면 아무것도 그리지 않는다.
 */
export function FortuneTodayGuideComponent(): JSX.Element | null {
  if (FORTUNE_TODAY_GUIDE.length === 0) return null;

  return (
    <section className="space-y-6">
      {FORTUNE_TODAY_GUIDE.map((section) => (
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
    </section>
  );
}
