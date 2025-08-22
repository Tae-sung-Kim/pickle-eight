'use client';

import { useCallback, useEffect, useState } from 'react';
import { useGptEnglishWordQuizQuery } from '@/queries/use-gpt-english-word-quiz.query';
import { GptEnglishWordQuizResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Lightbulb, RefreshCw } from 'lucide-react';
import { useDailyLimit } from '@/hooks';
import { EnglishWordQuizOptionsComponent } from './english-word-quiz-options';
import EnglishWordQuizStatusComponent from './english-word-quiz-status';

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

  let status: 'loading' | 'error' | 'limit' | 'none' = 'none';
  if (!isInitialized || (isPending && !quiz)) {
    status = 'loading';
  } else if (error) {
    status = 'error';
  } else if (!canUse && !quiz) {
    status = 'limit';
  } else if (!quiz) {
    status = 'none';
  }
  if (status !== 'none') {
    return <EnglishWordQuizStatusComponent status={status} />;
  }

  if (!quiz) {
    return null;
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl text-center text-foreground leading-relaxed flex-1">
            {quiz.quiz}
          </CardTitle>
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            남은 횟수: {limit - used} / {limit}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <EnglishWordQuizOptionsComponent
          quiz={quiz}
          isRevealed={isRevealed}
          selectedAnswer={selectedAnswer}
          onAnswerSelect={handleAnswerSelect}
        />

        {isRevealed && (
          <Alert className="mt-6 bg-info/10 border-info/30">
            <Lightbulb className="h-5 w-5 text-info" />
            <AlertTitle className="font-bold text-info">
              정답: {quiz.answer}
            </AlertTitle>
            <AlertDescription className="text-info mt-2">
              {quiz.explanation}
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={getNewQuiz}
          className="w-full mt-6 h-12 text-lg font-bold bg-primary text-primary-foreground"
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
