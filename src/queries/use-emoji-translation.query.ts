import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query';
import { generateEmojiQuiz, gradeEmojiQuiz } from '@/services';
import type {
  EmojiQuizGradeType,
  EmojiTranslationProblemType,
  EmojiGenerateValuesType,
  EmojiGradeQuizInputType,
} from '@/types';

export function useGenerateEmojiQuiz(
  options?: UseMutationOptions<
    EmojiTranslationProblemType,
    Error,
    EmojiGenerateValuesType
  >
): UseMutationResult<
  EmojiTranslationProblemType,
  Error,
  EmojiGenerateValuesType
> {
  return useMutation<
    EmojiTranslationProblemType,
    Error,
    EmojiGenerateValuesType
  >({
    mutationFn: (v: EmojiGenerateValuesType) => generateEmojiQuiz(v),
    ...options,
  });
}

export function useGradeEmojiQuiz(
  options?: UseMutationOptions<
    EmojiQuizGradeType,
    Error,
    EmojiGradeQuizInputType
  >
): UseMutationResult<EmojiQuizGradeType, Error, EmojiGradeQuizInputType> {
  return useMutation<EmojiQuizGradeType, Error, EmojiGradeQuizInputType>({
    mutationFn: (input: EmojiGradeQuizInputType) => gradeEmojiQuiz(input),
    ...options,
  });
}
