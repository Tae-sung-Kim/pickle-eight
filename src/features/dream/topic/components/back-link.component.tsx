import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { JSX } from 'react';

import { Button } from '@/components/ui/button';
import { DREAM_BACK_LINK_LABEL } from '@/features/dream/constants/dream-notice.constant';
import { DREAM_HUB_PATH } from '@/features/dream/constants/dream-route.constant';

/**
 * DreamTopicBackLinkComponent
 * - 허브로 돌아가는 보조 버튼. 서버 컴포넌트.
 */
export function DreamTopicBackLinkComponent(): JSX.Element {
  return (
    <Button asChild variant="outline" className="h-11 w-full sm:w-auto">
      <Link href={DREAM_HUB_PATH} prefetch={false}>
        <ArrowLeft size={16} aria-hidden="true" />
        {DREAM_BACK_LINK_LABEL}
      </Link>
    </Button>
  );
}
