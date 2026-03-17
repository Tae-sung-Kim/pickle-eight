import { adminAuth } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Standardized error responder for API routes.
 */
export function bad(status: number, message: string) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/**
 * Extracts and verifies the Firebase user ID from the Authorization header.
 */
export async function verifyUid(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('authorization');
  const idToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;
  if (!idToken) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return decoded.uid;
  } catch {
    return null;
  }
}

/**
 * Extract the first JSON object substring in a text.
 */
export function extractFirstJsonObject(text: string): string | null {
  let depth = 0;
  let start = -1;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '{') {
      if (depth === 0) start = i;
      depth += 1;
    } else if (ch === '}') {
      depth -= 1;
      if (depth === 0 && start !== -1) {
        return text.substring(start, i + 1);
      }
    }
  }
  return null;
}
