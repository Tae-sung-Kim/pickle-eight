'use client';

import { EMOJI_CATEGORY_ENUM } from "@/constants/emoji-translation.constant";
import { useDailyLimit } from "@/hooks/use-daily-limit.hook";
import { useGenerateEmojiQuiz, useGradeEmojiQuiz } from "@/queries/use-emoji-translation.query";
import { EmojiTranslationGenerateSchema } from "@/schemas/emoji-translation.schema";
import type { EmojiGenerateValuesType, EmojiQuizGradeType, EmojiTranslationProblemType } from "@/types/emoji-translation.type";
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { EmojiTranslationControlsSectionComponent } from './controls-section.component';
import { EmojiTranslationFormComponent } from './form.component';
import { EmojiTranslationProblemCardComponent } from './problem-card.component';
import { EmojiTranslationResultNoticeComponent } from './result-notice.component';

type FormGenerateValues = z.input<typeof EmojiTranslationGenerateSchema>;

export function EmojiTranslationComponent() {
  const [problem, setProblem] = useState<EmojiTranslationProblemType | null>(
    null
  );
  const [result, setResult] = useState<EmojiQuizGradeType | null>(null);

  const { getDailyLimitInfo, addOne } = useDailyLimit();
  const { canUse, limit, used } = getDailyLimitInfo('emoji-translation');

  const { handleSubmit, watch, setValue } = useForm<FormGenerateValues>({
    resolver: zodResolver(EmojiTranslationGenerateSchema),
    defaultValues: {
      category: EMOJI_CATEGORY_ENUM.RANDOM,
    },
  });

  const genMutation = useGenerateEmojiQuiz({
    onSuccess: (data) => {
      setProblem(data);
      setResult(null);
      addOne('emoji-translation');
    },
  });

  const gradeMutation = useGradeEmojiQuiz({
    onSuccess: (data) => setResult(data),
  });

  const onGenerate = (values: FormGenerateValues): void => {
    if (!canUse) return;
    const category = (values.category ??
      '랜덤') as EmojiGenerateValuesType['category'];
    genMutation.mutate({ category });
  };

  const submitGenerate = handleSubmit(onGenerate);

  const handleSubmitAnswer = (guess: string): void => {
    if (!problem) return;
    gradeMutation.mutate({
      emojis: problem.emojis,
      answer: problem.answer,
      userGuess: guess,
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-4">
      <EmojiTranslationControlsSectionComponent
        category={watch('category') ?? '랜덤'}
        onCategoryChange={(v) => setValue('category', v)}
        canUse={canUse}
        used={used}
        limit={limit}
        isGenerating={genMutation.isPending}
        onGenerate={submitGenerate}
      />

      {genMutation.isError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {(genMutation.error as Error).message}
        </div>
      )}

      {problem && <EmojiTranslationProblemCardComponent problem={problem} />}

      {problem && (
        <>
          <EmojiTranslationFormComponent
            onSubmit={handleSubmitAnswer}
            isPending={gradeMutation.isPending}
          />
          <EmojiTranslationResultNoticeComponent
            error={
              gradeMutation.isError ? (gradeMutation.error as Error) : null
            }
            result={result}
          />
        </>
      )}
    </div>
  );
}

export default EmojiTranslationComponent;
