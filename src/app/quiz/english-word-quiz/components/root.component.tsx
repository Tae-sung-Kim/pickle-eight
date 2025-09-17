'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDailyLimit } from "@/hooks/use-daily-limit.hook";
import { useGptEnglishWordQuizQuery } from "@/queries/use-gpt-english-word-quiz.query";
import { GptEnglishWordQuizResponseType } from "@/types/openai-api.type";
import { Lightbulb } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { EnglishWordQuizOptionsComponent } from './options.component';

export function EnglishWordQuizComponent() {
  const [quiz, setQuiz] = useState<GptEnglishWordQuizResponseType | null>(null);
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
    // 초기에는 자동 생성하지 않음. 사용자가 버튼을 눌러 생성하도록 유지.
  }, [isInitialized]);

  const handleAnswerSelect = (option: string) => {
    if (isRevealed) return;
    setSelectedAnswer(option);
    setIsRevealed(true);
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl text-center text-foreground leading-relaxed flex-1">
            {quiz ? quiz.quiz : '영어 단어 퀴즈를 생성해 시작하세요'}
          </CardTitle>
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            남은 횟수: {limit - used} / {limit}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {quiz && (
          <EnglishWordQuizOptionsComponent
            quiz={quiz}
            isRevealed={isRevealed}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={handleAnswerSelect}
          />
        )}

        {quiz && isRevealed && (
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

        {error && (
          <Alert className="mt-2 bg-destructive/10 border-destructive/30">
            <AlertTitle className="font-bold text-destructive">오류</AlertTitle>
            <AlertDescription className="text-destructive">
              {(error as Error).message}
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-6 flex justify-end">
          <Button
            type="button"
            variant="default"
            onClick={getNewQuiz}
            aria-disabled={!canUse || isPending}
            disabled={!canUse || isPending}
          >
            {canUse ? '퀴즈 생성' : '퀴즈 종료'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default EnglishWordQuizComponent;
