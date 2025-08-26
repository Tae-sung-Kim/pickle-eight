'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { MessageStateType } from '@/types';
import { useGptTodayMessageQuery } from '@/queries';
import {
  getTodayString,
  getTimeSlot,
  getKoreaTime,
  getCachedData,
  setCachedData,
} from '@/utils';
import { buildHeroCards } from './hero-cards.builder';
import MessageCardComponent from './message-card.component';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'pickle-eight';

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

    const now = getKoreaTime();
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

  const getMessage = useCallback(
    (message: string | null): string => {
      if (message) return message;
      return isPending ? '로딩 중...' : '메시지를 불러올 수 없습니다.';
    },
    [isPending]
  );

  const safeMessages = useMemo(
    () => ({
      cheer: getMessage(messages.cheer),
      fortune: getMessage(messages.fortune),
      todo: getMessage(messages.todo),
      menu: getMessage(messages.menu),
    }),
    [messages, getMessage]
  );

  const cards = useMemo(
    () =>
      buildHeroCards({ messages: safeMessages, mealType, siteName: SITE_NAME }),
    [safeMessages, mealType]
  );

  return (
    <section className="w-full max-w-5xl mx-auto mt-12 mb-10 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {cards.map(({ key, props }) => (
          <MessageCardComponent key={key} {...props} />
        ))}
      </div>
    </section>
  );
}

export default HeroTodayMessageComponent;
