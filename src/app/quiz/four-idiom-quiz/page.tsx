'use client';

import { useEffect, useState } from 'react';
import { useDailyLimit } from '@/hooks/use-daily-limit';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useGptFourIdiomQuizQuery } from '@/queries';
import { CheckCircle2, XCircle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib';

const schema = z.object({ answer: z.string().length(4, '정확히 4글자!') });
type FormValues = { answer: string };

export default function FourIdiomQuizPage() {
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const { getDailyLimitInfo, addOne, isInitialized } = useDailyLimit();
  const { canUse, limit, used } = getDailyLimitInfo('four-idiom-quiz');
  const [difficultyDisabled, setDifficultyDisabled] = useState(false);
  const [difficulty, setDifficulty] = useState<
    'easy' | 'normal' | 'hard' | null
  >(null);
  const {
    mutate,
    data,
    isPending,
    reset: resetMutation,
  } = useGptFourIdiomQuizQuery();

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState,
  } = useForm<FormValues>({
    defaultValues: { answer: '' },
    resolver: async (values) => {
      try {
        schema.parse(values);
        return { values, errors: {} };
      } catch (e) {
        if (e instanceof z.ZodError) {
          return { values: {}, errors: e.formErrors.fieldErrors };
        }
        throw e;
      }
    },
  });

  const resetQuiz = () => {
    setShowAnswer(false);
    setIsCorrect(null);
    resetForm();
    resetMutation();
  };

  const handleDifficuly = (value: 'easy' | 'normal' | 'hard') => {
    if (!canUse) return;
    resetQuiz();
    setDifficulty(value);
  };

  useEffect(() => {
    if (isInitialized && canUse && difficulty) {
      mutate({ difficulty });
    }
  }, [difficulty, canUse, isInitialized, mutate]);

  const handleNewQuiz = () => {
    if (!canUse || !difficulty) return;
    resetQuiz();
    addOne('four-idiom-quiz');
    setDifficultyDisabled(false);
    mutate({ difficulty });
  };

  const onSubmit = (values: FormValues) => {
    if (!data) return;
    const isAns = values.answer.trim() === data.answer.trim();
    setIsCorrect(isAns);
    setShowAnswer(true);
    setDifficultyDisabled(true);
  };

  const [showHint, setShowHint] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // 또는 스켈레톤/로딩 등
    return null;
  }
  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 py-8">
      <div className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl bg-white/90 p-8 relative">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-7 h-7 text-violet-500" />
          <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
            사자성어 맞추기
          </h2>
          <span className="ml-auto inline-flex items-center gap-1 bg-blue-100 text-blue-600 rounded-full px-3 py-1 text-xs font-semibold">
            남은 기회 {limit - used} / {limit}
          </span>
        </div>
        {/* 난이도 선택 */}
        <div className="mb-3 flex gap-2 items-center">
          <span className="text-xs font-semibold text-gray-500">난이도:</span>
          <Button
            type="button"
            size="sm"
            variant={difficulty === 'easy' ? 'secondary' : 'outline'}
            className="text-xs px-3 py-1"
            onClick={() => handleDifficuly('easy')}
            disabled={isPending || difficultyDisabled}
          >
            쉬움
          </Button>
          <Button
            type="button"
            size="sm"
            variant={difficulty === 'normal' ? 'secondary' : 'outline'}
            className="text-xs px-3 py-1"
            onClick={() => handleDifficuly('normal')}
            disabled={isPending || difficultyDisabled}
          >
            보통
          </Button>
          <Button
            type="button"
            size="sm"
            variant={difficulty === 'hard' ? 'secondary' : 'outline'}
            className="text-xs px-3 py-1"
            onClick={() => handleDifficuly('hard')}
            disabled={isPending || difficultyDisabled}
          >
            어려움
          </Button>
        </div>
        {canUse ? (
          <>
            <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-violet-50 to-pink-50 border border-violet-100 text-gray-800 font-medium shadow-inner">
              <span className="text-violet-700 font-semibold">문제:</span>{' '}
              {isPending ? (
                <span className="text-gray-400">문제를 불러오는 중...</span>
              ) : (
                data?.question
              )}
              {/* 힌트 버튼 및 노출 */}
              <div className="flex items-center gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setShowHint((v) => !v)}
                  disabled={isPending || !data?.hint}
                >
                  {showHint ? '힌트 숨기기' : '힌트 보기'}
                </Button>
                {showHint && data?.hint && (
                  <span className="ml-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold shadow">
                    {data.hint}
                  </span>
                )}
              </div>
            </div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex gap-2 mb-2"
              autoComplete="off"
            >
              <input
                {...register('answer')}
                className={cn(
                  'border border-gray-300 px-4 py-2 rounded-lg w-36 text-lg font-semibold focus:ring-2 focus:ring-violet-300 transition',
                  showAnswer || isPending ? 'bg-gray-100' : 'bg-white'
                )}
                placeholder="정답(4글자)"
                disabled={showAnswer || isPending}
                maxLength={4}
              />
              <Button
                type="submit"
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-violet-500 text-white font-bold shadow"
                disabled={showAnswer || isPending}
              >
                정답 확인
              </Button>
            </form>
            {formState.errors.answer && (
              <div className="text-red-500 text-sm mb-3 font-semibold">
                {formState.errors.answer.message}
              </div>
            )}
            {showAnswer && (
              <div
                className={cn(
                  'mt-4 flex items-center gap-3 px-5 py-4 rounded-xl border text-lg font-bold shadow transition-all duration-300',
                  isCorrect
                    ? 'bg-green-50 border-green-400 text-green-700 animate-in fade-in'
                    : 'bg-red-50 border-red-400 text-red-700 animate-in fade-in'
                )}
              >
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-green-500 animate-bounce" />
                    <span>정답입니다!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-8 h-8 text-red-500 animate-shake" />
                    <span>틀렸습니다.</span>
                  </>
                )}
                <span className="ml-4 text-gray-700 font-normal">
                  <b>정답:</b>{' '}
                  <span className="text-primary font-bold">{data?.answer}</span>
                </span>
                {canUse && (
                  <Button
                    className="ml-4 text-xs text-blue-500 underline"
                    variant="ghost"
                    onClick={handleNewQuiz}
                    type="button"
                  >
                    새 문제
                  </Button>
                )}
              </div>
            )}
            {!showAnswer && (
              <Button
                className="mt-4 text-xs text-gray-500 underline"
                variant="ghost"
                onClick={handleNewQuiz}
                type="button"
                disabled={isPending}
              >
                문제 새로고침
              </Button>
            )}
          </>
        ) : (
          <div className="mt-6 text-center text-base text-gray-400 font-semibold">
            오늘의 도전 기회를 모두 사용하셨습니다! <br />
            내일 다시 도전해 주세요.
          </div>
        )}
      </div>
    </div>
  );
}
