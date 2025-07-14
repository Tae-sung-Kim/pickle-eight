'use client';

import { useEffect, useState } from 'react';
import { MessageStateType } from '@/types';
import { Sun, Smile } from 'lucide-react';
import { useGptTodayMessageQuery } from '@/queries';

const getTodayKey = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const today = `${yyyy}-${mm}-${dd}`;
  return `${process.env.NEXT_PUBLIC_SITE_NAME}-today-message:${today}`;
};

export function HeroTodayMessageComponent() {
  const [messages, setMessages] = useState<MessageStateType>({
    cheer: null,
    fortune: null,
  });

  const cheerMutation = useGptTodayMessageQuery();
  const fortuneMutation = useGptTodayMessageQuery();

  useEffect(() => {
    // hero-today-message 관련 만료된 localStorage 자동 삭제 및 메시지 관리
    const key = getTodayKey();
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(key);
    let cache: { cheer?: string; fortune?: string; expires?: string } = {};
    let needFetchCheer = false;
    let needFetchFortune = false;

    if (saved) {
      try {
        cache = JSON.parse(saved);
        if (cache.expires && new Date(cache.expires) < new Date()) {
          localStorage.removeItem(key);
          cache = {};
          needFetchCheer = true;
          needFetchFortune = true;
        }
      } catch {
        localStorage.removeItem(key);
        cache = {};
        needFetchCheer = true;
        needFetchFortune = true;
      }
    } else {
      needFetchCheer = true;
      needFetchFortune = true;
    }

    // 캐시가 남아있으면 메시지 세팅
    if (cache.cheer) setMessages((prev) => ({ ...prev, cheer: cache.cheer! }));
    if (cache.fortune)
      setMessages((prev) => ({ ...prev, fortune: cache.fortune! }));

    // 각각 필요한 것만 fetch
    const expires = new Date();
    expires.setHours(0, 0, 0, 0);
    expires.setDate(expires.getDate() + 1);
    const expiresStr = expires.toISOString();

    if (needFetchCheer) {
      cheerMutation.mutate(
        { type: 'cheer' },
        {
          onSuccess: (msg) => {
            setMessages((prev) => ({ ...prev, cheer: msg }));
            const newCache = {
              ...cache,
              cheer: msg,
              expires: expiresStr,
            };
            localStorage.setItem(key, JSON.stringify(newCache));
            cache = newCache;
          },
        }
      );
    }
    if (needFetchFortune) {
      fortuneMutation.mutate(
        { type: 'fortune' },
        {
          onSuccess: (msg) => {
            setMessages((prev) => ({ ...prev, fortune: msg }));
            const newCache = {
              ...cache,
              fortune: msg,
              expires: expiresStr,
            };
            localStorage.setItem(key, JSON.stringify(newCache));
            cache = newCache;
          },
        }
      );
    }
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
            오늘의 응원
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
