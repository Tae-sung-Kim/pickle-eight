import { useContext } from 'react';
import {
  FortuneConsentContext,
  type FortuneConsentContextType,
} from '@/features/fortune/shared/components/consent.provider';

/** 운세 이용 동의 상태. FortuneConsentProvider(fortune 레이아웃) 안에서만 쓴다 */
export function useFortuneConsent(): FortuneConsentContextType {
  const context = useContext(FortuneConsentContext);
  if (!context) {
    throw new Error(
      'useFortuneConsent는 FortuneConsentProvider 안에서 써야 합니다.'
    );
  }
  return context;
}
