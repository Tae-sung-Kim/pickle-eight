import { NextRequest, NextResponse } from 'next/server';

/**
 * TODO(reward-ads): 보상형 광고 이벤트 수집 일시 비활성화
 * 복구 시 아래 주석 블록의 기존 구현을 되돌리세요.
 */
export async function POST(_req: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    { ok: false, error: 'reward_ads_disabled' + '_' + _req.url },
    { status: 410 }
  );
}

/*
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
*/
