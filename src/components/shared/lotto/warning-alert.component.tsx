import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { LottoWarningToneType } from '@/types';

export function LottoWarningAlertComponent({
  className,
  tone = 'warning',
  includeAgeNotice = true,
}: {
  className?: string;
  tone?: LottoWarningToneType;
  includeAgeNotice?: boolean;
}) {
  const toneClass =
    tone === 'danger'
      ? 'border-red-200 bg-red-50 text-red-900'
      : tone === 'warning'
      ? 'border-amber-200 bg-amber-50 text-amber-900'
      : '';
  const iconClass =
    tone === 'danger'
      ? 'text-red-600'
      : tone === 'warning'
      ? 'text-amber-600'
      : '';
  return (
    <Alert className={`${toneClass} ${className ?? ''}`.trim()}>
      <AlertTriangle className={iconClass} />
      <AlertTitle>중요 안내</AlertTitle>
      <AlertDescription>
        {includeAgeNotice && (
          <p>
            본 서비스는 만 19세 이상 이용 가능합니다. 건전한 이용을 권장하며,
            과도한 구매는 금물입니다.
          </p>
        )}
        <p>
          본 서비스의 결과는 참고용입니다. 시스템을 100% 신뢰하지 마시고 반드시
          매장 또는 공식 채널에서 다시 확인해 주세요.
        </p>
      </AlertDescription>
    </Alert>
  );
}
