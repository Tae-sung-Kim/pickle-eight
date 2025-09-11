import {
  EmojiGenerateValuesType,
  EmojiTranslationProblemType,
  EmojiQuizGradeType,
  EmojiGradeQuizInputType,
} from '@/types';
import { http } from '@/lib';

/**
 * Generate emoji quiz problem via API
 */
export async function generateEmojiQuiz(
  values: EmojiGenerateValuesType
): Promise<EmojiTranslationProblemType> {
  return http
    .post<EmojiTranslationProblemType>(
      '/gpt/emoji-translation',
      {
        action: 'generate',
        ...values,
      },
      { timeout: 45000 }
    )
    .then((res) => res.data);
}

/**
 * Grade emoji quiz answer via API
 */
export async function gradeEmojiQuiz(
  input: EmojiGradeQuizInputType
): Promise<EmojiQuizGradeType> {
  return http
    .post<EmojiQuizGradeType>(
      '/gpt/emoji-translation',
      {
        action: 'grade',
        ...input,
      },
      { timeout: 20000 }
    )
    .then((res) => res.data);
}
