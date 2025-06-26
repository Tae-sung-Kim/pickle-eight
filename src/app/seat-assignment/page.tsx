'use client';

import { NameInputComponent, NameListComponent } from '@/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNameManager } from '@/hooks';
import { ChangeEvent, useState } from 'react';

export default function SeatAssignmentPage() {
  const { names, addName, removeName, reset } = useNameManager();
  const [nameInput, setNameInput] = useState('');
  const [seatCount, setSeatCount] = useState('');
  const [assignedSeats, setAssignedSeats] = useState<Record<number, string>>(
    {}
  );

  const handleAddName = () => {
    if (addName(nameInput)) {
      setNameInput('');
    }
  };

  const handleSeatCountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || (Number(value) >= 1 && Number(value) <= 100)) {
      setSeatCount(value);
    }
  };

  const handleRemoveName = (index: number) => {
    removeName(index);
  };

  const handleAssign = () => {
    const count = parseInt(seatCount, 10);

    if (!names.length || isNaN(count) || count <= 0) {
      alert('이름과 자리 수를 올바르게 입력해주세요.');
      return;
    }

    const shuffled = [...names].sort(() => Math.random() - 0.5);
    const result: Record<number, string> = {};

    shuffled.slice(0, count).forEach((name, index) => {
      result[index + 1] = name;
    });

    setAssignedSeats(result);
  };

  const handleReset = () => {
    setAssignedSeats({});
    reset();
    setNameInput('');
    setSeatCount('');
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">🎯 자리 배정기</h1>
      <div className="space-y-4">
        <div className="space-y-2">
          <NameInputComponent
            value={nameInput}
            onChange={setNameInput}
            onAdd={handleAddName}
            placeholder="이름 입력 후 엔터 또는 추가 버튼"
            buttonText="이름 추가"
          />

          {names.length > 0 && (
            <div className="mt-2">
              <NameListComponent
                list={names}
                title="자리 배정 대상자"
                onRemove={handleRemoveName}
              />
            </div>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            자리 수 (최대 100개)
          </label>
          <Input
            type="number"
            min="1"
            max="100"
            value={seatCount}
            onChange={handleSeatCountChange}
            className="w-full p-2 border rounded"
            placeholder="1~100 사이의 숫자 입력"
          />
          {seatCount && (Number(seatCount) < 1 || Number(seatCount) > 100) && (
            <p className="mt-1 text-sm text-red-500">
              1에서 100 사이의 숫자를 입력해주세요.
            </p>
          )}
        </div>

        <Button
          onClick={handleAssign}
          disabled={
            !names.length ||
            !seatCount ||
            Number(seatCount) < 1 ||
            Number(seatCount) > 100
          }
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          자리 배정하기
        </Button>
      </div>

      {Object.keys(assignedSeats).length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">배정 결과</h2>
            <Button onClick={handleReset} variant="outline">
              초기화
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(assignedSeats).map(([seat, name]) => (
              <div
                key={seat}
                className="p-3 border rounded-lg bg-white shadow-sm"
              >
                <div className="text-sm text-gray-500">자리 {seat}</div>
                <div className="font-medium">{name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
