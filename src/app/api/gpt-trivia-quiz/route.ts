import { NextRequest, NextResponse } from 'next/server';
import { generateQuizQuestion } from '@/utils';

export async function POST(req: NextRequest) {
  try {
    const { category, difficulty } = await req.json();

    // 필수값 체크
    if (!category || !difficulty) {
      return NextResponse.json(
        { error: 'category, difficulty required' },
        { status: 400 }
      );
    }

    // 퀴즈 생성
    const quiz = await generateQuizQuestion({ category, difficulty });

    return NextResponse.json(quiz);
  } catch (e) {
    const error = e as Error;
    return NextResponse.json(
      { error: error.message || '퀴즈 생성 실패' },
      { status: 500 }
    );
  }
}
