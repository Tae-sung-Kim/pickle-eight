'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NameInputComponent, NameListComponent } from '@/components';
import { useNameManager } from '@/hooks';
import { ChangeEvent, useState } from 'react';
import { Users, RefreshCw, ArrowRight } from 'lucide-react';
import { cn } from '@/lib';

export function SeatAssignmentComponent() {
  const { names, addName, removeName, reset } = useNameManager();
  const [nameInput, setNameInput] = useState('');
  const [seatCount, setSeatCount] = useState('');
  const [assignedSeats, setAssignedSeats] = useState<Record<number, string>>(
    {}
  );
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAddName: () => void = () => {
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

  const handleAssign = async () => {
    const count = parseInt(seatCount, 10);

    if (!names.length || isNaN(count) || count <= 0) {
      return;
    }

    setIsAssigning(true);

    // Add some suspense with a small delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const shuffled = [...names].sort(() => Math.random() - 0.5);
    const result: Record<number, string> = {};

    shuffled.slice(0, count).forEach((name, index) => {
      result[index + 1] = name;
    });

    setAssignedSeats(result);
    setIsAssigning(false);
  };

  const handleReset = () => {
    setAssignedSeats({});
    reset();
    setNameInput('');
    setSeatCount('');
  };

  const assignedSeatCount = Object.keys(assignedSeats).length;

  return (
    <div className="bg-sky-50 container mx-auto p-4">
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="space-y-2 text-center"
        >
          <h1 className="text-3xl font-bold tracking-tight text-sky-600">
            자리 배정기
          </h1>
          <p className="text-muted-foreground">
            참가자와 자리 수를 입력하면 랜덤으로 자리를 배정해드려요
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border bg-white p-6 shadow-sm border-sky-100">
              <div className="space-y-4">
                <NameInputComponent
                  value={nameInput}
                  disabled={nameInput.length < 1}
                  onChange={setNameInput}
                  onAdd={handleAddName}
                  isIcon={true}
                  placeholder="이름 입력 후 엔터 또는 추가 버튼"
                />

                {names.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-medium">
                          참가자 목록 ({names.length}명)
                        </h3>
                      </div>
                      <Button
                        onClick={() => {
                          reset();
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                        disabled={!assignedSeatCount}
                      >
                        배정된 인원 제외
                      </Button>
                    </div>
                    <NameListComponent
                      list={names}
                      onRemove={handleRemoveName}
                      className="max-h-60 overflow-y-auto"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm border-sky-100">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    자리 수 (최대 100개)
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={seatCount}
                      onChange={handleSeatCountChange}
                      className="flex-1"
                      placeholder="1~100 사이의 숫자 입력"
                    />
                    <Button
                      onClick={handleAssign}
                      disabled={
                        isAssigning ||
                        !names.length ||
                        !seatCount ||
                        Number(seatCount) < 1 ||
                        Number(seatCount) > 100
                      }
                    >
                      {isAssigning ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <ArrowRight className="mr-2 h-4 w-4" />
                          배정하기
                        </>
                      )}
                    </Button>
                  </div>
                  {seatCount &&
                    (Number(seatCount) < 1 || Number(seatCount) > 100) && (
                      <p className="mt-2 text-sm text-red-500">
                        1에서 100 사이의 숫자를 입력해주세요.
                      </p>
                    )}
                </div>

                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full"
                  disabled={!names.length && !assignedSeatCount}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  초기화
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border bg-white p-6 shadow-sm border-sky-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">자리 배정 결과</h3>
                {assignedSeatCount > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {assignedSeatCount}개 자리 배정 완료
                  </span>
                )}
              </div>

              {assignedSeatCount > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {Object.entries(assignedSeats).map(([seat, name]) => (
                    <motion.div
                      key={seat}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={cn(
                        'rounded-lg border p-4 text-center bg-sky-50 border-sky-100'
                      )}
                    >
                      <div className="text-sm font-medium text-sky-600">
                        {name}
                      </div>
                      <div className="mt-1 text-xs text-sky-500">
                        {seat}번 자리
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted text-muted-foreground">
                  <Users className="h-12 w-12 opacity-30" />
                  <p className="mt-2 text-sm">배정된 자리가 없습니다</p>
                  <p className="text-xs">좌측에서 자리 배정을 진행해주세요</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default SeatAssignmentComponent;
