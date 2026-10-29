'use client';

import { Bookmark } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  useMyNumberSetsQuery,
  useSaveNumberSetMutation,
} from '@/features/lotto/queries/use-lotto-user.query';
import type { LottoNumberSetType } from '@/features/lotto/types/lotto.type';

type LottoSaveNumbersButtonProps = {
  readonly numbersList: ReadonlyArray<readonly number[]>;
  readonly className?: string;
};

const toKey = (numbers: readonly number[]): string =>
  [...numbers].sort((a, b) => a - b).join('-');

export function LottoSaveNumbersButtonComponent({
  numbersList,
  className,
}: LottoSaveNumbersButtonProps) {
  const router = useRouter();
  const { data: saved = [] } = useMyNumberSetsQuery();
  const saveMut = useSaveNumberSetMutation();

  const handleSave = async () => {
    const savedKeys = new Set(saved.map((s) => toKey(s.numbers)));
    const targets = numbersList.filter((n, i, arr) => {
      const key = toKey(n);
      return (
        !savedKeys.has(key) && arr.findIndex((m) => toKey(m) === key) === i
      );
    });

    if (targets.length === 0) {
      toast.info('이미 모두 저장된 번호입니다.');
      return;
    }

    try {
      for (const numbers of targets) {
        await saveMut.mutateAsync({
          numbers: numbers as unknown as LottoNumberSetType['numbers'],
        });
      }
      toast.success(`${targets.length}게임을 저장했습니다.`, {
        action: {
          label: '보러가기',
          onClick: () => router.push('/lotto/my-numbers'),
        },
      });
    } catch {
      toast.error('번호를 저장하지 못했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={className}
      disabled={numbersList.length === 0 || saveMut.isPending}
      onClick={handleSave}
    >
      <Bookmark className="h-4 w-4" />
      전체 저장
    </Button>
  );
}
