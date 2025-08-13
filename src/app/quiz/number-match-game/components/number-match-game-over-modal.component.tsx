'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface GameOverModalProps {
  isOpen: boolean;
  onRestart: () => void;
  moves: number;
}

export function NumberMatchGameOverModalComponent({
  isOpen,
  onRestart,
  moves,
}: GameOverModalProps) {
  const [open, setOpen] = useState(isOpen);

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>🎉 축하합니다! 🎉</DialogTitle>
          <DialogDescription>
            모든 카드를 맞췄습니다! 총 {moves}번 만에 성공하셨네요.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onRestart}>다시하기</Button>
          <Button onClick={handleClose}>닫기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default NumberMatchGameOverModalComponent;
