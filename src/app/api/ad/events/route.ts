import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const now = Date.now();
    await adminDb.collection('ad_events').add({ ...body, ts: now });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[api/ad/events] error', e);
    return NextResponse.json(
      { ok: false, error: 'server_error' },
      { status: 500 }
    );
  }
}
