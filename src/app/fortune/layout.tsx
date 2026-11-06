import type { ReactNode } from 'react';
import { FortuneConsentProvider } from '@/features/fortune/shared/components/consent.provider';

type FortuneLayoutPropsType = Readonly<{
  children: ReactNode;
}>;

/**
 * 운세 이용 동의 상태를 /fortune/* 전체가 같이 쓰도록 감싼다.
 * h1과 문구는 그리지 않는다. 서버 children은 그대로 서버 HTML로 렌더링된다.
 */
export default function FortuneLayout({ children }: FortuneLayoutPropsType) {
  return <FortuneConsentProvider>{children}</FortuneConsentProvider>;
}
