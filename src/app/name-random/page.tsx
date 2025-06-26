'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNameManager } from '@/hooks';
import { NameInputComponent, NameListComponent } from '@/components';

export default function NameRandomPage() {
  const { names, addName, removeName, reset } = useNameManager();

  const [winner, setWinner] = useState('');
  const [inputValue, setInputValue] = useState('');

  const handleAddName = () => {
    if (addName(inputValue)) {
      setInputValue('');
    }
  };

  const handlePickRandom = () => {
    if (names.length === 0) return '';
    const randomIndex = Math.floor(Math.random() * names.length);
    const picked = names[randomIndex];
    setWinner(picked);
    setInputValue('');
    return picked;
  };

  const handleReset = () => {
    reset();
    setWinner('');
    setInputValue('');
  };

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
