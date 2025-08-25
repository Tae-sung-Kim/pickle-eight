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
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDailyLimit } from '@/hooks/use-daily-limit.hook';

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
    if (!canUse) return; // exceed daily limit
    const category = (values.category ??
      '랜덤') as GenerateValuesType['category'];
    genMutation.mutate({ category });
  };

  const handleSubmitAnswer = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!problem) return;
    const formData = new FormData(e.currentTarget);
    const userGuess = String(formData.get('guess') || '').trim();
    if (!userGuess) return;
    gradeMutation.mutate({
      emojis: problem.emojis,
      answer: problem.answer,
      userGuess,
    });
  };

  const handleReset = () => {
    reset();
    setProblem(null);
    setResult(null);
  };

  // Contextual badge colors per category
  const categoryBadgeClass: Record<string, string> = {
    영화: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-400/15 dark:text-violet-300 dark:border-violet-400/30',
    음식: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-400/15 dark:text-emerald-300 dark:border-emerald-400/30',
    일상: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-400/15 dark:text-slate-300 dark:border-slate-400/30',
    랜덤: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-400/15 dark:text-indigo-300 dark:border-indigo-400/30',
  } as const;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
      {/* 컨트롤 영역 */}
      <Card className="p-5 sm:p-6 rounded-xl shadow-sm">
        <form
          onSubmit={handleSubmit(onGenerate)}
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <div className="sm:col-span-2">
            <Label className="mb-2 inline-block">카테고리</Label>
            <Select
              value={watch('category')}
              onValueChange={(v) =>
                setValue('category', v as GenerateValuesType['category'])
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="영화">영화</SelectItem>
                <SelectItem value="음식">음식</SelectItem>
                <SelectItem value="일상">일상</SelectItem>
                <SelectItem value="랜덤">랜덤</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-2 text-xs text-muted-foreground">
              오늘 사용량: {used}/{limit} {canUse ? '' : ' · 제한 도달'}
            </p>
          </div>
          <div className="sm:col-span-1 flex items-end justify-end gap-2">
            <Button
              type="submit"
              variant="default"
              className="h-11 px-5"
              disabled={genMutation.isPending || !canUse}
            >
              {genMutation.isPending ? '생성 중...' : '새 문제 생성'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 px-5"
              onClick={handleReset}
            >
              초기화
            </Button>
          </div>
        </form>
      </Card>

      {/* 에러 표시 */}
      {genMutation.isError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {(genMutation.error as Error).message}
        </div>
      )}

      {/* 문제 영역 */}
      {problem && (
        <Card className="p-6 rounded-xl shadow-sm text-center">
          <div className="text-6xl sm:text-7xl mb-2">{problem.emojis}</div>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span
              className={
                'inline-flex items-center rounded-full border px-2.5 py-0.5 ' +
                (categoryBadgeClass[problem.category] ||
                  'bg-muted text-foreground/70 border-muted-foreground/20')
              }
            >
              {problem.category}
            </span>
            {problem.hint && <span>· 힌트 제공</span>}
          </div>
          {problem.hint && (
            <div className="mt-3 inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              힌트: {problem.hint}
            </div>
          )}
          <div className="mt-4">
            <Button
              type="button"
              variant="secondary"
              className="h-10 px-4"
              onClick={() =>
                onGenerate({
                  category: watch('category') as GenerateValuesType['category'],
                })
              }
              disabled={genMutation.isPending || !canUse}
            >
              같은 카테고리로 다시 생성
            </Button>
          </div>
        </Card>
      )}

      {/* 정답 제출 */}
      {problem && (
        <Card className="p-5 sm:p-6 rounded-xl shadow-sm">
          <form
            onSubmit={handleSubmitAnswer}
            className="flex flex-col gap-3 sm:flex-row sm:gap-2"
          >
            <Label htmlFor="guess" className="sr-only">
              정답
            </Label>
            <Input
              id="guess"
              name="guess"
              placeholder="정답 입력"
              className="h-11 sm:flex-1"
            />
            <Button
              type="submit"
              variant="secondary"
              className="h-11 px-6"
              disabled={gradeMutation.isPending}
            >
              {gradeMutation.isPending ? '채점 중...' : '제출'}
            </Button>
          </form>
          {gradeMutation.isError && (
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {(gradeMutation.error as Error).message}
            </div>
          )}
          {result && (
            <div
              aria-live="polite"
              className={`mt-4 rounded-md border p-3 text-sm ${
                result.correct
                  ? 'border-primary/30 bg-primary/5 text-primary'
                  : 'border-amber-200 bg-amber-50 text-amber-800'
              }`}
            >
              <div className="font-semibold">
                {result.correct ? '정답!' : '오답'}
              </div>
              <div>{result.feedback}</div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export default EmojiTranslationComponent;
