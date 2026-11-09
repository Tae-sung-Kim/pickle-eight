import type { JSX } from 'react';
import { FORTUNE_SAJU_GUIDE } from '@/features/fortune/constants/fortune-guide.constant';

/**
 * FortuneSajuGuideComponent
 * - 사주 보는 법(FORTUNE_SAJU_GUIDE, SJ-C3 작성) h2 + 단락. 서버 컴포넌트.
 */
export function FortuneSajuGuideComponent(): JSX.Element {
  return (
    <section className="space-y-6">
      {FORTUNE_SAJU_GUIDE.map((section) => (
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
