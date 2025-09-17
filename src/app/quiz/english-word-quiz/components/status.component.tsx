'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EnglishWordQuizStatusType } from "@/types/english-word-quiz.type";
import { Loader2 } from 'lucide-react';

export function EnglishWordQuizStatusComponent({
  status,
}: EnglishWordQuizStatusType) {
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">
          퀴즈를 만들고 있어요...
        </p>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <Alert variant="destructive">
        <AlertTitle>오류 발생</AlertTitle>
        <AlertDescription>
          퀴즈를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
        </AlertDescription>
      </Alert>
    );
  }
  if (status === 'limit') {
    return (
      <Alert>
        <AlertTitle>오늘의 퀴즈를 모두 풀었어요!</AlertTitle>
        <AlertDescription>
          내일 다시 새로운 퀴즈에 도전해보세요. (매일 5회 제공)
        </AlertDescription>
      </Alert>
    );
  }
  return null;
}

export default EnglishWordQuizStatusComponent;
