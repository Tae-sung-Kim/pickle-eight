import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Very lightweight, cookie-signed rate limit: N requests per WINDOW_MS per client.
// This is an extra safety net on top of server-side daily IP/device limits.
const RATE_LIMIT_PER_MIN = 10 as const; // adjust as needed
const WINDOW_MS = 60_000 as const;
const COOKIE_NAME = 'iprl' as const;

const textEncoder = new TextEncoder();

async function hmacSHA256Hex(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, textEncoder.encode(value));
  const bytes = new Uint8Array(sig);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function getClientIp(req: NextRequest): string | null {
  const h = req.headers;
  return (
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    null
  );
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  // Only enforce for the target path; matcher below should already scope this.
  const url = new URL(req.url);
  if (url.pathname !== '/api/credits/claim') {
    return NextResponse.next();
  }

  const ip = getClientIp(req) ?? 'unknown';
  // Bind secret to process.env; do NOT fall back to dev-secret in production.
  const secret = process.env.DEVICE_COOKIE_SECRET || 'dev-secret';

  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const now = Date.now();

  let resetAt = now + WINDOW_MS;
  let count = 0;

  if (cookie) {
    const [raw, sig] = cookie.split('.');
    if (raw && sig) {
      const expected = await hmacSHA256Hex(secret, `${ip}|${raw}`);
      if (expected === sig) {
        const [rAtStr, cStr] = raw.split(':');
        const rAt = Number(rAtStr);
        const c = Number(cStr);
        if (Number.isFinite(rAt) && Number.isFinite(c)) {
          if (now <= rAt) {
            resetAt = rAt;
            count = c;
          }
        }
      }
    }
  }

  if (now > resetAt) {
    // Start a new window
    resetAt = now + WINDOW_MS;
    count = 0;
  }

  if (count >= RATE_LIMIT_PER_MIN) {
    return NextResponse.json(
      { ok: false, code: 'ratelimit/ip-minute' },
      { status: 429 }
    );
  }

  // Increment and re-issue signed cookie (httpOnly, secure)
  count += 1;
  const raw = `${resetAt}:${count}`;
  const sig = await hmacSHA256Hex(secret, `${ip}|${raw}`);
  const res = NextResponse.next();
  res.cookies.set(COOKIE_NAME, `${raw}.${sig}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 60 * 5, // keep short; sliding window
  });
  return res;
}

export const config = {
  matcher: ['/api/credits/claim'],
};
