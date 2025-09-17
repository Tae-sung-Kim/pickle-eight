'use client';

import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

export type SeatAssignmentResultViewType = {
  readonly assignedSeats: Record<number, string>;
  readonly assignedSeatCount: number;
};

export function SeatAssignmentResultViewComponent({
  assignedSeats,
  assignedSeatCount,
}: SeatAssignmentResultViewType) {
  return (
    <div className="rounded-2xl border border-border bg-white/70 backdrop-blur p-6 shadow-sm ring-1 ring-black/5">
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
                'rounded-xl border border-border bg-white p-4 text-center shadow-sm'
              )}
            >
              <div className="text-sm font-medium text-foreground">{name}</div>
              <div className="mt-1 text-xs text-muted-foreground">
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
  );
}

export default SeatAssignmentResultViewComponent;
