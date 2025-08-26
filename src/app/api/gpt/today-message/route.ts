import { callOpenAI } from '@/services';
import { getTodayPrompts } from '@/utils';
import { NextResponse } from 'next/server';

function stripCodeFences(text: string): string {
  return text
    .replace(/^\s*```(?:json)?/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

async function fetchMulti(): Promise<{
  fortune: string;
  cheer: string;
  todo: string;
  menu: string;
}> {
  const fortunePrompt =
    '오늘 하루의 운세를 한국어로 한 줄로 알려줘. 자연스러운 한국어로 작성하고, 맞춤법과 띄어쓰기를 교정해. 의미가 모호한 표현은 쓰지 마.';
  const cheerPrompt =
    '오늘 하루 힘이 되는 응원 문구를 한국어로 한 줄로 만들어줘. 자연스러운 한국어로 작성하고, 맞춤법과 띄어쓰기를 교정해. 의미가 모호한 표현은 쓰지 마.';
  const { menuPrompt, todoPrompt } = getTodayPrompts();
  const [fortune, cheer, todo, menu] = await Promise.all([
    callOpenAI({ messages: [{ role: 'user', content: fortunePrompt }] }),
    callOpenAI({ messages: [{ role: 'user', content: cheerPrompt }] }),
    callOpenAI({ messages: [{ role: 'user', content: todoPrompt }] }),
    callOpenAI({ messages: [{ role: 'user', content: menuPrompt }] }),
  ]);
  return { fortune, cheer, todo, menu };
}

async function fetchSingle(): Promise<{
  fortune: string;
  cheer: string;
  todo: string;
  menu: string;
}> {
  const { menuPrompt, todoPrompt } = getTodayPrompts();
  const prompt = [
    '아래의 4가지 항목에 대해 각각 한국어로 정확히 한 줄씩 생성해 주세요.',
    '',
    '규칙:',
    '- 각 값은 줄바꿈(\n) 없이 한 줄로 생성합니다.',
    '- 이모지 사용 가능하나 과도하지 않게 해주세요.',
    '- 마크다운, 설명, 불필요한 말 없이 JSON만 출력하세요.',
    '- 자연스러운 한국어로 작성하고, 맞춤법/띄어쓰기를 교정한 뒤 반환합니다. 의미가 모호한 표현(예: \u2018들수만 된\u2019)이나 어색한 직역은 사용하지 않습니다.',
    '',
    '스키마(JSON):',
    '{',
    '  "fortune": string,',
    '  "cheer": string,',
    '  "todo": string,',
    '  "menu": string',
    '}',
    '',
    '항목 지시:',
    `- fortune: 오늘 하루의 운세를 한 줄로.`,
    `- cheer: 오늘 하루 힘이 되는 응원 문구를 한 줄로.`,
    `- todo: ${todoPrompt} (한 줄)`,
    `- menu: ${menuPrompt} (한 줄)`,
  ].join('\n');

  const raw = await callOpenAI({
    messages: [{ role: 'user', content: prompt }],
    json: true,
    temperature: 0.3,
  });
  const text = stripCodeFences(raw);
  const json = JSON.parse(text) as {
    fortune: string;
    cheer: string;
    todo: string;
    menu: string;
  };
  if (!json.fortune || !json.cheer || !json.todo || !json.menu) {
    throw new Error('Invalid single response');
  }
  return json;
}

export async function POST(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const mode = (searchParams.get('mode') || 'single').toLowerCase();

  try {
    if (mode === 'multi') {
      const data = await fetchMulti();
      return NextResponse.json(data);
    }

    // default: single with fallback to multi
    try {
      const data = await fetchSingle();
      return NextResponse.json(data);
    } catch {
      const data = await fetchMulti();
      return NextResponse.json(data);
    }
  } catch {
    return NextResponse.json({ error: '메시지 생성 실패' }, { status: 500 });
  }
}
