import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { useLoadingStore } from '@/stores/loading.store';

const isServer = typeof window === 'undefined';
const origin = process.env.NEXT_PUBLIC_SITE_URL;
const resolvedBaseURL = isServer && origin ? `${origin}/api` : '/api';

export const http: AxiosInstance = axios.create({
  baseURL: resolvedBaseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

function shouldSkipLoading(headers: unknown): boolean {
  const h = (headers || {}) as Record<string, unknown>;
  return h['x-skip-loading'] === '1' || h['X-Skip-Loading'] === '1';
}

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (!isServer && !shouldSkipLoading(config.headers)) {
      useLoadingStore.getState().showLoading();
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

http.interceptors.response.use(
  (response) => {
    if (!isServer && !shouldSkipLoading(response.config.headers)) {
      useLoadingStore.getState().hideLoading();
    }
    return response;
  },
  (error: AxiosError) => {
    if (!isServer && !shouldSkipLoading(error.config?.headers)) {
      useLoadingStore.getState().hideLoading();
    }
    return Promise.reject(error);
  }
);
