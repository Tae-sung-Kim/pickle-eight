import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { signToken, type AdStartPayload } from '@/lib/server-token';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { cid }: { cid?: string } = await req.json();
    if (!cid)
      return NextResponse.json(
        { ok: false, error: 'bad_request' },
        { status: 400 }
      );

    // Read AID from httpOnly cookie set by middleware
    // 1) Prefer x-aid header injected by middleware
    // 2) Fallback to req.cookies
    // 3) Fallback to raw cookie header parsing
    const headerAid = req.headers.get('x-aid') || '';
    let aid = headerAid || req.cookies.get('aid')?.value || '';
    if (!aid) {
      const cookieHeader = req.headers.get('cookie') || '';
      const aidCookie = cookieHeader
        .split(';')
        .map((v) => v.trim())
        .find((v) => v.startsWith('aid='));
      aid = aidCookie ? decodeURIComponent(aidCookie.split('=')[1] || '') : '';
    }

    // If AID still missing, generate server-side and set cookie (robust for dev/prod)
    let generatedAid: string | null = null;
    if (!aid) {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      generatedAid = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      aid = generatedAid;
    }

    const now = Date.now();
    const ttl = 10 * 60 * 1000; // 10m
    const payload: AdStartPayload = { aid, cid, iat: now, exp: now + ttl };
    const token = signToken(payload);

    const ip = req.headers.get('x-forwarded-for') || null;
    const ua = req.headers.get('user-agent') || null;
    const origin = req.headers.get('origin') || null;
    const referer = req.headers.get('referer') || null;

    const docRef = adminDb.collection('ad_nonces').doc(token);
    await docRef.set(
      {
        status: 'issued',
        aid,
        cid,
        iat: now,
        exp: now + ttl,
        ip,
        ua,
        origin,
        referer,
      },
      { merge: true }
    );

    const res = NextResponse.json({ ok: true, token });
    // If we generated AID here, persist it for subsequent calls
    if (generatedAid) {
      res.cookies.set('aid', generatedAid, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1y
      });
    }
    return res;
  } catch (e) {
    console.error('[api/ad/start] error', e);
    return NextResponse.json(
      { ok: false, error: 'server_error' },
      { status: 500 }
    );
  }
}
