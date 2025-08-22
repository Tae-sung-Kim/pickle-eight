import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query';
import { generateEmojiQuiz, gradeEmojiQuiz } from '@/services';
import type {
  EmojiQuizGradeType,
  EmojiQuizProblemType,
  GenerateValuesType,
  GradeEmojiQuizInputType,
} from '@/types';

export function useGenerateEmojiQuiz(
  options?: UseMutationOptions<EmojiQuizProblemType, Error, GenerateValuesType>
): UseMutationResult<EmojiQuizProblemType, Error, GenerateValuesType> {
  return useMutation<EmojiQuizProblemType, Error, GenerateValuesType>({
    mutationFn: (v: GenerateValuesType) => generateEmojiQuiz(v),
    ...options,
  });
}

export function useGradeEmojiQuiz(
  options?: UseMutationOptions<
    EmojiQuizGradeType,
    Error,
    GradeEmojiQuizInputType
  >
): UseMutationResult<EmojiQuizGradeType, Error, GradeEmojiQuizInputType> {
  return useMutation<EmojiQuizGradeType, Error, GradeEmojiQuizInputType>({
    mutationFn: (input: GradeEmojiQuizInputType) => gradeEmojiQuiz(input),
    ...options,
  });
}
