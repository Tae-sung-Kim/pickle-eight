'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDailyLimit, useQuizStore } from '@/hooks';
import { QuizCategoryType, QuizDifficultyType } from '@/types';
import { QuizFormComponent, QuizQuestionCardComponent } from './components';
import { useGptQuizService } from '@/services/use-gpt-quiz.service';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { quizFormSchema, QuizFormValuesType } from '@/types';

export default function QuizPage() {
  const [mounted, setMounted] = useState(false);

  const { limit, used, canUse, useOne: callUseOne } = useDailyLimit();
  const { questions, results, currentIdx, addQuestion, answer } =
    useQuizStore();
  const [answeredId, setAnsweredId] = useState<string | undefined>(undefined);
  const { mutate: generateQuiz, isPending, error } = useGptQuizService();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<QuizFormValuesType>({
    resolver: zodResolver(quizFormSchema),
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
      category: QuizCategoryType;
      difficulty: QuizDifficultyType;
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
          callUseOne();
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
      answeredAt: new Date().toISOString(),
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
    <motion.section
      className="flex flex-col items-center justify-start py-10 bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 32 }}
      transition={{ duration: 0.7, type: 'spring' }}
    >
      <motion.h1
        className="text-3xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        상식/지식 퀴즈
      </motion.h1>
      <motion.div
        className="mb-6 text-gray-700"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        오늘 남은 문제:{' '}
        <span className="font-semibold text-violet-600">{limit - used}</span> /{' '}
        <span className="font-semibold">{limit}</span>
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
          >
            <QuizFormComponent
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
            <QuizQuestionCardComponent
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
    </motion.section>
  );
}
