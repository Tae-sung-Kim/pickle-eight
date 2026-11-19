import Link from 'next/link';
import type { JSX } from 'react';

import {
  DREAM_TTI_CONSENT_NOTICE,
  DREAM_TTI_LINK_LABEL,
} from '@/features/dream/constants/dream-notice.constant';
import { DREAM_TTI_PATH } from '@/features/dream/constants/dream-route.constant';
import type { DreamTopicType } from '@/features/dream/types/dream.type';

export type DreamTopicTtiLinkComponentPropsType = Readonly<{
  topic: DreamTopicType;
}>;

/**
 * DreamTopicTtiLinkComponent
 * - 12지 동물 소재에만 그린다. 서버 컴포넌트.
 */
export function DreamTopicTtiLinkComponent({
  topic,
}: DreamTopicTtiLinkComponentPropsType): JSX.Element | null {
  if (!topic.isTtiAnimal) return null;

  return (
    <div>
      <Link
        href={DREAM_TTI_PATH}
        prefetch={false}
        className="inline-flex min-h-11 items-center rounded-sm text-primary underline underline-offset-4 hover:decoration-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
      >
        {DREAM_TTI_LINK_LABEL}
      </Link>
      <p className="text-sm leading-6 break-keep text-muted-foreground">
        {DREAM_TTI_CONSENT_NOTICE}
      </p>
    </div>
  );
}
