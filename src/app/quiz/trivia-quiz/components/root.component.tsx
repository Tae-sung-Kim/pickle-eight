'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTriviaQuizStore, useDailyLimit } from '@/hooks';
import { TriviaQuizCategoryType, TriviaQuizDifficultyType } from '@/types';
import { useGptTriviaQuizQuery } from '@/queries';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TriviaQuizFormSchema, TriviaQuizFormValuesType } from '@/types';
import TriviaQuizFormComponent from './form.component';
import TriviaQuizQuestionCardComponent from './question.component';
import { getKoreaTime } from '@/utils';

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
    // toast는 피드백용으로만 유지
    const isCorrect = selectedId === questions[currentIdx].answerId;
    if (isCorrect) {
      toast.success('정답입니다!');
    } else {
      toast.error('틀렸어요!');
    }
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

  // 리셋
  // const handleReset = () => {
  //   reset();
  //   resetLimit();
  //   setAnsweredId(undefined);
  // };

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
            {/* <motion.button
              onClick={handleReset}
              className="mt-2 px-6 py-3 text-lg font-bold bg-gradient-to-r from-pink-400 to-violet-400 text-white shadow-lg hover:scale-105 active:scale-95 transition-transform rounded"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
            >
              초기화 및 다시 도전
            </motion.button> */}
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
            />
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

export default TriviaQuizComponent;
