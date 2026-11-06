'use client';

import dynamic from 'next/dynamic';
import { type JSX, useEffect, useRef, useState } from 'react';
import { useFortuneConsent } from '@/features/fortune/hooks/use-fortune-consent.hook';
import { FortuneConsentGateComponent } from '@/features/fortune/shared/components/consent-gate.component';

const PANEL_CLASS =
  'scroll-mt-20 rounded-panel border border-border bg-card p-5 sm:p-8';
const SKELETON_CLASS = 'animate-pulse bg-muted motion-reduce:animate-none';
const LOADING_LABEL = '불러오는 중입니다';
const CHIP_SKELETON_COUNT = 12;

/** panel 지연 로드 중 자리. 칩 12개와 찾기 면(입력 줄, 버튼)을 흉내 낸다 */
function PanelSkeleton(): JSX.Element {
  return (
    <div role="status" aria-busy="true" className={PANEL_CLASS}>
      <span className="sr-only">{LOADING_LABEL}</span>
      <div
        aria-hidden="true"
        className="space-y-4 md:grid md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-8 md:space-y-0"
      >
        <div className="space-y-4">
          <div className={`h-7 w-48 rounded-md ${SKELETON_CLASS}`} />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: CHIP_SKELETON_COUNT }, (_, index) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: 순서가 바뀌지 않는 장식용 자리 표시
                key={index}
                className={`h-11 rounded-md ${SKELETON_CLASS}`}
              />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className={`h-7 w-36 rounded-md ${SKELETON_CLASS}`} />
          <div className="flex gap-3">
            <div className={`h-11 w-24 rounded-lg ${SKELETON_CLASS}`} />
            <div className={`h-11 w-16 rounded-lg ${SKELETON_CLASS}`} />
            <div className={`h-11 w-16 rounded-lg ${SKELETON_CLASS}`} />
          </div>
          <div className={`h-11 w-full rounded-lg ${SKELETON_CLASS}`} />
        </div>
      </div>
    </div>
  );
}

// panel은 동의(granted) 뒤에만 내려받는다. 문구 풀·달력 표는 panel 아래에서만 import한다
const FortuneTtiPanelComponent = dynamic(
  () =>
    import('@/features/fortune/tti/components/panel.component').then(
      (module) => module.FortuneTtiPanelComponent
    ),
  { ssr: false, loading: () => <PanelSkeleton /> }
);

/**
 * FortuneTtiComponent (띠별 운세 root)
 * - 이 화면의 클라이언트 경계. 동의 게이트가 granted일 때만 panel을 렌더링한다(그 전에는 DOM에 없다).
 * - 서버 컴포넌트(안내·가이드·FAQ·오늘의 운세 링크 등)는 import하지 않고 page에서 형제로 렌더링한다.
 * - 동의 화면에서 "동의하고 시작"으로 granted가 된 때만 panel이 첫 h2로 포커스를 옮기게 한다.
 *   이미 동의한 탭의 첫 로드에서는 옮기지 않는다.
 */
export function FortuneTtiComponent(): JSX.Element {
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
      <FortuneTtiPanelComponent shouldFocusTitle={shouldFocusTitle} />
    </FortuneConsentGateComponent>
  );
}
