import { NextResponse } from 'next/server';
import { callOpenAI } from '@/services';

export const runtime = 'edge';

export async function POST() {
  const prompt = `
    You are an English teacher who creates fun word quizzes.
    Please create one English word quiz based on the following rules:

    1.  The quiz must be in JSON format.
    2.  The user has to guess the English word that matches the given definition.
    3.  Provide four multiple-choice options, one of which is the correct answer.
    4.  The JSON object must have the following keys: "quiz", "options", "answer", "explanation".
    5.  The "quiz" value should be the definition of the word in Korean.
    6.  The "options" value should be an array of four English words.
    7.  The "answer" value should be the correct English word.
    8.  The "explanation" value should provide the Korean meaning of the answer and an example sentence in both English and Korean.

    Example format:
    {
      "quiz": "어떤 것이나 누군가를 매우 좋아하고 열정적으로 지지하는 사람",
      "options": ["Detractor", "Adversary", "Enthusiast", "Critic"],
      "answer": "Enthusiast",
      "explanation": "열광적인 팬. 예문: He is a huge enthusiast of jazz music. (그는 재즈 음악의 열렬한 팬이다.)"
    }
  `;

  for (let i = 0; i < 3; i++) {
    try {
      const data = await callOpenAI({
        messages: [{ role: 'user', content: prompt }],
        temperature: 1,
        json: true,
      });

      const quizData = JSON.parse(data || '{}');

      if (
        quizData.quiz &&
        quizData.options &&
        quizData.answer &&
        quizData.explanation
      ) {
        return NextResponse.json(quizData);
      }
    } catch (error) {
      console.error(
        `English word quiz generation failed on attempt ${i + 1}:`,
        error
      );
    }
  }

  return NextResponse.json(
    { error: '퀴즈 생성에 실패했습니다.' },
    { status: 500 }
  );
}
