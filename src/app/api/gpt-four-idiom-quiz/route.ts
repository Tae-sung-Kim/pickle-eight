import { NextResponse } from 'next/server';
import { callOpenAI } from '@/services';

export const runtime = 'edge';

// 4글자 한자어(사자성어)인지 검사
function isValidFourIdiom(answer: string): boolean {
  // 4글자 + 모두 한자(유니코드 범위)로 제한
  return (
    typeof answer === 'string' &&
    answer.length === 4 &&
    /^[\u4e00-\u9fff]{4}$/.test(answer)
  );
}

export async function POST(req: Request) {
  const { difficulty = 'normal' } = await req.json();
  let difficultyText = '';
  if (difficulty === 'easy')
    difficultyText =
      '\n- 쉬운 난이도: 초등학생도 맞힐 수 있을 정도로 쉬운 사자성어로 출제해줘.';
  if (difficulty === 'hard')
    difficultyText =
      '\n- 어려운 난이도: 평소 잘 쓰지 않는, 난이도 높은 사자성어로 출제해줘.';

  const prompt = `다음 형식으로 한국어 사자성어 퀴즈를 만들어주세요.
- 문제는 반드시 4글자 한자어(사자성어)로 출제해 주세요. 정답이 4글자가 아니면 절대 출제하지 마세요.
- "question": 사자성어의 뜻(설명)만, 사자성어 단어는 절대 포함하지 마.
- "answer": 정답 사자성어 (네 글자)
- "hint": 정답을 유추할 수 있는 힌트 (예: 첫 글자, 유사 사자성어, 관련 단어, 한자 구성 등)
${difficultyText}
JSON으로만 응답해줘.

예시:
{ "question": "매우 어려운 상황에서도 굳건하게 버티는 모습을 비유적으로 이르는 말", "answer": "백절불굴", "hint": "첫 글자는 '백', 네 글자 모두 한자" }
`;

  // 4글자 한자어가 나올 때까지 최대 3회 재시도
  let lastError = null;
  for (let i = 0; i < 3; i++) {
    try {
      const data = await callOpenAI({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.8,
      });
      const text = data ?? '{}';
      const json = JSON.parse(text);

      if (isValidFourIdiom(json.answer)) {
        return NextResponse.json(json);
      } else {
        lastError = `정답이 4글자 한자어가 아님: ${json.answer}`;
      }
    } catch (e) {
      lastError = e;
    }
  }

  // 3회 실패 시 fallback 메시지
  return NextResponse.json({
    question: '문제 생성에 실패했습니다.',
    answer: '',
    hint: '',
    error: lastError ? String(lastError) : undefined,
  });
}
