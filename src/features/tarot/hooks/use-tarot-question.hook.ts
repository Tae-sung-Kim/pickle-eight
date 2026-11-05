'use client';

import { useCallback, useState } from 'react';

import { TAROT_QUESTION_MAX_LENGTH } from '@/features/tarot/constants/tarot-question.constant';

/**
 * 질문은 이 useState 하나(메모리)에만 둔다.
 * 저장소, URL, 전역 store, Context, console에 올리지 않는다.
 */
export function useTarotQuestion() {
  const [question, setQuestionState] = useState<string>('');

  /** 붙여넣기 대비로 maxLength와 별개로 한 번 더 자른다 */
  const setQuestion = useCallback((value: string) => {
    setQuestionState(value.slice(0, TAROT_QUESTION_MAX_LENGTH));
  }, []);

  const resetQuestion = useCallback(() => {
    setQuestionState('');
  }, []);

  const trimmedQuestion = question.trim();

  return {
    question,
    setQuestion,
    resetQuestion,
    /** trim 결과. 빈 문자열이면 질문 없음 */
    trimmedQuestion,
    hasQuestion: trimmedQuestion !== '',
    length: question.length,
    isAtLimit: question.length >= TAROT_QUESTION_MAX_LENGTH,
  };
}
