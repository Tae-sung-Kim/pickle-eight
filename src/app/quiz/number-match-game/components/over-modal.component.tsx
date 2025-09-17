'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { NumberMatchGameOverModalType } from "@/types/number-match-game.type";
import { useEffect, useState } from 'react';

export function NumberMatchGameOverModalComponent({
  isOpen,
  moves,
}: NumberMatchGameOverModalType) {
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
          <Button onClick={handleClose}>닫기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default NumberMatchGameOverModalComponent;
