import { callOpenAI } from '@/services';
import { NextResponse } from 'next/server';

export async function POST(): Promise<NextResponse> {
  const fortunePrompt = '오늘 하루의 운세를 한국어로 한 줄로 알려줘.';
  const cheerPrompt =
    '오늘 하루 힘이 되는 응원 문구를 한국어로 한 줄로 만들어줘.';

  try {
    const [fortune, cheer] = await Promise.all([
      callOpenAI({ messages: [{ role: 'user', content: fortunePrompt }] }),
      callOpenAI({ messages: [{ role: 'user', content: cheerPrompt }] }),
    ]);

    return NextResponse.json({ fortune, cheer });
  } catch {
    return NextResponse.json({ error: '메시지 생성 실패' }, { status: 500 });
  }
}
