import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { LottoWarningAlertSpaceType, LottoWarningToneType } from '@/types';
import {
  LOTTO_ALERT_TONE_STYLES,
  LOTTO_WARNING_SPACING,
  LOTTO_WARNING_X_PADDING,
} from '@/constants';

export function LottoWarningAlertComponent({
  className,
  tone = 'warning',
  includeAgeNotice = true,
  space = 'md',
  xSpace = 'md',
}: {
  className?: string;
  tone?: LottoWarningToneType;
  includeAgeNotice?: boolean;
  space?: LottoWarningAlertSpaceType;
  xSpace?: LottoWarningAlertSpaceType;
}) {
  const toneClass = LOTTO_ALERT_TONE_STYLES[tone]?.container ?? '';
  const iconClass = LOTTO_ALERT_TONE_STYLES[tone]?.icon ?? '';
  const spacingClass = LOTTO_WARNING_SPACING[space] ?? LOTTO_WARNING_SPACING.md;
  const xPaddingClass =
    LOTTO_WARNING_X_PADDING[xSpace] ?? LOTTO_WARNING_X_PADDING.md;

  return (
    <div className={xPaddingClass}>
      <Alert
        className={`${toneClass} ${spacingClass} rounded-xl p-4 md:p-5 shadow-sm ring-1 ring-black/5 ${
          className ?? ''
        }`.trim()}
      >
        <AlertTriangle className={iconClass} />
        <AlertTitle>중요 안내</AlertTitle>
        <AlertDescription className="leading-relaxed">
          {includeAgeNotice && (
            <p>
              본 서비스는 만 19세 이상 이용 가능합니다. 건전한 이용을 권장하며,
              과도한 구매는 금물입니다.
            </p>
          )}
          <p>
            본 서비스의 결과는 참고용입니다. 시스템을 100% 신뢰하지 마시고
            반드시 매장 또는 공식 채널에서 다시 확인해 주세요.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
