'use client';

import { useEffect, useState } from 'react';
import { MessageStateType } from '@/types';
import { Smile, Sparkles, ListChecks, UtensilsCrossed } from 'lucide-react';
import { useGptTodayMessageQuery } from '@/queries';
import { getTodayString, getTimeSlot } from '@/utils';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'pickle-eight';

/**
 * 캐시에서 데이터를 안전하게 읽어옵니다.
 * @param {string} key - localStorage에서 사용할 키.
 * @returns {string | null} 유효한 캐시 데이터 또는 null.
 */
const getCachedData = (key: string): string | null => {
  const saved = localStorage.getItem(key);
  if (!saved) return null;

  try {
    const cache = JSON.parse(saved);
    if (cache.expires && new Date(cache.expires) > new Date()) {
      return cache.data;
    }
    localStorage.removeItem(key);
    return null;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

/**
 * 데이터를 캐시에 저장합니다.
 * @param {string} key - localStorage에서 사용할 키.
 * @param {string} data - 저장할 데이터.
 */
const setCachedData = (key: string, data: string): void => {
  const expires = new Date();
  expires.setDate(expires.getDate() + 1);
  expires.setHours(0, 0, 0, 0); // 다음 날 자정 만료

  const newCache = {
    data,
    expires: expires.toISOString(),
  };
  localStorage.setItem(key, JSON.stringify(newCache));
};

export function HeroTodayMessageComponent() {
  const [messages, setMessages] = useState<MessageStateType>({
    cheer: null,
    fortune: null,
    todo: null,
    menu: null,
  });
  const [mealType, setMealType] = useState<string>('지금');
  const { mutateAsync, isPending } = useGptTodayMessageQuery();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 지난 날짜의 캐시를 모두 삭제
    const todayStr = getTodayString();
    const prefix = `${SITE_NAME}_today_message:`;
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(prefix) && !key.startsWith(`${prefix}${todayStr}`)) {
        localStorage.removeItem(key);
      }
    });

    const now = new Date();
    const dateStr = getTodayString();
    const slot = getTimeSlot(now.getHours());

    const mealTypeMap: { [key: string]: string } = {
      morning: '아침',
      lunch: '점심',
      dinner: '저녁',
      snack: '간식',
    };

    setMealType(mealTypeMap[slot]);

    // 각 메시지 유형에 대한 고유 키 생성
    const baseKey = `${SITE_NAME}_today_message:${dateStr}`;
    const fortuneKey = `${baseKey}:fortune`;
    const cheerKey = `${baseKey}:cheer`;
    const menuKey = `${baseKey}:menu:${slot}`;
    const todoKey = `${baseKey}:todo:${slot}`;

    const loadMessages = async () => {
      // 1. 캐시에서 데이터 불러오기
      const cachedFortune = getCachedData(fortuneKey);
      const cachedCheer = getCachedData(cheerKey);
      const cachedMenu = getCachedData(menuKey);
      const cachedTodo = getCachedData(todoKey);

      const initialMessages = {
        fortune: cachedFortune,
        cheer: cachedCheer,
        menu: cachedMenu,
        todo: cachedTodo,
      };

      setMessages(initialMessages);

      // 2. 캐시가 하나라도 부족하면 API 호출
      if (!cachedFortune || !cachedCheer || !cachedMenu || !cachedTodo) {
        try {
          const apiResponse = await mutateAsync();
          const newMessages = { ...initialMessages };

          // 3. API 응답으로 캐시 및 상태 업데이트
          if (!cachedFortune) {
            setCachedData(fortuneKey, apiResponse.fortune);
            newMessages.fortune = apiResponse.fortune;
          }
          if (!cachedCheer) {
            setCachedData(cheerKey, apiResponse.cheer);
            newMessages.cheer = apiResponse.cheer;
          }
          if (!cachedMenu) {
            setCachedData(menuKey, apiResponse.menu);
            newMessages.menu = apiResponse.menu;
          }
          if (!cachedTodo) {
            setCachedData(todoKey, apiResponse.todo);
            newMessages.todo = apiResponse.todo;
          }

          setMessages(newMessages);
        } catch (error) {
          console.error('메시지 로딩 실패:', error);
        }
      }
    };

    loadMessages();
  }, [mutateAsync]);

  const getMessage = (message: string | null): string => {
    if (message) return message;
    return isPending ? '로딩 중...' : '메시지를 불러올 수 없습니다.';
  };

  return (
    <section className="w-full max-w-5xl mx-auto mt-12 mb-10 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Cheer Message */}
        <div className="relative bg-gradient-to-br from-green-50 to-cyan-50 rounded-2xl shadow-lg p-6 flex flex-col min-h-[160px] border border-green-100 transition-transform duration-300 hover:scale-105">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white shadow-md rounded-full p-3 border border-green-200">
            <Smile className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="mt-6 text-lg font-bold text-green-700 text-center tracking-tight">
            오늘의 응원
          </h3>
          <p className="mt-3 text-sm text-gray-600 text-center font-medium flex-grow whitespace-pre-line">
            {getMessage(messages.cheer)}
          </p>
        </div>

        {/* Fortune Message */}
        <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 flex flex-col min-h-[160px] border border-blue-100 transition-transform duration-300 hover:scale-105">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white shadow-md rounded-full p-3 border border-blue-200">
            <Sparkles className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="mt-6 text-lg font-bold text-blue-700 text-center tracking-tight">
            오늘의 행운
          </h3>
          <p className="mt-3 text-sm text-gray-600 text-center font-medium flex-grow whitespace-pre-line">
            {getMessage(messages.fortune)}
          </p>
        </div>

        {/* Todo Message */}
        <div className="relative bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-6 flex flex-col min-h-[160px] border border-yellow-100 transition-transform duration-300 hover:scale-105">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white shadow-md rounded-full p-3 border border-yellow-200">
            <ListChecks className="w-8 h-8 text-yellow-500" />
          </div>
          <h3 className="mt-6 text-lg font-bold text-yellow-700 text-center tracking-tight">
            {mealType} 할 일
          </h3>
          <p className="mt-3 text-sm text-gray-600 text-center font-medium flex-grow whitespace-pre-line">
            {getMessage(messages.todo)}
          </p>
        </div>

        {/* Menu Message */}
        <div className="relative bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl shadow-lg p-6 flex flex-col min-h-[160px] border border-red-100 transition-transform duration-300 hover:scale-105">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white shadow-md rounded-full p-3 border border-red-200">
            <UtensilsCrossed className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="mt-6 text-lg font-bold text-red-700 text-center tracking-tight">
            {mealType} 추천 메뉴
          </h3>
          <p className="mt-3 text-sm text-gray-600 text-center font-medium flex-grow whitespace-pre-line">
            {getMessage(messages.menu)}
          </p>
        </div>
      </div>
    </section>
  );
}

export default HeroTodayMessageComponent;
