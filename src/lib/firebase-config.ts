import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth: Auth = getAuth(app);

let appCheckInitialized = false;

/**
 * Initialize App Check (disabled). No-op by design.
 */
export const ensureAppCheck = (): null => {
  if (typeof window === 'undefined') return null;
  if (appCheckInitialized) return null;
  appCheckInitialized = true;
  return null;
};

/**
 * Get App Check token for custom API requests (disabled). Always returns null.
 */
export const getAppCheckToken = async (): Promise<string | null> => {
  ensureAppCheck();
  return null;
};

/**
 * Analytics 인스턴스를 클라이언트에서만 안전하게 반환
 */
export const getAnalyticsClient = async (): Promise<Analytics | null> => {
  // 개발일때는 안 타게
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'development') {
    return null;
  }
  const supported = await isSupported();
  if (!supported) return null;
  return getAnalytics(app);
};

/**
 * Ensure anonymous auth session exists and return current user.
 */
export const ensureAnonUser = async (): Promise<User> => {
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
  return new Promise<User>((resolve) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        unsub();
        resolve(u);
      }
    });
  });
};

export { app, db, auth };
