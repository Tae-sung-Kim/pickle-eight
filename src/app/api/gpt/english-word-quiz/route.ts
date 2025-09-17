import { callOpenAI } from "@/services/openai.service";
import { NextResponse } from 'next/server';

export async function POST() {
  const prompt = `
    You are a precise English teacher who creates one multiple-choice word quiz.
    Output strictly JSON only. No markdown, no explanations outside JSON. Korean is used only in the definition and explanation.

    Constraints:
    - The quiz must be solvable and unambiguous.
    - Options must be four distinct English words with different meanings.
    - No near-duplicates, no inflected forms of the same lemma, no obvious synonyms among options.
    - The correct answer must be exactly one of the options (case-sensitive match).
    - Prefer B2~C1 vocabulary level.
    - Avoid overly common repeats across runs. Diversity token: nonce=${Date.now()}.

    JSON Schema:
    {
      "quiz": string,            // Korean definition of the target word, one line
      "options": string[4],      // Four distinct English words
      "answer": string,          // Must be exactly one of options
      "explanation": string      // Korean meaning + one EN example + its KR translation
    }

    Example:
    {
      "quiz": "어떤 분야에 대해 깊은 지식과 열정을 가진 사람",
      "options": ["Enthusiast", "Novice", "Opponent", "Skeptic"],
      "answer": "Enthusiast",
      "explanation": "열광적인 지지자. 예: He is an enthusiast of jazz. (그는 재즈를 열렬히 좋아한다.)"
    }
  `;

  for (let i = 0; i < 3; i++) {
    try {
      const data = await callOpenAI({
        messages: [
          {
            role: 'system',
            content:
              'You are a meticulous quiz generator. Always respond with strict JSON matching the schema.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
        json: true,
        presence_penalty: 0.1,
        frequency_penalty: 0.3,
        top_p: 0.9,
        max_tokens: 350,
      });

      const quizData = JSON.parse(data || '{}');

      if (
        quizData.quiz &&
        quizData.options &&
        quizData.answer &&
        quizData.explanation &&
        Array.isArray(quizData.options) &&
        quizData.options.length === 4 &&
        quizData.options.includes(quizData.answer)
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
