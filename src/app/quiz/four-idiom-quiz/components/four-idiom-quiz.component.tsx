'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDailyLimit } from '@/hooks/use-daily-limit';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useGptFourIdiomQuizQuery } from '@/queries';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FOUR_IDIOMS_COLLECTION } from '@/constants/four-idiom-quiz.constant';
import { FourIdiomQuizDifficultyType } from '@/types';
import FourIdiomQuizDifficultyComponent from './four-idiom-quiz-difficulty.component';
import FourIdiomQuizAnswerComponent from './four-idiom-quiz-answer.component';
import FourIdiomQuizFormComponent from './four-idiom-quiz-form.component';

const schema = z.object({ answer: z.string().length(4, '정확히 4글자!') });
type FormValues = { answer: string };

export function FourIdiomQuizComponent() {
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const { getDailyLimitInfo, addOne, isInitialized } = useDailyLimit();
  const { canUse, limit, used } = getDailyLimitInfo(FOUR_IDIOMS_COLLECTION);
  const [difficultyDisabled, setDifficultyDisabled] = useState(false);
  const [difficulty, setDifficulty] =
    useState<FourIdiomQuizDifficultyType | null>(null);

  const [isQuizEnd, setIsQuizEnd] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 카운트와 사용 여부를 확인하여 모든 도전이 끝났는지 확인
  const isAllUsed = useMemo(() => !canUse && !isQuizEnd, [canUse, isQuizEnd]);

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

  const handleDifficuly = (value: FourIdiomQuizDifficultyType) => {
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
    setDifficultyDisabled(false);
    mutate({ difficulty });
  };

  const onSubmit = (values: FormValues) => {
    if (!data) return;
    const isAns = values.answer.trim() === data.answer.trim();
    setIsCorrect(isAns);
    setShowAnswer(true);
    setDifficultyDisabled(true);

    addOne(FOUR_IDIOMS_COLLECTION);

    // 마지막 문제에서 정답 제출 시 엔드 플래그
    if (used + 1 >= limit) {
      setIsQuizEnd(true);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // 또는 스켈레톤/로딩 등
    return null;
  }
  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="w-7 h-7 text-violet-500" />
        <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
          사자성어 퀴즈
        </h2>
        <span className="ml-auto inline-flex items-center gap-1 bg-blue-100 text-blue-600 rounded-full px-3 py-1 text-xs font-semibold">
          남은 기회 {limit - used} / {limit}
        </span>
      </div>
      {/* 난이도 선택 */}
      <FourIdiomQuizDifficultyComponent
        difficulty={difficulty}
        isPending={isPending}
        difficultyDisabled={difficultyDisabled}
        onDifficuly={handleDifficuly}
      />
      {!isAllUsed ? (
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
          <FourIdiomQuizFormComponent
            showAnswer={showAnswer}
            isPending={isPending}
            register={register}
            formState={formState}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
          />
          {data && (
            <FourIdiomQuizAnswerComponent
              isPending={isPending}
              showAnswer={showAnswer}
              isCorrect={isCorrect}
              data={data}
              canUse={canUse}
              onNewQuiz={handleNewQuiz}
            />
          )}
        </>
      ) : (
        <div className="mt-6 text-center text-base text-gray-400 font-semibold">
          오늘의 도전 기회를 모두 사용하셨습니다! <br />
          내일 다시 도전해 주세요.
        </div>
      )}
    </>
  );
}

export default FourIdiomQuizComponent;
