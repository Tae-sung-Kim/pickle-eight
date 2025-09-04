import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const now = Date.now();
    await adminDb.collection('applixir_events').add({ ...body, ts: now });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[api/applixir/events] error', e);
    return NextResponse.json(
      { ok: false, error: 'server_error' },
      { status: 500 }
    );
  }
}
