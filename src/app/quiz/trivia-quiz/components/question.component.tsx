'use client';

import { TriviaQuizQuestionType } from "@/types/trivia-quiz.type";
import { AnimatePresence, motion } from 'framer-motion';

type TriviaQuizQuestionCardComponentType = {
  question: TriviaQuizQuestionType;
  onAnswer: (selectedId: string) => void;
  onNext: () => void;
  disabled?: boolean;
  answeredId?: string;
};

/**
 * 퀴즈 문제/정답/해설 컴포넌트 (motion/styling 적용)
 */
export function TriviaQuizQuestionCardComponent({
  question,
  onAnswer,
  onNext,
  disabled,
  answeredId,
}: TriviaQuizQuestionCardComponentType) {
  const isAnswered = Boolean(answeredId);
  const isCorrect = answeredId === question.answerId;

  const handleSelect = (id: string) => {
    if (disabled || isAnswered) return;
    onAnswer(id);
  };

  return (
    <motion.div
      className="w-full max-w-xl mx-auto surface-card rounded-xl shadow-xl p-8 flex flex-col gap-6 border"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 32 }}
      transition={{ duration: 0.6, type: 'spring' }}
    >
      <motion.div
        className="text-xl font-bold text-foreground"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        {question.question}
      </motion.div>
      <div className="flex flex-col gap-3">
        {question.options.map((opt) => {
          const isSelected = answeredId === opt.id;
          let optionClass =
            'border rounded-xl px-4 py-3 cursor-pointer font-medium surface-card transition-all flex items-center shadow-sm';
          if (isAnswered) {
            if (opt.id === question.answerId)
              optionClass +=
                ' border-success bg-success/10 text-success ring-2 ring-success/30';
            else if (isSelected)
              optionClass +=
                ' border-destructive bg-destructive/10 text-destructive ring-2 ring-destructive/20';
            else optionClass += ' border-border text-muted-foreground';
          } else {
            optionClass +=
              ' border-border hover:border-primary hover:bg-primary/5';
          }
          return (
            <motion.div
              key={opt.id}
              className={optionClass}
              onClick={() => handleSelect(opt.id)}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              whileHover={!isAnswered ? { scale: 1.03 } : undefined}
              whileTap={!isAnswered ? { scale: 0.97 } : undefined}
              initial={false}
              animate={
                isAnswered && isSelected
                  ? isCorrect
                    ? { scale: 1.05 }
                    : { x: [0, -8, 8, -8, 8, 0] }
                  : { scale: 1, x: 0 }
              }
              transition={
                isAnswered && isSelected && !isCorrect
                  ? {
                      duration: 0.5,
                      times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                      ease: 'easeInOut',
                      type: 'tween',
                    }
                  : { type: 'spring', stiffness: 400, damping: 18 }
              }
            >
              {opt.text}
            </motion.div>
          );
        })}
      </div>
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            className="mt-4 p-4 rounded-xl bg-muted border flex flex-col gap-4 items-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: isCorrect ? [1, 1.08, 1] : 1,
            }}
            exit={{ opacity: 0, y: 16 }}
            transition={
              isCorrect
                ? {
                    duration: 0.5,
                    times: [0, 0.5, 1],
                    ease: 'easeInOut',
                    type: 'tween',
                  }
                : { duration: 0.5, type: 'spring' }
            }
          >
            <div
              className={
                isCorrect
                  ? 'text-success font-semibold text-lg flex items-center gap-2'
                  : 'text-destructive font-semibold text-lg flex items-center gap-2'
              }
            >
              {isCorrect ? (
                <>
                  <span>정답입니다! ✅</span>
                </>
              ) : (
                <>
                  <span>오답입니다. ❌</span>
                </>
              )}
            </div>
            <div className="mt-2 flex flex-col gap-1">
              <span>
                <span className="font-semibold">내가 고른 답:</span>{' '}
                <span className="text-primary flex items-center gap-1">
                  {question.options.find((opt) => opt.id === answeredId)
                    ?.text ?? '-'}
                  {!isCorrect && answeredId && <span className="ml-1">❌</span>}
                </span>
              </span>
              {!isCorrect && (
                <span>
                  <span className="font-semibold">정답:</span>{' '}
                  <span className="text-success flex items-center gap-1">
                    {question.options.find(
                      (opt) => opt.id === question.answerId
                    )?.text ?? '-'}
                    <span className="ml-1">✅</span>
                  </span>
                </span>
              )}
            </div>
            <div className="mt-2 text-muted-foreground">
              {question.explanation}
            </div>
            <motion.button
              onClick={onNext}
              className="mt-4 px-6 py-2 text-base font-bold bg-primary text-primary-foreground shadow-md hover:scale-105 active:scale-95 transition-transform rounded cursor-pointer"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
            >
              다음 문제
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
