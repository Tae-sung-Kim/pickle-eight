'use client';
import { Button } from '@/components/ui/button';
import { useDailyLimit } from "@/hooks/use-daily-limit.hook";
import { useTriviaQuizStore } from "@/hooks/use-trivia-quiz.hook";
import { useGptTriviaQuizQuery } from "@/queries/use-gpt-trivia-quiz.query";
import { TriviaQuizCategoryType, TriviaQuizDifficultyType, TriviaQuizFormSchema, TriviaQuizFormValuesType } from "@/types/trivia-quiz.type";
import { getKoreaTime } from "@/utils/common.util";
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { TriviaQuizFormComponent } from './form.component';
import { TriviaQuizQuestionCardComponent } from './question.component';

export function TriviaQuizComponent() {
  const [mounted, setMounted] = useState(false);

  const { getDailyLimitInfo, addOne } = useDailyLimit();
  const { canUse, limit, used } = getDailyLimitInfo('trivia-quiz');
  const { questions, results, currentIdx, addQuestion, answer } =
    useTriviaQuizStore();
  const [answeredId, setAnsweredId] = useState<string | undefined>(undefined);
  const { mutate: generateQuiz, isPending, error } = useGptTriviaQuizQuery();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<TriviaQuizFormValuesType>({
    resolver: zodResolver(TriviaQuizFormSchema),
    defaultValues: { category: '상식', difficulty: '하' },
  });

  // 정답률 계산
  const correctCount = results.filter((r) => r.correct).length;

  // 문제 요청
  const handleStart = (
    {
      category,
      difficulty,
    }: {
      category: TriviaQuizCategoryType;
      difficulty: TriviaQuizDifficultyType;
    },
    retryCount = 0
  ) => {
    setAnsweredId(undefined);
    generateQuiz(
      { category, difficulty },
      {
        onSuccess: (quiz) => {
          // 중복 체크: 문제 텍스트 기준
          const isDuplicate = questions.some(
            (q) => q.question === quiz.question
          );
          if (isDuplicate) {
            if (retryCount < 2) {
              toast.error('이미 출제된 문제입니다. 다시 시도합니다.');
              // 최대 3번까지만 재귀
              handleStart({ category, difficulty }, retryCount + 1);
            } else {
              toast.error('중복 문제로 인해 새 문제를 불러오지 못했습니다.');
            }
            return;
          }
          addQuestion(quiz);
          addOne('trivia-quiz');
        },
        onError: (e) => {
          toast.error(e.message);
        },
      }
    );
  };

  // 정답 제출
  const handleAnswer = (selectedId: string) => {
    if (!questions[currentIdx]) return;
    setAnsweredId(selectedId);
    // answer()와 results 추가는 handleNext에서 처리
  };

  // 다음 문제: answer() 호출 및 상태 초기화
  const handleNext = () => {
    if (!answeredId || !questions[currentIdx]) return;
    const isCorrect = answeredId === questions[currentIdx].answerId;
    answer({
      questionId: questions[currentIdx].id,
      selectedId: answeredId,
      correct: isCorrect,
      answeredAt: getKoreaTime().toISOString(),
    });
    setAnsweredId(undefined);
  };

  // 로컬 스토리지 마운트 확인
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  // 5문제 모두 풀었을 때
  const allDone = used >= limit && results.length >= limit;

  return (
    <>
      <motion.div
        className="mb-4 flex justify-end"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        aria-label="오늘 남은 문제"
      >
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 text-indigo-700 px-3 py-1 text-xs font-semibold border border-indigo-200 shadow-sm dark:bg-indigo-900/40 dark:text-indigo-200 dark:border-indigo-800">
          오늘 남은 문제: <span className="font-bold">{limit - used}</span> /{' '}
          <span className="font-bold">{limit}</span>
        </span>
      </motion.div>
      <AnimatePresence mode="wait">
        {allDone ? (
          <motion.div
            key="done"
            className="w-full max-w-md bg-white/90 rounded-xl shadow-xl p-8 flex flex-col gap-4 items-center border"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 20 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <div className="text-xl font-bold text-gray-800">
              오늘의 퀴즈 완료!
            </div>
            <div className="text-lg">
              정답률:{' '}
              <span className="font-semibold text-violet-600">
                {correctCount} / {limit}
              </span>
            </div>
          </motion.div>
        ) : isPending ? (
          <motion.div
            key="loading"
            className="mt-8 text-blue-600 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            문제를 생성 중입니다...
          </motion.div>
        ) : questions.length === results.length ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-lg mx-auto"
          >
            <TriviaQuizFormComponent
              onSubmit={handleStart}
              disabled={!canUse}
              register={register}
              handleSubmit={handleSubmit}
              errors={errors}
              watch={watch}
              setValue={setValue}
              useExternalSubmit
            />
            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                variant="default"
                onClick={() => handleSubmit((v) => handleStart(v))()}
                aria-disabled={!canUse || isPending}
                disabled={!canUse || isPending}
              >
                {canUse ? '퀴즈 시작' : '오늘 종료'}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="question"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.4 }}
          >
            <TriviaQuizQuestionCardComponent
              question={questions[currentIdx]}
              onAnswer={handleAnswer}
              onNext={handleNext}
              answeredId={answeredId}
              disabled={!!answeredId}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {error && (
          <motion.div
            className="mt-4 text-red-500"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3 }}
          >
            {error.message}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
