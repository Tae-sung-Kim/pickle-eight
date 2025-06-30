'use client';

import { useState } from 'react';
import { DrawOrderComponent, DrawOrderInputListComponent } from './components';
import { useNameManager } from '@/hooks';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Gift, Users, ArrowRight } from 'lucide-react';

export default function DrawOrderPage() {
  const [started, setStarted] = useState(false);
  const [items, setItems] = useState<string[]>([]);

  // 참가자 이름 관리를 위한 커스텀 훅 사용
  const { names: participants, addName, removeName } = useNameManager();

  // 상품/번호 추가
  const addItem = (item: string) => {
    setItems((prev) => [...prev, item]);
  };

  // 상품/번호 제거
  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // 시작 조건
  const canStart = participants.length > 0 && items.length > 0;

  // 애니메이션 변수
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
              순서 추첨하기
            </h1>
            <p className="text-gray-600 max-w-md mx-auto">
              참가자와 상품을 등록하고 공정한 순서 추첨을 진행해보세요.
            </p>
          </motion.div>

          <motion.div
            className="space-y-8"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={item}>
              <DrawOrderInputListComponent
                label="참가자 목록"
                placeholder="참가자 이름 입력"
                list={participants}
                onAdd={addName}
                onRemove={removeName}
              />
            </motion.div>

            <motion.div variants={item}>
              <DrawOrderInputListComponent
                label="상품/번호 목록"
                placeholder="상품 또는 번호 입력"
                list={items}
                onAdd={addItem}
                onRemove={removeItem}
              />
            </motion.div>

            <motion.div className="pt-4" variants={item}>
              <Button
                onClick={() => setStarted(true)}
                disabled={!canStart}
                size="lg"
                className={`w-full py-6 text-lg font-semibold transition-all duration-200 ${
                  !canStart
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-lg'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  추첨 시작하기 <ArrowRight className="w-5 h-5" />
                </span>
              </Button>

              {!canStart && (
                <p className="text-sm text-center text-gray-500 mt-3">
                  {participants.length === 0 && items.length === 0
                    ? '참가자와 상품을 추가해주세요.'
                    : participants.length === 0
                    ? '최소 1명 이상의 참가자가 필요합니다.'
                    : '최소 1개 이상의 상품/번호가 필요합니다.'}
                </p>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="outline"
            onClick={() => setStarted(false)}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            뒤로 가기
          </Button>

          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Gift className="w-6 h-6 text-primary" />
            순서 추첨 진행 중
          </h1>
          <p className="text-gray-600 mt-1">
            참가자들이 순서대로 뽑기를 진행해주세요.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DrawOrderComponent participants={participants} items={items} />
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-6 h-full">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary" />
                참가자 안내
              </h3>
              <div className="space-y-4 text-sm text-gray-600">
                <div className="p-3 bg-blue-50/50 backdrop-blur-sm rounded-lg">
                  <p className="font-medium text-blue-800">💡 사용 방법</p>
                  <ol className="mt-1 space-y-1 list-decimal list-inside">
                    <li>
                      화면에 표시된 순서대로 참가자가 뽑기 버튼을 누릅니다.
                    </li>
                    <li>뽑힌 상품/번호는 자동으로 기록됩니다.</li>
                    <li>
                      모든 참가자가 뽑기를 완료하면 결과를 확인할 수 있습니다.
                    </li>
                  </ol>
                </div>

                <div className="p-3 bg-amber-50/50 backdrop-blur-sm rounded-lg">
                  <p className="font-medium text-amber-800">ℹ️ 참고 사항</p>
                  <ul className="mt-1 space-y-1 list-disc list-inside">
                    <li>현재 차례의 참가자는 하이라이트되어 표시됩니다.</li>
                    <li>
                      뽑기 결과는 자동으로 저장되며, 페이지를 새로고침해도
                      유지됩니다.
                    </li>
                    <li>
                      다시 시작하려면 &apos;뒤로 가기&apos; 버튼을 클릭하세요.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
