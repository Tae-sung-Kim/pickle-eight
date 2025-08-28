import { getApps, initializeApp, cert, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getAppCheck } from 'firebase-admin/app-check';

/**
 * Initialize firebase-admin with service account from env.
 */
const app = !getApps().length
  ? initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  : getApp();

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
export const adminAppCheck = getAppCheck(app);

export type VerifiedContext = {
  uid: string;
  appCheckToken: string | null;
  ip: string | null;
  deviceId: string | null;
};
