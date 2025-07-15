import { NextRequest, NextResponse } from 'next/server';
import { callOpenAI } from '@/services';
import {
  TriviaQuizCategoryType,
  TriviaQuizDifficultyType,
  TriviaRawQuizJsonType,
} from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { category, difficulty }: { category: TriviaQuizCategoryType, difficulty: TriviaQuizDifficultyType } = await req.json();

    // 필수값 체크
    if (!category || !difficulty) {
      return NextResponse.json(
        { error: 'category, difficulty required' },
        { status: 400 }
      );
    }

    // 퀴즈 생성 로직
    const prompt = `Create a NEW and UNIQUE multiple-choice quiz question in Korean that has not been asked before. Be creative.\n\n- Category: ${category}\n- Difficulty: ${difficulty}\n- Format: 4 options, only one correct answer.\n- Provide a short explanation for the answer.\n- To ensure variety, use this seed to generate a different question: ${Date.now()}\n- Output as JSON with keys: question, options (array of 4), answer, explanation.`;

    const content = await callOpenAI({
      messages: [
        { role: 'system', content: 'You are a quiz generator.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 512,
      temperature: 0.8,
    });

    // 파싱
    let parsed: TriviaRawQuizJsonType;
    try {
      parsed = JSON.parse(
        content.replace(/```json|```/g, '').trim()
      ) as TriviaRawQuizJsonType;
    } catch {
      throw new Error('Failed to parse OpenAI response');
    }

    // id 생성 등 가공
    const id = `${category}-${difficulty}-${Date.now()}`;
    const options = parsed.options.map((text: string, idx: number) => ({
      id: `opt${idx}`,
      text,
    }));
    const answerIdx = options.findIndex(
      (opt: { text: string }) => opt.text === parsed.answer
    );
    if (answerIdx === -1) throw new Error('Answer not found in options');

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
    const error = e as Error;
    return NextResponse.json(
      { error: error.message || '퀴즈 생성 실패' },
      { status: 500 }
    );
  }
}
