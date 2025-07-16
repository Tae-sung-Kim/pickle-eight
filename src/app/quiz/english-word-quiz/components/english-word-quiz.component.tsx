'use client';

import { useCallback, useEffect, useState } from 'react';
import { useGptEnglishWordQuizQuery } from '@/queries/use-gpt-english-word-quiz.query';
import { GptEnglishWordQuizResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Lightbulb, RefreshCw } from 'lucide-react';
import { useDailyLimit } from '@/hooks';

export function EnglishWordQuizComponent() {
  const [quiz, setQuiz] = useState<GptEnglishWordQuizResponse | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  const { getDailyLimitInfo, addOne, isInitialized } = useDailyLimit();
  const { canUse, limit, used } = getDailyLimitInfo('english-word-quiz');

  const { mutate: fetchQuiz, isPending, error } = useGptEnglishWordQuizQuery();

  const getNewQuiz = useCallback(() => {
    if (!canUse) return;

    fetchQuiz(undefined, {
      onSuccess: (data) => {
        addOne('english-word-quiz');
        setQuiz(data);
        setSelectedAnswer(null);
        setIsRevealed(false);
      },
    });
  }, [addOne, canUse, fetchQuiz]);

  useEffect(() => {
    if (isInitialized) {
      getNewQuiz();
    }
  }, [isInitialized, getNewQuiz]);

  const handleAnswerSelect = (option: string) => {
    if (isRevealed) return;
    setSelectedAnswer(option);
    setIsRevealed(true);
  };

  if (!isInitialized || (isPending && !quiz)) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        <p className="ml-4 text-lg text-gray-600">
          {isInitialized ? '퀴즈를 만들고 있어요...' : '초기화 중...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>오류 발생</AlertTitle>
        <AlertDescription>
          퀴즈를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
        </AlertDescription>
      </Alert>
    );
  }

  if (!canUse && !quiz) {
    return (
      <Alert>
        <AlertTitle>오늘의 퀴즈를 모두 풀었어요!</AlertTitle>
        <AlertDescription>
          내일 다시 새로운 퀴즈에 도전해보세요. (매일 5회 제공)
        </AlertDescription>
      </Alert>
    );
  }

  if (!quiz) {
    return null;
  }

  const getButtonVariant = (option: string) => {
    if (!isRevealed) return 'outline';
    if (option === quiz.answer) return 'default';
    if (option === selectedAnswer) return 'destructive';
    return 'outline';
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl text-center text-gray-700 leading-relaxed flex-1">
            {quiz.quiz}
          </CardTitle>
          <div className="text-sm text-gray-500 whitespace-nowrap">
            남은 횟수: {limit - used} / {limit}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quiz.options?.map((option) => (
            <Button
              key={option}
              onClick={() => handleAnswerSelect(option)}
              variant={getButtonVariant(option)}
              className="h-14 text-lg transition-all duration-300 transform hover:scale-105"
              disabled={isRevealed}
            >
              {option}
            </Button>
          ))}
        </div>

        {isRevealed && (
          <Alert className="mt-6 bg-yellow-50 border-yellow-300">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <AlertTitle className="font-bold text-yellow-800">
              정답: {quiz.answer}
            </AlertTitle>
            <AlertDescription className="text-yellow-700 mt-2">
              {quiz.explanation}
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={getNewQuiz}
          className="w-full mt-6 h-12 text-lg font-bold bg-blue-500 hover:bg-blue-600"
          disabled={isPending || !canUse}
        >
          {isPending ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <RefreshCw className="w-6 h-6 mr-2" />
          )}
          {canUse ? '다음 퀴즈' : '퀴즈 종료'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default EnglishWordQuizComponent;
