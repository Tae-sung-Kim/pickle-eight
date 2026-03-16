import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export function useNameManager() {
  // 이름 관리 상태
  const [names, setNames] = useState<string[]>([]);
  const [duplicateName, setDuplicateName] = useState<string | null>(null);

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

  // 초기화
  const reset = useCallback(() => {
    setNames([]);
  }, []);

  useEffect(() => {
    if (duplicateName) {
      toast.error(`${duplicateName}은(는) 이미 추가된 이름입니다.`, {
        position: 'top-center',
      });

      setDuplicateName(null);
    }
  }, [duplicateName]);

  return {
    // 상태
    names,
    duplicateName,

    // 액션
    addName,
    removeName,
    reset,
    setDuplicateName,
  };
}
