'use client';

import { useEffect, useState } from 'react';
import { useGptTodayMessageService } from '@/services/use-gpt-today-message.service';
import { MessageStateType, TodayMessageType } from '@/types';
import { Sun, Smile } from 'lucide-react';

const getTodayKey = (type: TodayMessageType) => {
  const today = new Date().toISOString().slice(0, 10);
  return `today-message:${type}:${today}`;
};

export function HeroTodayMessageComponent() {
  const [messages, setMessages] = useState<MessageStateType>({
    cheer: null,
    fortune: null,
  });

  const cheerMutation = useGptTodayMessageService('cheer');
  const fortuneMutation = useGptTodayMessageService('fortune');

  useEffect(() => {
    (['cheer', 'fortune'] as TodayMessageType[]).forEach((type) => {
      const key = getTodayKey(type);
      const saved =
        typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      if (saved) {
        setMessages((prev) => ({ ...prev, [type]: saved }));
      } else {
        const mutation = type === 'cheer' ? cheerMutation : fortuneMutation;
        mutation.mutate(undefined, {
          onSuccess: (msg) => {
            setMessages((prev) => ({ ...prev, [type]: msg }));
            localStorage.setItem(key, msg);
          },
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="w-full max-w-3xl mx-auto mt-8 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cheer Message */}
        <div className="relative bg-gradient-to-br from-lime-100 via-emerald-100 to-yellow-100 rounded-xl shadow-lg p-6 flex flex-col items-center min-h-[120px] border border-lime-200">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white shadow-md rounded-full p-2 border border-lime-200">
            <Smile className="w-7 h-7 text-lime-500" />
          </div>
          <div className="mt-6 text-lg font-bold text-emerald-700 tracking-tight">
            오늘의 응원 문구
          </div>
          <div className="mt-2 text-base text-gray-800 text-center font-medium min-h-[32px]">
            {messages.cheer ||
              (cheerMutation.isPending
                ? '로딩 중...'
                : '문구를 불러올 수 없습니다.')}
          </div>
        </div>
        {/* Fortune Message */}
        <div className="relative bg-gradient-to-br from-sky-100 via-cyan-100 to-indigo-100 rounded-xl shadow-lg p-6 flex flex-col items-center min-h-[120px] border border-sky-200">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white shadow-md rounded-full p-2 border border-sky-200">
            <Sun className="w-7 h-7 text-sky-500" />
          </div>
          <div className="mt-6 text-lg font-bold text-sky-700 tracking-tight">
            오늘의 운세
          </div>
          <div className="mt-2 text-base text-gray-800 text-center font-medium min-h-[32px]">
            {messages.fortune ||
              (fortuneMutation.isPending
                ? '로딩 중...'
                : '운세를 불러올 수 없습니다.')}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroTodayMessageComponent;
