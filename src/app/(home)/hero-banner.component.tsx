'use client';

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

/**
 * HeroBanner component for main home page.
 */
export function HeroBanner() {
  return (
    <Alert className="mb-8 bg-gradient-to-r from-yellow-100 to-pink-100 border-0 shadow-lg">
      <AlertTitle className="font-bold text-lg text-pink-600">
        아직 미완성입니다. 단계별로 계속 업데이트 예정입니다.
      </AlertTitle>
      <AlertDescription className="text-sm text-gray-700">
        많은 관심 부탁드립니다!
      </AlertDescription>
    </Alert>
  );
}
