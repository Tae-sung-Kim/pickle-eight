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
  'scroll-mt-20 rounded-panel border border-border bg-card p-5 sm:p-8';
const SKELETON_CLASS = 'animate-pulse bg-muted motion-reduce:animate-none';
// 공용 게이트 스켈레톤의 문구와 같은 값. 게이트의 스켈레톤은 내보내지 않아 여기에 둔다
const LOADING_LABEL = '불러오는 중입니다';

/** panel 지연 로드 중 자리. 동의 화면과 같은 높이(제목, 안내 두 줄, 항목 4개, 버튼 둘) */
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

// panel은 동의(granted) 뒤에만 내려받는다. 문구 묶음·달력 표는 panel 아래에서만 import한다
const FortuneCompatibilityTtiPanelComponent = dynamic(
  () =>
    import(
      '@/features/fortune/compatibility-tti/components/panel.component'
    ).then((module) => module.FortuneCompatibilityTtiPanelComponent),
  { ssr: false, loading: () => <PanelSkeleton /> }
);

/**
 * FortuneCompatibilityTtiComponent (띠 궁합 root)
 * - 이 화면의 클라이언트 경계. 궁합 동의 게이트가 granted일 때만 panel을 렌더링한다(그 전에는 DOM에 없다).
 * - 서버 컴포넌트(안내·가이드·FAQ·링크)는 import하지 않고 page에서 형제로 렌더링한다.
 * - 동의 화면에서 "동의하고 시작"으로 granted가 된 때만 panel이 첫 단계 h2로 포커스를 옮긴다.
 */
export function FortuneCompatibilityTtiComponent(): JSX.Element {
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
      <FortuneCompatibilityTtiPanelComponent
        shouldFocusTitle={shouldFocusTitle}
      />
    </FortuneConsentGateComponent>
  );
}
