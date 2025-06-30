import { useState } from 'react';
import {
  DrawOrderParticipantType,
  DrawOrderItemType,
  DrawOrderStateType,
} from '@/types';

/**
 * 순서 뽑기 상태 및 로직 관리 커스텀 훅
 */
export const useDrawOrder = ({
  participants,
  items,
}: {
  participants: DrawOrderParticipantType[];
  items: DrawOrderItemType[];
}) => {
  const [state, setState] = useState<DrawOrderStateType>({
    participants,
    items,
    currentTurn: 0,
    isDrawing: false,
    currentItem: null,
  });

  /**
   * 현재 차례 참가자가 랜덤으로 아이템을 뽑는 함수
   */
  const draw = () => {
    if (state.isDrawing) return;
    setState((prev) => ({ ...prev, isDrawing: true, currentItem: null }));

    // 뽑기 애니메이션을 위한 지연 시간
    const animationDuration = 2000; // 2초 동안 애니메이션 진행
    const startTime = Date.now();

    // 랜덤 아이템 선택 애니메이션 효과
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      if (progress < 1) {
        // 아직 애니메이션 중인 경우
        const availableItems = state.items.filter((item) => !item.isDrawn);
        if (availableItems.length > 0) {
          const randomIdx = Math.floor(Math.random() * availableItems.length);
          const randomItem = availableItems[randomIdx];
          setState((prev) => ({
            ...prev,
            currentItem: randomItem,
          }));
        }
        requestAnimationFrame(animate);
      } else {
        // 애니메이션 종료 시 최종 아이템 선택
        const availableItems = state.items.filter((item) => !item.isDrawn);
        if (availableItems.length === 0) {
          setState((prev) => ({ ...prev, isDrawing: false }));
          return;
        }

        const randomIdx = Math.floor(Math.random() * availableItems.length);
        const selectedItem = availableItems[randomIdx];

        const updatedItems = state.items.map((item) =>
          item.id === selectedItem.id ? { ...item, isDrawn: true } : item
        );

        const updatedParticipants = state.participants.map((p, idx) =>
          idx === state.currentTurn
            ? { ...p, hasDrawn: true, drawnItem: selectedItem.label }
            : p
        );

        setState((prev) => ({
          ...prev,
          items: updatedItems,
          participants: updatedParticipants,
          currentItem: selectedItem,
          currentTurn:
            prev.currentTurn + 1 < prev.participants.length
              ? prev.currentTurn + 1
              : prev.currentTurn,
          isDrawing: false,
        }));
      }
    };

    requestAnimationFrame(animate);
  };

  return { state, draw };
};
