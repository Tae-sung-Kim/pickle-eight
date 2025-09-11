'use client';

import { useCallback, useEffect, useState } from 'react';
import { useGptEnglishWordQuizQuery } from '@/queries';
import { GptEnglishWordQuizResponse } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb } from 'lucide-react';
import { useDailyLimit } from '@/hooks';
import { EnglishWordQuizOptionsComponent } from './options.component';
import { DEFAULT_GPT_MODEL } from '@/constants';
import { GptModelSelectButtonComponent } from '@/components';

export function EnglishWordQuizComponent() {
  const [quiz, setQuiz] = useState<GptEnglishWordQuizResponse | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [model, setModel] = useState<string>(DEFAULT_GPT_MODEL);

  const { getDailyLimitInfo, addOne, isInitialized } = useDailyLimit();
  const { canUse, limit, used } = getDailyLimitInfo('english-word-quiz');

  const { mutate: fetchQuiz, isPending, error } = useGptEnglishWordQuizQuery();

  const getNewQuiz = useCallback(() => {
    if (!canUse) return;

    fetchQuiz(
      { model },
      {
        onSuccess: (data) => {
          addOne('english-word-quiz');
          setQuiz(data);
          setSelectedAnswer(null);
          setIsRevealed(false);
        },
      }
    );
  }, [addOne, canUse, fetchQuiz, model]);

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
          <div className="flex flex-col items-end gap-2">
            <span className="text-sm text-muted-foreground">GPT 모델</span>
            <GptModelSelectButtonComponent
              model={model}
              onModelChange={setModel}
              onProceed={getNewQuiz}
              isBusy={isPending}
              disabled={!canUse}
              buttonLabel={canUse ? '퀴즈 생성' : '퀴즈 종료'}
              triggerSize="sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default EnglishWordQuizComponent;
