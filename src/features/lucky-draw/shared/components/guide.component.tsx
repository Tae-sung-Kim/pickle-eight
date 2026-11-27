import type { JSX } from 'react';

import { CollapsibleComponent } from '@/components/common/collapsible.component';
import { LUCKY_DRAW_GUIDE } from '../../constants/lucky-draw-guide.constant';
import { LUCKY_DRAW_GUIDE_TITLE } from '../../constants/lucky-draw-notice.constant';
import type { LuckyDrawPageKeyType } from '../../types/lucky-draw.type';

type LuckyDrawGuidePropsType = Readonly<{ page: LuckyDrawPageKeyType }>;

/**
 * LuckyDrawGuideComponent
 * - 사용 순서(번호 3단계) + 설명 문단. 서버 컴포넌트.
 */
export function LuckyDrawGuideComponent({
  page,
}: LuckyDrawGuidePropsType): JSX.Element {
  const guide = LUCKY_DRAW_GUIDE[page];
  return (
    <CollapsibleComponent heading={LUCKY_DRAW_GUIDE_TITLE} level={2}>
      <ol className="max-w-prose list-decimal space-y-1 pl-5 text-sm leading-7 text-foreground">
        {guide.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p className="max-w-prose text-sm leading-7 text-muted-foreground">
        {guide.paragraph}
      </p>
    </CollapsibleComponent>
  );
}
