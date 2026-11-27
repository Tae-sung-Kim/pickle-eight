import type { JSX } from 'react';
import { FaqComponent } from '@/components/common/faq.component';
import { DreamBasisNoticeComponent } from '@/features/dream/shared/components/basis-notice.component';
import { DreamTopicReadingComponent } from '@/features/dream/topic/components/reading.component';
import { DreamTopicRelatedComponent } from '@/features/dream/topic/components/related.component';
import { DreamTopicSoothingComponent } from '@/features/dream/topic/components/soothing.component';
import { DreamTopicTtiLinkComponent } from '@/features/dream/topic/components/tti-link.component';
import type { DreamTopicType } from '@/features/dream/types/dream.type';

export type DreamTopicComponentPropsType = Readonly<{
  topic: DreamTopicType;
  relatedTopics: readonly DreamTopicType[];
}>;

/**
 * DreamTopicComponent
 * - 소재 상세 본문. 서버 컴포넌트.
 */
export function DreamTopicComponent({
  topic,
  relatedTopics,
}: DreamTopicComponentPropsType): JSX.Element {
  return (
    <div className="space-y-8">
      <DreamTopicReadingComponent topic={topic} />
      <DreamTopicSoothingComponent topic={topic} />
      <DreamTopicTtiLinkComponent topic={topic} />
      <DreamBasisNoticeComponent showHubLink />
      <DreamTopicRelatedComponent topics={relatedTopics} />
      <FaqComponent items={topic.faq} />
    </div>
  );
}
