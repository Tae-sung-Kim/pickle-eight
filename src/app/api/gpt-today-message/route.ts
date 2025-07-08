import { NextRequest, NextResponse } from 'next/server';

/**
 * 오늘의 운세/응원문구를 GPT API로 생성하는 엔드포인트
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const { type } = await req.json(); // type: "cheer" | "fortune"
  const prompt =
    type === 'fortune'
      ? '오늘 하루의 운세를 한국어로 한 줄로 알려줘.'
      : '오늘 하루 힘이 되는 응원 문구를 한국어로 한 줄로 만들어줘.';

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key missing' }, { status: 500 });
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo', // 또는 "gpt-4o"
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 60,
      temperature: 0.8,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch GPT' }, { status: 500 });
  }

  const data = await res.json();
  const message = data.choices?.[0]?.message?.content?.trim() ?? '';

  return NextResponse.json({ message });
}
