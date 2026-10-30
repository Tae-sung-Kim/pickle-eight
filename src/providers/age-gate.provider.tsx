'use client';
import { useRouter } from 'next/navigation';
import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { AgeGateDialogComponent } from '@/features/lotto/components/age-gate-dialog.component';
import type { LottoAgeGateModeType } from '@/features/lotto/types/lotto.type';

const MODE: LottoAgeGateModeType = ((process.env
  .NEXT_PUBLIC_AGE_GATE_MODE as LottoAgeGateModeType) ||
  (process.env.NODE_ENV === 'development'
    ? 'always'
    : 'session')) as LottoAgeGateModeType;
const SESSION_KEY = `${process.env.NEXT_PUBLIC_SITE_EGN_NAME}_age_gate_verified_sess_v1`;

function isVerified(): boolean {
  if (MODE === 'always') return false; // 항상 확인
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function markVerified(): void {
  if (MODE === 'always') return; // 저장하지 않음
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    /* noop */
  }
}

/**
 * 로또 영역 전용 성인 확인 게이트. 로또 layout 안에서만 사용한다.
 * 확인 전에는 children을 렌더링하지 않고, 닫기/X/dim/Esc는 모두 홈으로 보낸다.
 */
export function AgeGateProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [verified, setVerified] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);

  // 마운트 후 세션 저장소 확인 (SSR 불일치 방지)
  useEffect(() => {
    setVerified(isVerified());
    setReady(true);
  }, []);

  const handleConfirm = useCallback(() => {
    markVerified();
    setVerified(true);
  }, []);

  const handleCancel = useCallback(() => {
    router.replace('/');
  }, [router]);

  return (
    <>
      {verified ? children : null}
      <AgeGateDialogComponent
        open={ready && !verified}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
