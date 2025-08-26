'use client';

import { motion } from 'framer-motion';
import { useCapture, useNameManager } from '@/hooks';
import { ChangeEvent, useRef, useState } from 'react';
import { TitleWrapperComponent } from '@/components';
import { SeatAssignmentInputCardComponent } from './input-card.component';
import { SeatAssignmentResultViewComponent } from './result-view.component';

export function SeatAssignmentComponent() {
  const { names, addName, removeName, reset } = useNameManager();
  const [nameInput, setNameInput] = useState('');
  const [seatCount, setSeatCount] = useState('');
  const [assignedSeats, setAssignedSeats] = useState<Record<number, string>>(
    {}
  );

  const { onCapture } = useCapture();
  const resultRef = useRef<HTMLDivElement>(null);

  const [isAssigning, setIsAssigning] = useState(false);

  const handleShare = () => {
    onCapture(resultRef as React.RefObject<HTMLElement>, {
      fileName: 'result.png',
      shareTitle: '자리 배정 결과',
    });
  };

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
    <div className="container mx-auto h-fit p-4">
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="space-y-2 text-center"
        >
          <TitleWrapperComponent
            type="random"
            title="자리 배정기"
            description="참가자와 자리 수를 입력하면 랜덤으로 자리를 배정해드려요"
          />
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2" ref={resultRef}>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <SeatAssignmentInputCardComponent
              names={names}
              nameInput={nameInput}
              seatCount={seatCount}
              isAssigning={isAssigning}
              assignedSeatCount={assignedSeatCount}
              onChangeNameInput={setNameInput}
              onAddName={handleAddName}
              onRemoveName={handleRemoveName}
              onSeatCountChange={handleSeatCountChange}
              onAssign={handleAssign}
              onReset={handleReset}
              onShare={handleShare}
            />
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <SeatAssignmentResultViewComponent
              assignedSeats={assignedSeats}
              assignedSeatCount={assignedSeatCount}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default SeatAssignmentComponent;
