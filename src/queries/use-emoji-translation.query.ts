import { generateEmojiQuiz, gradeEmojiQuiz } from "@/services/emoji-translation.service";
import type { EmojiGenerateValuesType, EmojiGradeQuizInputType, EmojiQuizGradeType, EmojiTranslationProblemType } from "@/types/emoji-translation.type";
import {
    useMutation,
    type UseMutationOptions,
    type UseMutationResult,
} from '@tanstack/react-query';

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
