'use client';

import { motion } from 'framer-motion';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { TRIVIA_QUIZ_CATEGORIES, TRIVIA_QUIZ_DIFFICULTIES } from '@/constants';
import type {
  UseFormRegister,
  UseFormHandleSubmit,
  UseFormWatch,
  UseFormSetValue,
  FieldErrors,
} from 'react-hook-form';
import { TriviaQuizFormValuesType } from '@/types';

type TriviaQuizFormComponentPropsType = {
  onSubmit: (data: TriviaQuizFormValuesType) => void;
  register: UseFormRegister<TriviaQuizFormValuesType>;
  handleSubmit: UseFormHandleSubmit<TriviaQuizFormValuesType>;
  errors: FieldErrors<TriviaQuizFormValuesType>;
  watch: UseFormWatch<TriviaQuizFormValuesType>;
  setValue: UseFormSetValue<TriviaQuizFormValuesType>;
  disabled?: boolean;
  useExternalSubmit?: boolean;
};

export function TriviaQuizFormComponent({
  onSubmit,
  handleSubmit,
  errors,
  watch,
  setValue,
  disabled,
  useExternalSubmit = false,
}: TriviaQuizFormComponentPropsType) {
  return (
    <motion.form
      className="flex flex-col gap-8 w-full max-w-lg mx-auto bg-white/80 rounded-2xl p-10 shadow-2xl border"
      onSubmit={handleSubmit(onSubmit)}
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring' }}
    >
      {/* 분야/난이도 가로 배치 */}
      <div className="flex flex-row gap-6 w-full">
        <div className="flex-1 flex flex-col">
          <Label className="font-semibold text-base mb-1">분야</Label>
          <Select
            value={watch('category')}
            onValueChange={(val) =>
              setValue(
                'category',
                val as (typeof TRIVIA_QUIZ_CATEGORIES)[number]
              )
            }
            disabled={disabled}
          >
            <SelectTrigger className="border rounded px-2 py-1 focus:ring-2 focus:ring-pink-400 transition-all">
              <SelectValue placeholder="분야 선택" />
            </SelectTrigger>
            <SelectContent>
              {TRIVIA_QUIZ_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <motion.span
              className="text-red-500 block mt-1"
              initial={{ x: -8, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            >
              {typeof errors.category.message === 'string'
                ? errors.category.message
                : null}
            </motion.span>
          )}
        </div>
        <div className="flex-1 flex flex-col">
          <Label className="font-semibold text-base mb-1">난이도</Label>
          <Select
            value={watch('difficulty')}
            onValueChange={(val) =>
              setValue(
                'difficulty',
                val as (typeof TRIVIA_QUIZ_DIFFICULTIES)[number]
              )
            }
            disabled={disabled}
          >
            <SelectTrigger className="border rounded px-2 py-1 focus:ring-2 focus:ring-violet-400 transition-all">
              <SelectValue placeholder="난이도 선택" />
            </SelectTrigger>
            <SelectContent>
              {TRIVIA_QUIZ_DIFFICULTIES.map((dif) => (
                <SelectItem key={dif} value={dif}>
                  {dif}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.difficulty && (
            <motion.span
              className="text-red-500 block mt-1"
              initial={{ x: 8, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            >
              {typeof errors.difficulty.message === 'string'
                ? errors.difficulty.message
                : null}
            </motion.span>
          )}
        </div>
      </div>
      {/* 버튼 (외부 컨트롤 사용 시 숨김) */}
      {!useExternalSubmit && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.35, type: 'spring', stiffness: 300 }}
          className="flex justify-center"
        >
          <motion.button
            type="submit"
            disabled={disabled}
            className="px-8 py-3 text-lg font-bold bg-gradient-to-r from-pink-400 to-violet-400 text-white shadow-lg hover:scale-105 active:scale-95 transition-transform rounded cursor-pointer"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
          >
            퀴즈 시작
          </motion.button>
        </motion.div>
      )}
    </motion.form>
  );
}

export default TriviaQuizFormComponent;
