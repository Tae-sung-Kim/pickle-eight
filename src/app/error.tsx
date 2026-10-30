'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold tracking-widest text-destructive">
        ERROR
      </p>
      <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
        문제가 발생했습니다
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
        일시적인 오류일 수 있어요. 잠시 후 다시 시도하거나 홈으로 이동해 주세요.
      </p>
      <div className="mt-8 flex gap-2">
        <Button type="button" onClick={reset}>
          다시 시도
        </Button>
        <Button asChild variant="outline">
          <Link href="/">홈으로 이동</Link>
        </Button>
      </div>
    </div>
  );
}
