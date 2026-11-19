import type { JSX } from 'react';

import {
  DREAM_DEATH_SUPPLEMENT_TEXT,
  DREAM_REPEAT_NOTICE_TEXT,
  DREAM_SOOTHING_TITLE,
} from '@/features/dream/constants/dream-notice.constant';
import type { DreamTopicType } from '@/features/dream/types/dream.type';

export type DreamTopicSoothingComponentPropsType = Readonly<{
  topic: DreamTopicType;
}>;

/**
 * DreamTopicSoothingComponent
 * - 민감 소재(sensitive, death)에만 그린다. 죽음 보충 → 소재별 완화 → 반복 꿈 안내. 서버 컴포넌트.
 */
export function DreamTopicSoothingComponent({
  topic,
}: DreamTopicSoothingComponentPropsType): JSX.Element | null {
  if (topic.sensitivity === 'none') return null;

  const paragraphs = [
    ...(topic.sensitivity === 'death' ? [DREAM_DEATH_SUPPLEMENT_TEXT] : []),
    ...topic.soothing,
    DREAM_REPEAT_NOTICE_TEXT,
  ];

  return (
    <section className="space-y-3 rounded-panel border border-menu-dream/30 bg-menu-dream/10 p-5 sm:p-6">
      <h2 className="text-xl leading-tight font-semibold break-keep text-foreground">
        {DREAM_SOOTHING_TITLE}
      </h2>
      {paragraphs.map((text) => (
        <p
          key={text}
          className="max-w-[68ch] text-base leading-8 break-keep text-foreground"
        >
          {text}
        </p>
      ))}
    </section>
  );
}
