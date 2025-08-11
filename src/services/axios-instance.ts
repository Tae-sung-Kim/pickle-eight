/**
 * Axios instance for API requests with interceptors
 * @module axios-instance
 */
import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { useLoadingStore } from '@/stores';

/**
 * 인증 토큰을 가져오는 함수 (나중에 구현)
 * 예: Firebase Auth, LocalStorage 등에서 토큰을 가져올 수 있음
 */
async function getAuthToken(): Promise<string | null> {
  // TODO: 실제 인증 로직에 맞게 구현 (ex. Firebase, LocalStorage 등)
  // 예시: return localStorage.getItem("ACCESS_TOKEN");
  return null;
}

/**
 * API 요청에 사용할 Axios 인스턴스
 */
export const apiInstance: AxiosInstance = axios.create({
  baseURL: '/api', // Next.js API Route 기준
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 요청 인터셉터: 인증 토큰 자동 첨부 및 로딩 시작
 */
apiInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    useLoadingStore.getState().showLoading();
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
apiInstance.interceptors.response.use(
  (response) => {
    useLoadingStore.getState().hideLoading();
    return response;
  },
  (error: AxiosError) => {
    useLoadingStore.getState().hideLoading();
    // 예: 401 에러 시 자동 로그아웃, 알림 등 처리 가능
    if (error.response?.status === 401) {
      // TODO: 로그아웃 처리, 토스트 알림 등
      // ex) window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
