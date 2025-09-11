'use client';

import { useState } from 'react';
import type {
  EmojiTranslationProblemType,
  EmojiQuizGradeType,
  EmojiGenerateValuesType,
} from '@/types';
import { useGenerateEmojiQuiz, useGradeEmojiQuiz } from '@/queries';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDailyLimit } from '@/hooks';
import { EmojiTranslationControlsSectionComponent } from './controls-section.component';
import { EmojiTranslationProblemCardComponent } from './problem-card.component';
import { EmojiTranslationFormComponent } from './form.component';
import { EmojiTranslationResultNoticeComponent } from './result-notice.component';
import { EmojiTranslationGenerateSchema } from '@/schemas';

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
    defaultValues: { category: '랜덤' },
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
