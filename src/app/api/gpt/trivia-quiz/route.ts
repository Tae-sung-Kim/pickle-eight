import { callOpenAiWithRetry } from '@/features/quiz/services/openai.service';
import {
  TriviaQuizCategoryType,
  TriviaQuizDifficultyType,
  TriviaRawQuizJsonType,
} from '@/features/quiz/types/trivia-quiz.type';
import { NextRequest, NextResponse } from 'next/server';

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

    
    try {
      const data = await callOpenAiWithRetry<TriviaRawQuizJsonType>({
        messages: [
          {
            role: 'system',
            content: '당신은 퀴즈 출제 전문가입니다. 반드시 JSON만 반환합니다.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 512,
        temperature: 0.6,
        presence_penalty: 0.1,
        frequency_penalty: 0.3,
      }, 3, (parsed: any) => {
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
        return parsed as TriviaRawQuizJsonType;
      });
      const optionsWithIds = data.options.map((text, index) => ({
        id: `opt-${index}`,
        text,
      }));
      const answerId = optionsWithIds.find((opt) => opt.text === data.answer)?.id ?? 'opt-0';

      return NextResponse.json({
        id: `q-${Date.now()}`,
        category,
        difficulty,
        question: data.question,
        options: optionsWithIds,
        answerId,
        explanation: data.explanation,
      });
    } catch (e: any) {
      console.error('Trivia quiz failed:', e.message);
      return NextResponse.json(
        { error: '문제 생성 실패' },
        { status: 500 }
      );
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
