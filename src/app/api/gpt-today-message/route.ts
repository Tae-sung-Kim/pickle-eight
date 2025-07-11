import { callOpenAI } from '@/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { type } = await req.json();
  const prompt =
    type === 'fortune'
      ? '오늘 하루의 운세를 한국어로 한 줄로 알려줘.'
      : '오늘 하루 힘이 되는 응원 문구를 한국어로 한 줄로 만들어줘.';

  try {
    const message = await callOpenAI({
      messages: [{ role: 'user', content: prompt }],
    });
    return NextResponse.json({ message });
  } catch {
    return NextResponse.json({ error: '메시지 생성 실패' }, { status: 500 });
  }
}
