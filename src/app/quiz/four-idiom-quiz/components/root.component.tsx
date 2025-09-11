'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDailyLimit } from '@/hooks';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useGptFourIdiomQuizQuery } from '@/queries';
import { Button } from '@/components/ui/button';
import { FOUR_IDIOMS_COLLECTION, DEFAULT_GPT_MODEL } from '@/constants';
import { FourIdiomQuizDifficultyType } from '@/types';
import FourIdiomQuizDifficultyComponent from './difficulty.component';
import FourIdiomQuizAnswerComponent from './answer.component';
import FourIdiomQuizFormComponent from './form.component';
import { GptModelSelectButtonComponent } from '@/components';

const schema = z.object({ answer: z.string().length(4, '정확히 4글자!') });
type FormValues = { answer: string };

export function FourIdiomQuizComponent() {
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const { getDailyLimitInfo, addOne } = useDailyLimit();
  const { canUse, limit, used } = getDailyLimitInfo(FOUR_IDIOMS_COLLECTION);
  const [difficulty, setDifficulty] =
    useState<FourIdiomQuizDifficultyType | null>(null);
  const [model, setModel] = useState<string>(DEFAULT_GPT_MODEL);

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
    // 난이도만 설정하고, API 호출은 하지 않음
    setDifficulty(value);
    setShowHint(false);
  };

  // 자동 생성 제거: 난이도 변경 시 더 이상 mutate 호출하지 않음
  // useEffect(() => {
  //   if (isInitialized && canUse && difficulty) {
  //     mutate({ difficulty });
  //   }
  // }, [difficulty, canUse, isInitialized, mutate]);

  const handleGenerate = () => {
    if (!canUse || !difficulty) return;
    resetQuiz();
    mutate(
      { difficulty, model },
      {
        onSuccess: () => {
          // 문제 생성 시 바로 차감
          addOne(FOUR_IDIOMS_COLLECTION);
          // 마지막 문제 생성 후 종료 처리
          if (used + 1 >= limit) setIsQuizEnd(true);
        },
      }
    );
  };

  const onSubmit = (values: FormValues) => {
    if (!data) return;
    const isAns = values.answer.trim() === data.answer.trim();
    setIsCorrect(isAns);
    setShowAnswer(true);
    // 기존: addOne()을 여기서 호출했으나, 이제 생성 시점에 차감하므로 제거
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // 또는 스켈레톤/로딩 등
    return null;
  }
  return (
    <div className="m-5 p-5 bg-white/80 border-2 border-muted rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        {/* 난이도 선택 */}
        <FourIdiomQuizDifficultyComponent
          difficulty={difficulty}
          isPending={isPending}
          onDifficuly={handleDifficuly}
        />
        <span className="ml-auto inline-flex items-center gap-1 bg-blue-100 text-blue-600 rounded-full px-3 py-1 text-xs font-semibold">
          남은 기회 {limit - used} / {limit}
        </span>
      </div>
      {!isAllUsed ? (
        <>
          <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-violet-50 to-pink-50 border border-violet-100 text-gray-800 font-medium shadow-inner">
            <span className="text-violet-700 font-semibold">문제:</span>{' '}
            {isPending ? (
              <span className="text-gray-400">문제를 불러오는 중...</span>
            ) : (
              data?.question || '난이도를 선택하고 문제 생성을 누르세요'
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
              showAnswer={showAnswer}
              isCorrect={isCorrect}
              data={data}
            />
          )}

          {/* 모델 선택 + 문제 생성 버튼 */}
          <div className="mt-4 flex justify-end">
            <div className="flex flex-col items-end gap-2">
              <span className="text-xs text-muted-foreground">GPT 모델</span>
              <GptModelSelectButtonComponent
                model={model}
                onModelChange={setModel}
                onProceed={handleGenerate}
                isBusy={isPending}
                disabled={!canUse || !difficulty}
                buttonLabel={canUse ? '문제 생성' : '오늘 종료'}
                triggerSize="sm"
              />
            </div>
          </div>
        </>
      ) : (
        <div className="mt-6 text-center text-base text-gray-400 font-semibold">
          오늘의 도전 기회를 모두 사용하셨습니다! <br />
          내일 다시 도전해 주세요.
        </div>
      )}
    </div>
  );
}

export default FourIdiomQuizComponent;
