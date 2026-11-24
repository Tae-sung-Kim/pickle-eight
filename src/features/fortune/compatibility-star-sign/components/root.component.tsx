'use client';

import dynamic from 'next/dynamic';
import { type JSX, useEffect, useRef, useState } from 'react';
import {
  FORTUNE_COMPATIBILITY_CONSENT_TEXTS,
  FORTUNE_COMPATIBILITY_DECLINED_TEXTS,
} from '@/features/fortune/constants/fortune-compatibility-notice.constant';
import { useFortuneConsent } from '@/features/fortune/hooks/use-fortune-consent.hook';
import { FortuneConsentGateComponent } from '@/features/fortune/shared/components/consent-gate.component';

const PANEL_CLASS =
  'scroll-mt-4 rounded-panel border border-border bg-card p-5 sm:p-8';
const SKELETON_CLASS = 'animate-pulse bg-muted motion-reduce:animate-none';
const LOADING_LABEL = '불러오는 중입니다';

/** panel 지연 로드 중 자리. 동의 화면과 같은 높이(제목, 안내 두 줄, 항목 행, 버튼 둘)로 그려 아래가 밀리지 않게 한다 */
function PanelSkeleton(): JSX.Element {
  return (
    <div
      role="status"
      aria-busy="true"
      className={`${PANEL_CLASS} max-w-2xl space-y-4`}
    >
      <span className="sr-only">{LOADING_LABEL}</span>
      <div aria-hidden="true" className="space-y-4">
        <div className={`h-7 w-48 rounded-md ${SKELETON_CLASS}`} />
        <div className="space-y-2">
          <div className={`h-4 rounded-md ${SKELETON_CLASS}`} />
          <div className={`h-4 rounded-md ${SKELETON_CLASS}`} />
        </div>
        <div className="space-y-2">
          {FORTUNE_COMPATIBILITY_CONSENT_TEXTS.items.map((item) => (
            <div key={item} className={`h-14 rounded-lg ${SKELETON_CLASS}`} />
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <div className={`h-11 w-40 rounded-lg ${SKELETON_CLASS}`} />
          <div className={`h-11 w-40 rounded-lg ${SKELETON_CLASS}`} />
        </div>
      </div>
    </div>
  );
}

// 문구 묶음은 panel 쪽에서만 import한다. 동의 전에는 이 청크를 받지도 않는다
const FortuneCompatibilityStarSignPanelComponent = dynamic(
  () =>
    import(
      '@/features/fortune/compatibility-star-sign/components/panel.component'
    ).then((module) => module.FortuneCompatibilityStarSignPanelComponent),
  { ssr: false, loading: () => <PanelSkeleton /> }
);

/**
 * FortuneCompatibilityStarSignComponent (별자리 궁합 root)
 * - 이 화면의 클라이언트 경계. 궁합 동의 게이트가 granted일 때만 panel을 렌더링한다(그 전에는 DOM에 없다).
 * - 서버 컴포넌트(면책·안내·가이드·FAQ 등)는 import하지 않고 page에서 형제로 렌더링한다.
 * - 동의 화면에서 "동의하고 시작"으로 granted가 된 때만 panel이 첫 단계 h2로 포커스를 옮기게 한다.
 */
export function FortuneCompatibilityStarSignComponent(): JSX.Element {
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
    <FortuneConsentGateComponent
      consentTexts={FORTUNE_COMPATIBILITY_CONSENT_TEXTS}
      declinedTexts={FORTUNE_COMPATIBILITY_DECLINED_TEXTS}
    >
      <FortuneCompatibilityStarSignPanelComponent
        shouldFocusTitle={shouldFocusTitle}
      />
    </FortuneConsentGateComponent>
  );
}
