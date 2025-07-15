'use client';

import { useEffect, useState } from 'react';
import { MessageStateType } from '@/types';
import { Sun, Smile } from 'lucide-react';
import { useGptTodayMessageQuery } from '@/queries';
import { getTodayString } from '@/utils/common';

const STORAGE_KEY = `${
  process.env.NEXT_PUBLIC_SITE_NAME
}_today_message:${getTodayString()}`;

export function HeroTodayMessageComponent() {
  const [messages, setMessages] = useState<MessageStateType>({
    cheer: null,
    fortune: null,
  });
  const cheerMutation = useGptTodayMessageQuery();
  const fortuneMutation = useGptTodayMessageQuery();

  const todayKey = STORAGE_KEY;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Clear old cache entries
    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith(`${process.env.NEXT_PUBLIC_SITE_NAME}_today_message:`) &&
        key !== todayKey
      ) {
        localStorage.removeItem(key);
      }
    });

    // Check for valid cache for the current day
    const saved = localStorage.getItem(todayKey);
    if (saved) {
      try {
        const cache = JSON.parse(saved);
        if (cache.expires && new Date(cache.expires) > new Date()) {
          setMessages({ cheer: cache.cheer, fortune: cache.fortune });
          return; // Valid cache found, no need to fetch
        }
      } catch {
        localStorage.removeItem(todayKey); // Remove corrupted cache
      }
    }

    // Fetch new messages if no valid cache is found
    const fetchAndCacheMessages = async () => {
      try {
        const cheerMsg = await cheerMutation.mutateAsync({ type: 'cheer' });
        const fortuneMsg = await fortuneMutation.mutateAsync({
          type: 'fortune',
        });

        setMessages({ cheer: cheerMsg, fortune: fortuneMsg });

        // Set expiration to the next day at midnight
        const expires = new Date();
        expires.setDate(expires.getDate() + 1);
        expires.setHours(0, 0, 0, 0);

        const newCache = {
          cheer: cheerMsg,
          fortune: fortuneMsg,
          expires: expires.toISOString(),
        };
        localStorage.setItem(todayKey, JSON.stringify(newCache));
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };

    fetchAndCacheMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayKey]);

  const getCheerMessage = () => {
    if (messages.cheer) return messages.cheer;
    if (cheerMutation.isPending) return '로딩 중...';
    return '응원 메시지를 불러올 수 없습니다.';
  };

  const getFortuneMessage = () => {
    if (messages.fortune) return messages.fortune;
    if (fortuneMutation.isPending) return '로딩 중...';
    return '오늘의 행운을 불러올 수 없습니다.';
  };

  return (
    <section className="w-full max-w-3xl mx-auto mt-8 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cheer Message */}
        <div className="relative bg-gradient-to-br from-lime-100 via-emerald-100 to-yellow-100 rounded-xl shadow-lg p-6 flex flex-col items-center min-h-[120px] border border-lime-200">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white shadow-md rounded-full p-2 border border-lime-200">
            <Smile className="w-7 h-7 text-lime-500" />
          </div>
          <div className="mt-6 text-lg font-bold text-emerald-700 tracking-tight">
            오늘의 응원
          </div>
          <div className="mt-2 text-base text-gray-800 text-center font-medium min-h-[32px]">
            {getCheerMessage()}
          </div>
        </div>

        {/* Fortune Message */}
        <div className="relative bg-gradient-to-br from-sky-100 via-cyan-100 to-indigo-100 rounded-xl shadow-lg p-6 flex flex-col items-center min-h-[120px] border border-sky-200">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white shadow-md rounded-full p-2 border border-sky-200">
            <Sun className="w-7 h-7 text-sky-500" />
          </div>
          <div className="mt-6 text-lg font-bold text-cyan-700 tracking-tight">
            오늘의 행운
          </div>
          <div className="mt-2 text-base text-gray-800 text-center font-medium min-h-[32px]">
            {getFortuneMessage()}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroTodayMessageComponent;
