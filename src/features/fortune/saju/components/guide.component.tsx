import type { JSX } from 'react';

import { CollapsibleComponent } from '@/components/common/collapsible.component';
import { FORTUNE_SAJU_GUIDE } from '@/features/fortune/constants/fortune-guide.constant';

// 접는 구간(F-3). "이용 방법"은 접지 않는다
const FOLDED_HEADINGS: readonly string[] = [
  '사주와 만세력',
  '오늘의 운세와의 차이',
];

/**
 * FortuneSajuGuideComponent
 * - 사주 보는 법(FORTUNE_SAJU_GUIDE, SJ-C3 작성) h2 + 단락. 서버 컴포넌트.
 */
export function FortuneSajuGuideComponent(): JSX.Element {
  return (
    <section className="space-y-6">
      {FORTUNE_SAJU_GUIDE.map((section) => {
        const paragraphs = section.paragraphs.map((paragraph) => (
          <p
            key={paragraph}
            className="max-w-[68ch] text-sm leading-7 text-foreground sm:text-base"
          >
            {paragraph}
          </p>
        ));
        return FOLDED_HEADINGS.includes(section.heading) ? (
          <CollapsibleComponent
            key={section.heading}
            heading={section.heading}
            level={2}
          >
            {paragraphs}
          </CollapsibleComponent>
        ) : (
          <div key={section.heading} className="space-y-2">
            <h2 className="text-xl leading-tight font-semibold break-keep text-foreground sm:text-2xl">
              {section.heading}
            </h2>
            {paragraphs}
          </div>
        );
      })}
    </section>
  );
}
