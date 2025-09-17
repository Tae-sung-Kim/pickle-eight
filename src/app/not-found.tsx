'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

/**
 * 404 Not Found Page Component
 * 사용자가 존재하지 않는 경로에 접근했을 때 보여주는 페이지입니다.
 * @returns {JSX.Element} NotFound 컴포넌트
 */
export function NotFound() {
  const router = useRouter();

  /**
   * 홈으로 이동하는 함수
   */
  const handleGoHome = (): void => {
    router.replace('/');
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full bg-muted">
      <Card className="p-8 flex flex-col items-center gap-6 shadow-lg">
        <h1 className="text-4xl font-bold text-destructive">404</h1>
        <p className="text-lg text-center text-muted-foreground">
          페이지를 찾을 수 없습니다.
        </p>
        <Button variant="default" onClick={handleGoHome}>
          홈으로 이동
        </Button>
      </Card>
    </div>
  );
}
