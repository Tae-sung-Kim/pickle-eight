'use client';

import dynamic from 'next/dynamic';
import { type JSX, useEffect, useRef, useState } from 'react';
import { useFortuneConsent } from '@/features/fortune/hooks/use-fortune-consent.hook';
import { FortuneConsentGateComponent } from '@/features/fortune/shared/components/consent-gate.component';

const PANEL_CLASS =
  'scroll-mt-20 rounded-panel border border-border bg-card p-5 sm:p-8';
const SKELETON_CLASS = 'animate-pulse bg-muted motion-reduce:animate-none';
// 기존 운세 root와 같은 방식(파일 안 상수). 사주 상수 파일에 로딩 문구가 없다
const LOADING_LABEL = '불러오는 중입니다';

/** panel 지연 로드 중 자리. 제목, 날짜 칸, 버튼 구성을 흉내 낸다 */
function PanelSkeleton(): JSX.Element {
  return (
    <div role="status" aria-busy="true" className={PANEL_CLASS}>
      <span className="sr-only">{LOADING_LABEL}</span>
      <div aria-hidden="true" className="space-y-4">
        <div className={`h-7 w-40 rounded-md ${SKELETON_CLASS}`} />
        <div className="flex gap-3">
          <div className={`h-11 w-24 rounded-lg ${SKELETON_CLASS}`} />
          <div className={`h-11 w-24 rounded-lg ${SKELETON_CLASS}`} />
          <div className={`h-11 w-24 rounded-lg ${SKELETON_CLASS}`} />
        </div>
        <div className={`h-11 w-full rounded-lg sm:w-40 ${SKELETON_CLASS}`} />
      </div>
    </div>
  );
}

// 문구 풀·달력 표·사주 계산 함수는 panel 쪽에서만 import한다. 동의 전에는 이 청크를 받지도 않는다
const FortuneSajuPanelComponent = dynamic(
  () =>
    import('@/features/fortune/saju/components/panel.component').then(
      (module) => module.FortuneSajuPanelComponent
    ),
  { ssr: false, loading: () => <PanelSkeleton /> }
);

/**
 * FortuneSajuComponent (사주 root)
 * - 이 화면의 클라이언트 경계. 동의 게이트가 granted일 때만 panel을 렌더링한다(그 전에는 DOM에 없다).
 * - 서버 컴포넌트(안내·가이드·계산 기준·FAQ 등)는 import하지 않고 page에서 형제로 렌더링한다.
 * - 동의 화면에서 "동의하고 시작"으로 granted가 된 때만 panel이 첫 h2로 포커스를 옮기게 한다.
 */
export function FortuneSajuComponent(): JSX.Element {
  const { status } = useFortuneConsent();
  const previousStatusRef = useRef(status);
  const [shouldFocusTitle, setShouldFocusTitle] = useState(false);

  useEffect(() => {
    const previousStatus = previousStatusRef.current;
    previousStatusRef.current = status;
    if (previousStatus === 'required' && status === 'granted') {
      setShouldFocusTitle(true);
    }
  }, [status]);

  return (
    <FortuneConsentGateComponent>
      <FortuneSajuPanelComponent shouldFocusTitle={shouldFocusTitle} />
    </FortuneConsentGateComponent>
  );
}
