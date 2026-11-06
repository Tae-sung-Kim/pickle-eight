import { EyeOff, Info } from 'lucide-react';
import type { JSX } from 'react';

import {
  FORTUNE_AGE_INPUT_NOTICE,
  FORTUNE_PRIVACY_INPUT_NOTICE,
} from '@/features/fortune/constants/fortune-notice.constant';

/**
 * FortuneInputNoticeComponent
 * - 입력 영역 바로 위의 개인정보·연령·책임 고지 두 문단. 서버 컴포넌트.
 * - 간격(위 mt-6, 아래 mb-3)은 상시 면책과 패널 사이에 놓는 페이지가 정한다.
 */
export function FortuneInputNoticeComponent(): JSX.Element {
  return (
    <div className="mx-auto max-w-4xl space-y-1 text-sm leading-6 text-muted-foreground">
      <p className="flex items-start gap-2 break-keep">
        <EyeOff size={16} aria-hidden="true" className="mt-1 shrink-0" />
        <span>{FORTUNE_PRIVACY_INPUT_NOTICE}</span>
      </p>
      <p className="flex items-start gap-2 break-keep">
        <Info size={16} aria-hidden="true" className="mt-1 shrink-0" />
        <span>{FORTUNE_AGE_INPUT_NOTICE}</span>
      </p>
    </div>
  );
}
