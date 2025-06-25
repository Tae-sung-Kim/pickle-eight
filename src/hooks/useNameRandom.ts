import { useState, useCallback } from 'react';

export function useNameRandom() {
  // 이름 관리 상태
  const [names, setNames] = useState<string[]>([]);
  const [duplicateName, setDuplicateName] = useState<string | null>(null);
  const [winner, setWinner] = useState('');

  // 이름 추가
  const addName = useCallback(
    (name: string) => {
      if (!name.trim()) return false;

      if (names.some((n) => n === name.trim())) {
        setDuplicateName(name.trim());
        return false;
      }

      setNames((prev) => [...prev, name.trim()]);
      return true;
    },
    [names]
  );

  // 이름 삭제
  const removeName = useCallback((index: number) => {
    setNames((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // 랜덤 추첨
  const pickRandom = useCallback(() => {
    if (names.length === 0) return '';
    const randomIndex = Math.floor(Math.random() * names.length);
    const picked = names[randomIndex];
    setWinner(picked);
    return picked;
  }, [names]);

  // 초기화
  const reset = useCallback(() => {
    setNames([]);
    setWinner('');
  }, []);

  return {
    // 상태
    names,
    winner,
    duplicateName,

    // 액션
    addName,
    removeName,
    pickRandom,
    reset,
    setDuplicateName,
  };
}
