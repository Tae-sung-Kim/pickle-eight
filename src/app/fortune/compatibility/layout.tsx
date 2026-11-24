import type { ReactNode } from 'react';
import { FortuneConsentProvider } from '@/features/fortune/shared/components/consent.provider';

type FortuneCompatibilityLayoutPropsType = Readonly<{
  children: ReactNode;
}>;

/**
 * 궁합 동의 상태를 /fortune/compatibility/* 가 같이 쓰도록 감싼다.
 * 운세 Provider 안쪽에서 가장 가까운 Provider가 궁합 범위로 덮어쓴다.
 * h1과 문구는 그리지 않는다. 서버 children은 그대로 서버 HTML로 렌더링된다.
 */
export default function FortuneCompatibilityLayout({
  children,
}: FortuneCompatibilityLayoutPropsType) {
  return (
    <FortuneConsentProvider scope="compatibility">
      {children}
    </FortuneConsentProvider>
  );
}
