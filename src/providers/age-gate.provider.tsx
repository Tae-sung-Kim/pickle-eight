'use client';
import { AgeGateDialogComponent } from '@/components/shared/lotto/age-gate-dialog.component';
import { MENU_GROUP_NAME_ENUM } from '@/constants/menu.constant';
import { LottoAgeGateModeType } from '@/types/lotto.type';
import { useRouter } from 'next/navigation';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

const MODE: LottoAgeGateModeType = ((process.env
  .NEXT_PUBLIC_AGE_GATE_MODE as LottoAgeGateModeType) ||
  (process.env.NODE_ENV === 'development'
    ? 'always'
    : 'session')) as LottoAgeGateModeType;
const SESSION_KEY = `${process.env.NEXT_PUBLIC_SITE_NAME}_age_gate_verified_sess_v1`;

function isSameOrigin(url: string): boolean {
  try {
    const u = new URL(url, window.location.href);
    return u.origin === window.location.origin;
  } catch {
    return false;
  }
}

function shouldGuardPath(pathname: string): boolean {
  return pathname.startsWith('/' + MENU_GROUP_NAME_ENUM.LOTTO);
}

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

export function AgeGateProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const pendingHrefRef = useRef<string | null>(null);
  const openRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(false);

  const close = useCallback(() => setOpen(false), []);

  const handleConfirm = useCallback(() => {
    const href = pendingHrefRef.current;
    markVerified();
    close();
    if (href) router.push(href);
    pendingHrefRef.current = null;
  }, [close, router]);

  const handleCancel = useCallback(() => {
    const hadPending = Boolean(pendingHrefRef.current);
    pendingHrefRef.current = null;
    close();
    // 직접 진입(대기 href 없음)일 때만 홈으로 이동
    if (!hadPending) {
      router.replace('/');
    }
  }, [close, router]);

  const clickHandler = useMemo<(e: MouseEvent) => void>(() => {
    return (e: MouseEvent) => {
      // 수정키 클릭, 비좌클릭, 이미 취소된 이벤트는 패스
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as Element | null;
      if (!target) return;
      const anchor = target.closest('a');
      if (!anchor) return;

      const hrefAttr = (anchor as HTMLAnchorElement).getAttribute('href') || '';
      if (!hrefAttr || hrefAttr.startsWith('#')) return;

      // 외부 링크/다른 오리진/target=_blank 등은 패스
      const aEl = anchor as HTMLAnchorElement;
      if (aEl.target === '_blank') return;

      const url = new URL(aEl.href, window.location.href);
      if (!isSameOrigin(url.href)) return;

      const pathname = url.pathname;
      if (!shouldGuardPath(pathname)) return;

      if (isVerified()) return; // 이미 검증됨

      // 여기서 네비게이션 차단 후 모달 오픈
      e.preventDefault();
      pendingHrefRef.current = url.pathname + url.search + url.hash;
      if (!openRef.current) {
        try {
          const active = document.activeElement as HTMLElement | null;
          active?.blur();
          requestAnimationFrame(() => {
            // Sheet는 Escape로 닫힘; 버블링 가능한 이벤트로 보냄
            const evt = new KeyboardEvent('keydown', {
              key: 'Escape',
              code: 'Escape',
              bubbles: true,
              cancelable: true,
            });
            document.dispatchEvent(evt);
            // 다음 태스크로 모달 오픈하여 레이스 방지
            setTimeout(() => setOpen(true), 0);
          });
        } catch {
          setOpen(true);
        }
      } else {
        console.log('[AgeGate] open suppressed (already open)');
      }
    };
  }, []);

  useEffect(() => {
    // capture 단계에서 가로채기
    document.addEventListener('click', clickHandler, true);
    return () => document.removeEventListener('click', clickHandler, true);
  }, [clickHandler]);

  // 직접 URL로 진입한 경우도 가드
  useEffect(() => {
    if (mountedRef.current) {
      return;
    }
    mountedRef.current = true;
    try {
      const pathname = window.location.pathname;
      if (!shouldGuardPath(pathname)) return;
      if (isVerified()) return;
      pendingHrefRef.current = null; // 현재 페이지 유지
      if (!openRef.current) {
        setOpen(true);
      }
    } catch {
      // noop
    }
  }, []);

  // openRef 동기화 및 중복 마운트 가시화
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  return (
    <>
      {children}
      <AgeGateDialogComponent
        open={open}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
