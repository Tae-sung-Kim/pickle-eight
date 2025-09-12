'use client';

import { Button } from '@/components/ui/button';
import { GptEnglishWordQuizResponse } from '@/types';

type EnglishWordQuizOptionsComponentType = {
  quiz: GptEnglishWordQuizResponse;
  isRevealed: boolean;
  selectedAnswer: string | null;
  onAnswerSelect: (option: string) => void;
};

export function EnglishWordQuizOptionsComponent({
  quiz,
  isRevealed,
  selectedAnswer,
  onAnswerSelect,
}: EnglishWordQuizOptionsComponentType) {
  const getButtonVariant = (option: string) => {
    if (!isRevealed) return 'outline';
    if (option === quiz.answer) return 'default';
    if (option === selectedAnswer) return 'destructive';
    return 'outline';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {quiz.options?.map((option) => (
        <Button
          key={option}
          onClick={() => onAnswerSelect(option)}
          variant={getButtonVariant(option)}
          className="h-14 text-lg transition-all duration-300 transform hover:scale-105"
          disabled={isRevealed}
        >
          {option}
        </Button>
      ))}
    </div>
  );
}
