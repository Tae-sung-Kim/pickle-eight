import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
  const { message } = await req.json();
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
