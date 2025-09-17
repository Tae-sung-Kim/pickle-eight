'use client';
import { NameInputComponent } from '@/components/shared/name/input.component';
import { NameListComponent } from '@/components/shared/name/list.component';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, RefreshCw, Share2, Users } from 'lucide-react';
import { ChangeEvent } from 'react';

export type SeatAssignmentInputCardType = {
  readonly names: readonly string[];
  readonly nameInput: string;
  readonly seatCount: string;
  readonly isAssigning: boolean;
  readonly assignedSeatCount: number;
  onChangeNameInput: (value: string) => void;
  onAddName: () => void;
  onRemoveName: (index: number) => void;
  onSeatCountChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onAssign: () => void;
  onReset: () => void;
  onShare: () => void;
};

export function SeatAssignmentInputCardComponent({
  names,
  nameInput,
  seatCount,
  isAssigning,
  assignedSeatCount,
  onChangeNameInput,
  onAddName,
  onRemoveName,
  onSeatCountChange,
  onAssign,
  onReset,
  onShare,
}: SeatAssignmentInputCardType) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-white/70 backdrop-blur p-6 shadow-sm ring-1 ring-black/5">
        <div className="space-y-4">
          <NameInputComponent
            value={nameInput}
            disabled={nameInput.length < 1}
            onChange={onChangeNameInput}
            onAdd={onAddName}
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
                  onClick={onReset}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  disabled={!assignedSeatCount}
                >
                  배정된 인원 제외
                </Button>
              </div>
              <NameListComponent
                list={names as string[]}
                onRemove={onRemoveName}
                className="max-h-60 overflow-y-auto rounded-xl border border-border bg-white"
              />
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white/70 backdrop-blur p-6 shadow-sm ring-1 ring-black/5">
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
                onChange={onSeatCountChange}
                className="flex-1"
                placeholder="1~100 사이의 숫자 입력"
              />
              <Button
                onClick={onAssign}
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
                <p className="mt-2 text-sm text-destructive">
                  1에서 100 사이의 숫자를 입력해주세요.
                </p>
              )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={onReset}
              variant="outline"
              className="w-full"
              disabled={!names.length && !assignedSeatCount}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              초기화
            </Button>
            <Button
              onClick={onShare}
              variant="outline"
              className="w-full"
              disabled={!assignedSeatCount}
            >
              <Share2 className="mr-2 h-4 w-4" />
              공유하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeatAssignmentInputCardComponent;
