'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function Error() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="text-6xl">😵</div>
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-muted-foreground">
        An unexpected error has occurred. Please try again or return to the
        homepage.
      </p>
      <Button
        variant="default"
        onClick={() => router.push('/')}
        className="mt-4"
      >
        Go Home
      </Button>
    </div>
  );
}
