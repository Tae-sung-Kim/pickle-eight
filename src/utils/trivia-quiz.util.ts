import { callOpenAI } from '@/services';
import {
  TriviaQuizCategoryType,
  TriviaQuizDifficultyType,
  TriviaQuizQuestionType,
  TriviaRawQuizJsonType,
} from '@/types';

export async function generateQuizQuestion({
  category,
  difficulty,
}: {
  category: TriviaQuizCategoryType;
  difficulty: TriviaQuizDifficultyType;
}): Promise<TriviaQuizQuestionType> {
  const prompt = `Create a multiple-choice quiz question in Korean.\n\n- Category: ${category}\n- Difficulty: ${difficulty}\n- Format: 4 options, only one correct answer.\n- Provide a short explanation after the answer.\n- Output as JSON with keys: question, options (array of 4), answer, explanation.`;

  const content = await callOpenAI({
    messages: [
      { role: 'system', content: 'You are a quiz generator.' },
      { role: 'user', content: prompt },
    ],
    max_tokens: 512,
    temperature: 0.7,
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

  return {
    id,
    category,
    difficulty,
    question: parsed.question,
    options,
    answerId: options[answerIdx].id,
    explanation: parsed.explanation,
  };
}
