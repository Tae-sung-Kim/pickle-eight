'use client';

import { type JSX, type ReactNode, useEffect, useRef } from 'react';
import { useFortuneConsent } from '@/features/fortune/hooks/use-fortune-consent.hook';
import { FortuneConsentDeclinedComponent } from '@/features/fortune/shared/components/consent-declined.component';
import { FortuneConsentFormComponent } from '@/features/fortune/shared/components/consent-form.component';

export type FortuneConsentGateComponentPropsType = Readonly<{
  /** 기능 영역. granted일 때만 렌더링한다(그 전에는 입력칸·결과가 DOM에 없다) */
  children: ReactNode;
}>;

const PANEL_CLASS =
  'scroll-mt-20 rounded-panel border border-border bg-card p-5 sm:p-8';
const SKELETON_CLASS = 'animate-pulse bg-muted motion-reduce:animate-none';
const LOADING_LABEL = '불러오는 중입니다';

function ConsentSkeleton(): JSX.Element {
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
          <div className={`h-14 rounded-lg ${SKELETON_CLASS}`} />
          <div className={`h-14 rounded-lg ${SKELETON_CLASS}`} />
          <div className={`h-14 rounded-lg ${SKELETON_CLASS}`} />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <div className={`h-11 w-40 rounded-lg ${SKELETON_CLASS}`} />
          <div className={`h-11 w-40 rounded-lg ${SKELETON_CLASS}`} />
        </div>
      </div>
    </div>
  );
}

/**
 * 이용 동의 상태별로 화면을 바꾼다.
 * checking 스켈레톤 / required 동의 화면 / declined 이용 불가 화면 / granted children.
 * 동의하지 않으면 서비스를 제공하지 않는다: granted가 아니면 children을 렌더링하지 않는다.
 * 전환 모션은 없다(법적 확인 화면은 움직임 없이 바로 읽혀야 한다).
 */
export function FortuneConsentGateComponent({
  children,
}: FortuneConsentGateComponentPropsType): JSX.Element {
  const { status, grant, decline, back } = useFortuneConsent();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const previousStatusRef = useRef(status);

  // 사용자가 화면을 바꿨을 때(돌아가기, 동의하지 않음, 동의 다시 설정)만 새 화면 제목으로 포커스를 옮긴다.
  // 첫 로드(checking → 결과)에서는 옮기지 않는다
  useEffect(() => {
    const previousStatus = previousStatusRef.current;
    previousStatusRef.current = status;
    if (previousStatus === 'checking' || previousStatus === status) return;
    if (status === 'required' || status === 'declined') {
      titleRef.current?.focus();
    }
  }, [status]);

  if (status === 'checking') return <ConsentSkeleton />;

  if (status === 'required') {
    return (
      <div className={PANEL_CLASS}>
        <FortuneConsentFormComponent
          onGrant={grant}
          onDecline={decline}
          titleRef={titleRef}
        />
      </div>
    );
  }

  if (status === 'declined') {
    return (
      <div className={PANEL_CLASS}>
        <FortuneConsentDeclinedComponent onBack={back} titleRef={titleRef} />
      </div>
    );
  }

  return <>{children}</>;
}
