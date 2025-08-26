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
당신은 창의적이고 정확한 한국어 상식 퀴즈 출제 전문가입니다.
JSON만 출력하세요(마크다운 금지). 이전에 출제되지 않은 새로운 객관식 퀴즈를 생성하세요.

[퀴즈 조건]
- 카테고리: ${category}
- 난이도: ${difficulty}
- 형식: 4개의 선택지가 있는 객관식, 정답은 1개
- 선택지는 서로 의미가 겹치지 않으며 중복/유사어/동의어 금지
- 정답은 반드시 선택지 중 하나와 정확히 일치(문자 그대로)
- 질문은 명확하고 단일 해석 가능, 최신성/사실성 준수
- 해설은 정답이 왜 맞는지 간결히 설명(출처나 링크 금지)
- 다양성 토큰: nonce=${Date.now()}

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
            {
              role: 'system',
              content:
                '당신은 퀴즈 출제 전문가입니다. 반드시 JSON만 반환합니다.',
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: 512,
          temperature: 0.6,
          json: true,
          presence_penalty: 0.1,
          frequency_penalty: 0.3,
        });

        const parsed = JSON.parse(
          content.replace(/```json|```/g, '').trim()
        ) as TriviaRawQuizJsonType;

        if (
          !parsed.question ||
          !parsed.options ||
          !parsed.answer ||
          !parsed.explanation ||
          parsed.options.length !== 4 ||
          !parsed.options.includes(parsed.answer)
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
