'use client';

import { NameInputComponent } from './components/name-input.component';
// import { DrawOptionsComponent } from './components/draw-options.component';
// import { ResultDisplayComponent } from './components/result-display.component';
import { useNameRandomStore } from '@/stores';

export default function NameRandomPage() {
  const { result, isDrawing } = useNameRandomStore();

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">이름 추첨기</h1>

      {!result || result.length < 1 ? (
        <>
          <NameInputComponent />
          {/* <DrawOptionsComponent /> */}
        </>
      ) : (
        <></>
        // <ResultDisplayComponent />
      )}
    </div>
  );
}
