import { callOpenAI } from '@/services';
import { NextResponse } from 'next/server';

export async function POST(): Promise<NextResponse> {
  const fortunePrompt = '오늘 하루의 운세를 한국어로 한 줄로 알려줘.';
  const cheerPrompt =
    '오늘 하루 힘이 되는 응원 문구를 한국어로 한 줄로 만들어줘.';
  const todoPrompt =
    '늘 누구나 쉽게 실천할 수 있는 평범한 일상 속 할 일을 한국어로 한 줄로 추천해줘. 예시: 산책하기, 차 한 잔 마시기, 주변 정리정돈하기 등. 특별하거나 어려운 일은 제외해줘.';

  try {
    const [fortune, cheer, todo] = await Promise.all([
      callOpenAI({ messages: [{ role: 'user', content: fortunePrompt }] }),
      callOpenAI({ messages: [{ role: 'user', content: cheerPrompt }] }),
      callOpenAI({ messages: [{ role: 'user', content: todoPrompt }] }),
    ]);

    return NextResponse.json({ fortune, cheer, todo });
  } catch {
    return NextResponse.json({ error: '메시지 생성 실패' }, { status: 500 });
  }
}
