import type { ChangeEvent, CompositionEvent } from 'react';
import { useState } from 'react';

import type { MealAreaInputResultType } from '@/features/meal/types/meal.type';
import { parseMealAreaInput } from '@/features/meal/utils/meal-area.util';

/**
 * 동네 이름 입력 상태.
 * - inputValue: 입력란 표시값(조합 중 글자 포함)
 * - committedValue: 검사·미리보기·링크용. 한글 조합 중에는 바꾸지 않는다.
 * - 저장소, 서버 전송, URL 반영 없음. 새로고침하면 사라진다.
 */
export function useMealAreaInput(): Readonly<{
  inputValue: string;
  area: MealAreaInputResultType;
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleCompositionEnd: (event: CompositionEvent<HTMLInputElement>) => void;
  handleBlur: () => void;
  clear: () => void;
}> {
  const [inputValue, setInputValue] = useState('');
  const [committedValue, setCommittedValue] = useState('');

  const area = parseMealAreaInput(committedValue);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    setInputValue(next);
    // React ChangeEvent의 nativeEvent는 Event 타입이라 InputEvent로 좁힌다
    if (!(event.nativeEvent as InputEvent).isComposing) {
      setCommittedValue(next);
    }
  }

  // compositionend와 마지막 input 이벤트의 순서가 브라우저마다 달라 둘 다 처리한다
  function handleCompositionEnd(event: CompositionEvent<HTMLInputElement>) {
    const next = event.currentTarget.value;
    setInputValue(next);
    setCommittedValue(next);
  }

  // compositionend가 오지 않는 입력기나 조합 중 링크 클릭 대비: blur 때 현재 입력값을 확정한다
  function handleBlur() {
    setCommittedValue(inputValue);
  }

  function clear() {
    setInputValue('');
    setCommittedValue('');
  }

  return {
    inputValue,
    area,
    handleChange,
    handleCompositionEnd,
    handleBlur,
    clear,
  };
}
