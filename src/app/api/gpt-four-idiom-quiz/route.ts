import { NextResponse } from 'next/server';
import { callOpenAI } from '@/services';
import { fourIdiomsByDifficulty } from '@/data/four-idioms';

export async function POST(req: Request) {
  const { difficulty = 'normal' }: { difficulty: 'easy' | 'normal' | 'hard' } =
    await req.json();

  // 1. 사용자가 선택한 난이도의 사자성어 목록을 가져옴
  const targetIdioms = fourIdiomsByDifficulty[difficulty];

  // 2. 해당 목록에서 무작위로 정답 선택
  const question =
    targetIdioms[Math.floor(Math.random() * targetIdioms.length)];

  let difficultyText = '일반적인 상황에 빗대어 알기 쉽게 설명해줘.'; // normal
  if (difficulty === 'easy') {
    difficultyText = '초등학생도 이해할 수 있도록 쉬운 예시를 들어 설명해줘.';
  }
  if (difficulty === 'hard') {
    difficultyText = '정답의 의미와 유래를 포함하여 깊이 있게 설명해줘.';
  }

  // 3. AI에게 문제, 힌트, 그리고 '정답'까지 생성하도록 요청
  const prompt = `당신은 한국어 사자성어 퀴즈 출제 전문가입니다.
정답 단어 '${question.answer}'에 대한 퀴즈를 아래 JSON 형식에 맞춰 생성해주세요.

[규칙]
1.  **문제(question)**: '${
    question.meaning
  }'를 활용해서 뜻을 설명하는 문제를 내주세요. 설명에 정답 단어가 포함되면 안 됩니다.
2.  **힌트(hint)**: 정답을 유추할 수 있는 결정적인 힌트를 하나만 제시해주세요. (예: 첫 글자는 '백')
3.  **정답(answer)**: 반드시 '${question.answer}'를 그대로 반환해야 합니다.
4.  **난이도**: ${difficultyText || '일반적인 난이도로 설명해주세요.'}

[출제 형식]
{ "question": "(문제 설명)", "answer": "${question.answer}", "hint": "(힌트)" }
`;

  for (let i = 0; i < 3; i++) {
    try {
      const data = await callOpenAI({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.5,
      });
      const text = data ?? '{}';
      const json = JSON.parse(text);

      // 4. AI가 반환한 정답이 우리가 요청한 정답과 일치하는지 확인
      if (json.answer === question.answer) {
        return NextResponse.json(json);
      }
      // 일치하지 않으면 재시도
    } catch (e) {
      // 파싱 오류 등 발생 시 재시도. 에러를 로그에 남겨 디버깅에 활용합니다.
      console.error(
        `Four-idiom quiz generation failed on attempt ${i + 1}:`,
        e
      );
    }
  }

  // 3회 실패 시 에러 반환
  return NextResponse.json(
    {
      error:
        '문제 생성에 실패했습니다. AI가 유효한 응답을 생성하지 못했습니다.',
    },
    { status: 500 }
  );
}
