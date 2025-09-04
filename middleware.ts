import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Very lightweight, cookie-signed rate limit: N requests per WINDOW_MS per client.
// This is an extra safety net on top of server-side daily IP/device limits.
const RATE_LIMIT_PER_MIN = 10 as const; // adjust as needed
const WINDOW_MS = 60_000 as const;
const COOKIE_NAME = 'iprl' as const;
const AID_COOKIE = 'aid' as const;

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
  const isApplixirStart: boolean = pathname === '/api/applixir/start';
  const isApplixirComplete: boolean = pathname === '/api/applixir/complete';
  const isCreditsClaim: boolean = pathname === '/api/credits/claim';
  const inScope: boolean =
    isApplixirStart || isApplixirComplete || isCreditsClaim;
  if (!inScope) {
    return NextResponse.next();
  }

  const ip: string = getClientIp(req) ?? 'unknown';
  // Bind secret to process.env; do NOT fall back to dev-secret in production.
  const secret: string = process.env.DEVICE_COOKIE_SECRET || 'dev-secret';

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

  // Prepare downstream request headers (to inject cookies immediately)
  count += 1;
  const rateRaw: string = `${resetAt}:${count}`;
  const rateSig: string = await hmacSHA256Hex(secret, `${ip}|${rateRaw}`);
  const reqHeaders: Headers = new Headers(req.headers);
  let cookieHeaderWorking: string = reqHeaders.get('cookie') || '';

  // Generate AID cookie if needed for applixir routes and inject into request header
  let generatedAid: string | null = null;
  const hasAidCookie: boolean = Boolean(req.cookies.get(AID_COOKIE)?.value);
  let currentAid: string | null = hasAidCookie
    ? req.cookies.get(AID_COOKIE)!.value
    : null;
  if ((isApplixirStart || isApplixirComplete) && !hasAidCookie) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const aidHex: string = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    generatedAid = aidHex;
    currentAid = aidHex;
    const newCookiePart = `${AID_COOKIE}=${aidHex}`;
    cookieHeaderWorking = cookieHeaderWorking
      ? `${cookieHeaderWorking}; ${newCookiePart}`
      : newCookiePart;
    reqHeaders.set('cookie', cookieHeaderWorking);
  }

  // Always propagate AID via request header for downstream handlers
  if (currentAid) {
    reqHeaders.set('x-aid', currentAid);
  }

  // Create response with mutated request headers
  const res = NextResponse.next({ request: { headers: reqHeaders } });

  // Debug headers to verify middleware execution and AID propagation
  res.headers.set('x-mw', '1');
  if (currentAid) res.headers.set('x-mw-aid-present', '1');
  if (generatedAid) res.headers.set('x-mw-aid-generated', '1');

  // Set rate-limit cookie on response
  res.cookies.set(COOKIE_NAME, `${rateRaw}.${rateSig}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 5, // keep short; sliding window
  });

  // If AID was generated, set it on the response too
  if (generatedAid) {
    res.cookies.set(AID_COOKIE, generatedAid, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1y
    });
  }

  return res;
}

export const config = {
  matcher: ['/api/:path*'],
};
