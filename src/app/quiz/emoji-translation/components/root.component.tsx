'use client';

import { useState } from 'react';
import type {
  EmojiQuizProblemType,
  EmojiQuizGradeType,
  GenerateValuesType,
} from '@/types';
import { useGenerateEmojiQuiz, useGradeEmojiQuiz } from '@/queries';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDailyLimit } from '@/hooks/use-daily-limit.hook';
import { ControlsSectionComponent } from './controls-section.component';
import { ProblemCardComponent } from './problem-card.component';
import { SubmitFormComponent } from './submit-form.component';
import { ResultNoticeComponent } from './result-notice.component';

const generateSchema = z.object({
  category: z.enum(['영화', '음식', '일상', '랜덤']).default('랜덤'),
});

type FormGenerateValues = z.input<typeof generateSchema>;

export function EmojiTranslationComponent() {
  const [problem, setProblem] = useState<EmojiQuizProblemType | null>(null);
  const [result, setResult] = useState<EmojiQuizGradeType | null>(null);

  const { getDailyLimitInfo, addOne } = useDailyLimit();
  const { canUse, limit, used } = getDailyLimitInfo('emoji-translation');

  const { handleSubmit, watch, setValue, reset } = useForm<FormGenerateValues>({
    resolver: zodResolver(generateSchema),
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
      '랜덤') as GenerateValuesType['category'];
    genMutation.mutate({ category });
  };

  const submitGenerate = handleSubmit(onGenerate);

  const handleReset = (): void => {
    reset();
    setProblem(null);
    setResult(null);
  };

  const handleRegenerate = (): void => {
    const category = (watch('category') ??
      '랜덤') as GenerateValuesType['category'];
    if (!canUse) return;
    genMutation.mutate({ category });
  };

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
      <ControlsSectionComponent
        category={watch('category') ?? '랜덤'}
        onCategoryChange={(v) => setValue('category', v)}
        canUse={canUse}
        used={used}
        limit={limit}
        isGenerating={genMutation.isPending}
        onGenerate={submitGenerate}
        onReset={handleReset}
      />

      {genMutation.isError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {(genMutation.error as Error).message}
        </div>
      )}

      {problem && (
        <ProblemCardComponent
          problem={problem}
          onRegenerate={handleRegenerate}
          canUse={canUse}
          isGenerating={genMutation.isPending}
          category={
            (watch('category') ?? '랜덤') as GenerateValuesType['category']
          }
        />
      )}

      {problem && (
        <>
          <SubmitFormComponent
            onSubmit={handleSubmitAnswer}
            isPending={gradeMutation.isPending}
          />
          <ResultNoticeComponent
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
