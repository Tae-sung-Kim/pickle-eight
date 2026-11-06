import Link from 'next/link';
import type { JSX } from 'react';

import { FORTUNE_TODAY_LINK_LABEL } from '@/features/fortune/constants/fortune-notice.constant';
import { FORTUNE_ROUTES } from '@/features/fortune/constants/fortune-route.constant';

// 링크 앞 안내 한 줄. ui-ux-design.md "승인됨(U-1)" 문구. 운세 상수 파일에는 아직 없어 이 파일에 둔다
const FORTUNE_TODAY_LINK_INTRO =
  '생년월일을 기준으로 한 개인 운세는 따로 볼 수 있습니다.';

/**
 * FortuneTodayLinkComponent
 * - 띠별·별자리 페이지에서 오늘의 운세로 가는 링크(D12). 서버 컴포넌트, props 없음.
 * - href는 쿼리·해시 없는 `/fortune/today`. 선택값·입력값을 넘기지 않는다(AC-81).
 */
export function FortuneTodayLinkComponent(): JSX.Element {
  return (
    <div className="mt-4 sm:flex sm:flex-wrap sm:items-baseline sm:gap-x-2">
      <p className="text-sm leading-6 break-keep text-muted-foreground">
        {FORTUNE_TODAY_LINK_INTRO}
      </p>
      <Link
        href={FORTUNE_ROUTES.today}
        className="inline-flex min-h-11 items-center rounded-sm text-base font-medium break-keep text-primary underline underline-offset-4 hover:decoration-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
      >
        {FORTUNE_TODAY_LINK_LABEL}
      </Link>
    </div>
  );
}
