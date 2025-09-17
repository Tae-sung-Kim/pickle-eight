/**
 * Axios instance for API requests with interceptors
 * @module axios-instance
 */
import { useLoadingStore } from "@/stores/loading.store";
import axios, {
    AxiosError,
    AxiosInstance,
    InternalAxiosRequestConfig,
} from 'axios';

const isServer = typeof window === 'undefined';
const origin = process.env.NEXT_PUBLIC_SITE_URL;
const resolvedBaseURL = isServer && origin ? `${origin}/api` : '/api';

/**
 * 인증 토큰을 가져오는 함수: Firebase Auth 사용
 * - 클라이언트에서 익명 세션을 보장한 뒤 ID 토큰을 반환
 */
async function getAuthToken(): Promise<string | null> {
  if (isServer) return null;
  try {
    const mod = await import('@/lib/firebase-config');
    const { auth, ensureAnonUser } = mod;
    if (!auth.currentUser) {
      await ensureAnonUser();
    }
    const user = auth.currentUser;
    if (!user) return null;
    const token = await user.getIdToken();
    return token ?? null;
  } catch {
    return null;
  }
}

/**
 * API 요청에 사용할 Axios 인스턴스
 */
export const http: AxiosInstance = axios.create({
  baseURL: resolvedBaseURL, // Next.js API Route 기준 (server에서는 절대 URL 사용)
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 요청 인터셉터: 인증 토큰 자동 첨부 및 로딩 시작
 */
http.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const h = (config.headers || {}) as Record<string, unknown>;
    const skipLoading =
      h['x-skip-loading'] === '1' || h['X-Skip-Loading'] === '1';
    if (!isServer && !skipLoading) {
      useLoadingStore.getState().showLoading();
    }
    const token = await getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * 응답 인터셉터: 에러 공통 처리 및 로딩 종료
 */
http.interceptors.response.use(
  (response) => {
    const h = (response.config.headers || {}) as Record<string, unknown>;
    const skipLoading =
      h['x-skip-loading'] === '1' || h['X-Skip-Loading'] === '1';
    if (!isServer && !skipLoading) {
      useLoadingStore.getState().hideLoading();
    }
    return response;
  },
  (error: AxiosError) => {
    const h = (error.config?.headers || {}) as Record<string, unknown>;
    const skipLoading =
      h['x-skip-loading'] === '1' || h['X-Skip-Loading'] === '1';
    if (!isServer && !skipLoading) {
      useLoadingStore.getState().hideLoading();
    }
    // 예: 401 에러 시 자동 로그아웃, 알림 등 처리 가능
    if (error.response?.status === 401) {
      // TODO: 로그아웃 처리, 토스트 알림 등
      // ex) window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
