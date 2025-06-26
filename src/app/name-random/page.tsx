'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useNameRandom } from '@/hooks';
import { NameInputComponent, NameListComponent } from '@/components';

export default function NameRandomPage() {
  const {
    names,
    winner,
    duplicateName,
    addName,
    removeName,
    pickRandom,
    reset,
    setDuplicateName,
  } = useNameRandom();
  const [inputValue, setInputValue] = useState('');

  const handleAddName = () => {
    if (addName(inputValue)) {
      setInputValue('');
    }
  };

  const handlePickRandom = () => {
    pickRandom();
    setInputValue('');
  };

  const handleReset = () => {
    reset();
    setInputValue('');
  };

  useEffect(() => {
    if (duplicateName) {
      toast.error(`${duplicateName}은(는) 이미 추가된 이름입니다.`, {
        position: 'top-center',
      });
      setDuplicateName(null);
    }
  }, [duplicateName, setDuplicateName]);

  if (winner) {
    return (
      <div className="container mx-auto p-4 max-w-md text-center space-y-4">
        <div className="text-xl">
          당첨자:{' '}
          <span className="font-bold text-2xl text-blue-600">{winner}</span>님
          축하합니다! 🎉
        </div>
        <Button onClick={handleReset} className="w-full">
          다시 시작하기
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-md space-y-4">
      <h1 className="text-2xl font-bold mb-6">이름 추첨기</h1>

      <NameInputComponent
        value={inputValue}
        onChange={setInputValue}
        onAdd={handleAddName}
      />

      {names.length > 0 && (
        <>
          <NameListComponent list={names} onRemove={removeName} />
          <div className="flex gap-2">
            <Button onClick={handlePickRandom} className="flex-1">
              추첨하기
            </Button>
            <Button onClick={handleReset} variant="outline">
              초기화
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
