'use client';

import { useState } from 'react';
import { generateLadder, getLadderResults } from '@/utils/ladder-game.util';
import { LadderInput, LadderResult } from '@/types';
import { LadderComponent, LadderInputComponent } from './components';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function LadderGamePage() {
  const [input, setInput] = useState<LadderInput | null>(null);
  const [ladder, setLadder] = useState<any>(null);
  const [results, setResults] = useState<LadderResult[] | null>(null);

  const handleCreateLadder = (data: LadderInput) => {
    setInput(data);
    const newLadder = generateLadder(data);
    setLadder(newLadder);
    setResults(getLadderResults(data, newLadder));
  };

  const handleReset = () => {
    setLadder(null);
    setInput(null);
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            사다리 타기 게임
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            참가자와 상품을 매칭해보세요
          </p>
        </div>

        {!ladder ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-4xl mx-auto">
            <LadderInputComponent onCreateLadder={handleCreateLadder} />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <Button
                onClick={handleReset}
                variant="ghost"
                className="text-gray-600 hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                다시 만들기
              </Button>
              <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                총 {input?.names.length}명 참가
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 h-[600px]">
              <div className="w-full overflow-x-auto h-full">
                <div
                  className="mx-auto"
                  style={{ width: 'fit-content', height: '100%' }}
                >
                  <LadderComponent
                    ladder={ladder}
                    names={input?.names || []}
                    prizes={input?.prizes || []}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                  🎉 매칭 결과
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {results?.map((r, idx) => (
                    <div
                      key={r.name}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{r.name}</div>
                      <div className="flex items-center mt-1">
                        <span className="text-gray-500 mr-2">→</span>
                        <span className="text-blue-600 font-medium">
                          {r.prize}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
