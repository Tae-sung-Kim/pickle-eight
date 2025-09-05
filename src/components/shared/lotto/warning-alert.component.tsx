import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { LottoWarningAlertSpaceType, LottoWarningToneType } from '@/types';
import {
  LOTTO_ALERT_TONE_STYLES,
  LOTTO_WARNING_SPACING,
  LOTTO_WARNING_TONE_ENUM,
  LOTTO_WARNING_X_PADDING,
} from '@/constants';

export function LottoWarningAlertComponent({
  className,
  tone = LOTTO_WARNING_TONE_ENUM.WARNING,
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
        className={`${toneClass} ${spacingClass} rounded-lg p-3 md:p-3.5 ${
          className ?? ''
        }`.trim()}
      >
        <AlertTriangle className={`${iconClass} h-4 w-4`} />
        <AlertTitle className="sr-only text-[13px] font-medium">
          유의사항
        </AlertTitle>
        <AlertDescription className="text-[12px] leading-relaxed">
          {includeAgeNotice && (
            <p>
              본 서비스는 만 19세 이상 대상입니다. 책임 있는 이용을 권장합니다.
            </p>
          )}
          <p>
            제공되는 결과는 참고용이며, 최신 정보는 공식 채널에서 확인하세요.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
