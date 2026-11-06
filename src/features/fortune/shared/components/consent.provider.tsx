'use client';

import {
  createContext,
  type JSX,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import {
  clearFortuneConsent,
  readFortuneConsent,
  writeFortuneConsent,
} from '@/features/fortune/services/fortune-consent-storage.service';
import type { FortuneConsentStatusType } from '@/features/fortune/types/fortune.type';

type FortuneConsentActionType =
  | Readonly<{ type: 'RESTORE'; isGranted: boolean }>
  | Readonly<{ type: 'GRANT' }>
  | Readonly<{ type: 'DECLINE' }>
  | Readonly<{ type: 'BACK' }>
  | Readonly<{ type: 'RESET' }>;

export type FortuneConsentContextType = Readonly<{
  status: FortuneConsentStatusType;
  grant: () => void;
  decline: () => void;
  back: () => void;
  reset: () => void;
}>;

export type FortuneConsentProviderPropsType = Readonly<{
  children: ReactNode;
}>;

export const FortuneConsentContext =
  createContext<FortuneConsentContextType | null>(null);

function reducer(
  state: FortuneConsentStatusType,
  action: FortuneConsentActionType
): FortuneConsentStatusType {
  switch (action.type) {
    case 'RESTORE':
      // 마운트 후 저장소 확인 결과만 반영한다. 이미 사용자가 고른 상태는 덮지 않는다
      if (state !== 'checking') return state;
      return action.isGranted ? 'granted' : 'required';
    case 'GRANT':
      return 'granted';
    case 'DECLINE':
      return 'declined';
    case 'BACK':
    case 'RESET':
      return 'required';
  }
}

/**
 * 운세 이용 동의 상태. 쿠키 동의(ConsentProvider)와 상태를 섞지 않는다.
 * 서버 렌더와 첫 클라이언트 렌더는 checking으로 같게 그리고(hydration 불일치 방지),
 * 마운트 뒤에 저장소를 읽기만 한다(허브 방문이 상태를 만들거나 지우지 않는다).
 * 동의 여부를 분석·알림 이벤트나 console로 보내지 않는다.
 */
export function FortuneConsentProvider({
  children,
}: FortuneConsentProviderPropsType): JSX.Element {
  const [status, dispatch] = useReducer(reducer, 'checking');

  useEffect(() => {
    dispatch({ type: 'RESTORE', isGranted: readFortuneConsent() });
  }, []);

  // 저장에 실패해도(시크릿 모드, 저장소 차단) granted로 간다. 다음 로드에서 다시 묻는다
  const grant = useCallback((): void => {
    writeFortuneConsent();
    dispatch({ type: 'GRANT' });
  }, []);

  // 동의하지 않음은 저장하지 않는다
  const decline = useCallback((): void => {
    dispatch({ type: 'DECLINE' });
  }, []);

  const back = useCallback((): void => {
    dispatch({ type: 'BACK' });
  }, []);

  const reset = useCallback((): void => {
    clearFortuneConsent();
    dispatch({ type: 'RESET' });
  }, []);

  const value = useMemo<FortuneConsentContextType>(
    () => ({ status, grant, decline, back, reset }),
    [status, grant, decline, back, reset]
  );

  return (
    <FortuneConsentContext.Provider value={value}>
      {children}
    </FortuneConsentContext.Provider>
  );
}
