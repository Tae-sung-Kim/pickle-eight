import { NextRequest, NextResponse } from 'next/server';
import { callOpenAI } from '@/services';
import {
  TriviaQuizCategoryType,
  TriviaQuizDifficultyType,
  TriviaRawQuizJsonType,
} from '@/types';

export async function POST(req: NextRequest) {
  try {
    const {
      category,
      difficulty,
    }: {
      category: TriviaQuizCategoryType;
      difficulty: TriviaQuizDifficultyType;
    } = await req.json();

    if (!category || !difficulty) {
      return NextResponse.json(
        { error: 'category, difficulty는 필수 항목입니다.' },
        { status: 400 }
      );
    }

    const prompt = `
당신은 창의적이고 재미있는 한국어 상식 퀴즈 출제 전문가입니다.
아래 조건에 맞춰, 이전에 출제되지 않은 새로운 객관식 퀴즈를 생성해주세요.

[퀴즈 조건]
- 카테고리: ${category}
- 난이도: ${difficulty}
- 형식: 4개의 선택지가 있는 객관식, 정답은 1개, 중복되지 않는 보기
- 정답에 대한 짧은 해설 포함
- 다양성을 위해 현재 시간(${Date.now()})을 참고하여 새로운 질문 생성

[출력 형식 (JSON)]
{
  "question": "(퀴즈 질문)",
  "options": ["(선택지1)", "(선택지2)", "(선택지3)", "(선택지4)"],
  "answer": "(정답 텍스트)",
  "explanation": "(정답 해설)"
}
`;

    for (let i = 0; i < 3; i++) {
      try {
        const content = await callOpenAI({
          messages: [
            { role: 'system', content: '당신은 퀴즈 출제 전문가입니다.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 512,
          temperature: 0.8,
        });

        const parsed = JSON.parse(
          content.replace(/```json|```/g, '').trim()
        ) as TriviaRawQuizJsonType;

        if (
          !parsed.question ||
          !parsed.options ||
          !parsed.answer ||
          !parsed.explanation ||
          parsed.options.length !== 4
        ) {
          throw new Error('AI 응답이 유효하지 않습니다.');
        }

        const id = `${category}-${difficulty}-${Date.now()}`;
        const options = parsed.options.map((text: string, idx: number) => ({
          id: `opt${idx}`,
          text,
        }));

        const answerIdx = options.findIndex(
          (opt: { text: string }) => opt.text === parsed.answer
        );

        if (answerIdx === -1) {
          throw new Error('정답이 선택지에 포함되어 있지 않습니다.');
        }

        const quiz = {
          id,
          category,
          difficulty,
          question: parsed.question,
          options,
          answerId: options[answerIdx].id,
          explanation: parsed.explanation,
        };

        return NextResponse.json(quiz);
      } catch (e) {
        console.error(`Trivia quiz generation failed on attempt ${i + 1}:`, e);
        if (i === 2) {
          // 마지막 시도에서도 실패하면 에러를 던집니다.
          throw e;
        }
      }
    }

    // 루프가 모두 실패한 경우 (이론적으로는 도달하지 않음)
    throw new Error('퀴즈 생성에 최종 실패했습니다.');
  } catch (e) {
    const error = e as Error;
    return NextResponse.json(
      {
        error: error.message || '퀴즈 생성 중 알 수 없는 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
