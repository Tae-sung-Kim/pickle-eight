import {
  GenerateValuesType,
  EmojiQuizProblemType,
  EmojiQuizGradeType,
  GradeEmojiQuizInputType,
} from '@/types';
import { http } from '@/lib';

/**
 * Generate emoji quiz problem via API
 */
export async function generateEmojiQuiz(
  values: GenerateValuesType
): Promise<EmojiQuizProblemType> {
  return http
    .post<EmojiQuizProblemType>('/gpt/emoji-translation', {
      action: 'generate',
      ...values,
    })
    .then((res) => res.data);
}

/**
 * Grade emoji quiz answer via API
 */
export async function gradeEmojiQuiz(
  input: GradeEmojiQuizInputType
): Promise<EmojiQuizGradeType> {
  return http
    .post<EmojiQuizGradeType>('/gpt/emoji-translation', {
      action: 'grade',
      ...input,
    })
    .then((res) => res.data);
}
