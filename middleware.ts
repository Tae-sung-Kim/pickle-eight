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
  // Only enforce for matched paths (see config.matcher)
  const url = new URL(req.url);
  const pathname = url.pathname;
  const isCreditsClaim: boolean = pathname === '/api/credits/claim';
  const isCsvExport: boolean = pathname === '/api/lotto/export';
  const inScope: boolean = isCreditsClaim || isCsvExport;
  if (!inScope) {
    return NextResponse.next();
  }

  const ip: string = getClientIp(req) ?? 'unknown';
  // Harden secret usage: production must have a secret, otherwise block
  const envSecret = process.env.DEVICE_COOKIE_SECRET;
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd && !envSecret) {
    return NextResponse.json(
      { ok: false, code: 'config/missing-device-cookie-secret' },
      { status: 500 }
    );
  }
  const secret: string = envSecret || 'dev-secret';

  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const now: number = Date.now();

  let resetAt: number = now + WINDOW_MS;
  let count: number = 0;

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

  // Prepare downstream request headers
  count += 1;
  const rateRaw: string = `${resetAt}:${count}`;
  const rateSig: string = await hmacSHA256Hex(secret, `${ip}|${rateRaw}`);

  // Create response
  const res = NextResponse.next();

  // Debug headers to verify middleware execution
  res.headers.set('x-mw', '1');

  // Set rate-limit cookie on response
  res.cookies.set(COOKIE_NAME, `${rateRaw}.${rateSig}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 5, // keep short; sliding window
  });

  return res;
}

export const config = {
  matcher: ['/api/:path*'],
};
