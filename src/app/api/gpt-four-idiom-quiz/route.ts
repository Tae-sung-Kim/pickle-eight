import { NextRequest, NextResponse } from 'next/server';
import { callOpenAI } from '@/services';
import { fourIdiomsByDifficulty } from '@/data/four-idioms';

export async function POST(req: NextRequest) {
  const { difficulty = 'normal' }: { difficulty: 'easy' | 'normal' | 'hard' } =
    await req.json();

  const targetIdioms = fourIdiomsByDifficulty[difficulty];
  const correctIdiom =
    targetIdioms[Math.floor(Math.random() * targetIdioms.length)];

  const prompt = `
당신은 한국어 사자성어 퀴즈 출제 전문가입니다.
정답 사자성어인 '${correctIdiom.answer}'에 대한 퀴즈를 생성해주세요.

[규칙]
1.  **문제(question)**: '${correctIdiom.meaning}'이라는 뜻을 가진 사자성어를 맞히는 문제입니다. 뜻을 직접적으로 설명하는 질문을 만드세요.
    - **좋은 문제 예시**: "서로 많은 차이가 있어 가지각색으로 모두 다르다는 것을 의미하는 말은 무엇일까요?" (정답: 천차만별)
    - **나쁜 문제 예시**: "한 반의 학생들이 좋아하는 음식이 모두 다른 상황을 이르는 말은 무엇일까요?"
    - **지시사항**: 반드시 '좋은 문제 예시'와 같이 사자성어의 의미를 직접 서술하여 문제를 만드세요. '나쁜 문제 예시'처럼 특정 상황을 가정하거나 비유를 사용해서는 절대 안 됩니다.

2.  **힌트(hint)**: 정답을 유추할 수 있는 결정적인 힌트를 하나만 제시해주세요. (예: 첫 글자는 '백')
3.  **정답(answer)**: 반드시 '${correctIdiom.answer}'를 그대로 반환해야 합니다.
4.  **해설(explanation)**: '${correctIdiom.answer}'라는 사자성어의 뜻과 유래를 간결하고 명확하게 설명해야 합니다. 다른 불필요한 내용은 절대 추가하지 마세요.

[출력 형식 (JSON)]
{
  "question": "(생성된 문제)",
  "answer": "${correctIdiom.answer}",
  "hint": "(생성된 힌트)",
  "explanation": "(생성된 해설)"
}
`;

  for (let i = 0; i < 3; i++) {
    try {
      const data = await callOpenAI({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 400,
        temperature: 0.4,
      });
      const text = data ?? '{}';
      const json = JSON.parse(text);

      if (
        json.question &&
        json.answer === correctIdiom.answer &&
        json.hint &&
        json.explanation
      ) {
        return NextResponse.json(json);
      }
    } catch (e) {
      console.error(
        `Four-idiom quiz generation failed on attempt ${i + 1}:`,
        e
      );
    }
  }

  return NextResponse.json(
    {
      error:
        '문제 생성에 실패했습니다. AI가 유효한 응답을 생성하지 못했습니다.',
    },
    { status: 500 }
  );
}
