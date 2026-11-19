import Link from 'next/link';
import type { JSX } from 'react';

import {
  DREAM_BASIS_LINK_LABEL,
  DREAM_BASIS_TEXT,
  DREAM_BASIS_TITLE,
} from '@/features/dream/constants/dream-notice.constant';
import { DREAM_HUB_PATH } from '@/features/dream/constants/dream-route.constant';

export type DreamBasisNoticeComponentPropsType = Readonly<{
  /** true면 문단 끝에 "다른 소재 찾기" 링크를 붙인다(상세 화면) */
  showHubLink?: boolean;
}>;

/**
 * DreamBasisNoticeComponent
 * - 풀이 기준. 상자 없는 글. 서버 컴포넌트.
 */
export function DreamBasisNoticeComponent({
  showHubLink = false,
}: DreamBasisNoticeComponentPropsType): JSX.Element {
  return (
    <section className="space-y-2">
      <h2 className="text-lg leading-tight font-semibold break-keep text-foreground">
        {DREAM_BASIS_TITLE}
      </h2>
      <p className="max-w-[68ch] text-sm leading-7 break-keep text-foreground sm:text-base">
        {DREAM_BASIS_TEXT}
        {showHubLink ? (
          <>
            {' '}
            <Link
              href={DREAM_HUB_PATH}
              prefetch={false}
              className="inline-flex min-h-8 items-center rounded-sm text-primary underline underline-offset-4 hover:decoration-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
            >
              {DREAM_BASIS_LINK_LABEL}
            </Link>
          </>
        ) : null}
      </p>
    </section>
  );
}
