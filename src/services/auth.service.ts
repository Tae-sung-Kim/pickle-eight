import { getApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  type User,
} from 'firebase/auth';

/**
 * Firebase Auth singleton accessor
 */
export function authInstance() {
  const app = getApp();
  return getAuth(app);
}

/**
 * Ensure anonymous sign-in. Returns current user after sign-in completes.
 */
export async function ensureAnonymousUser(): Promise<User> {
  const auth = authInstance();
  if (auth.currentUser) return auth.currentUser;
  const { user } = await signInAnonymously(auth);
  return user;
}

/**
 * Subscribe to auth state changes.
 */
export function subscribeAuth(
  handler: (user: User | null) => void
): () => void {
  const auth = authInstance();
  return onAuthStateChanged(auth, handler);
}

/**
 * Get current user synchronously (may be null before hydration)
 */
export function currentUser(): User | null {
  return authInstance().currentUser;
}
