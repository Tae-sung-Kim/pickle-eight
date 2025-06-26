import { useState } from 'react';
import { NameInputComponent, NameListComponent } from '@/components';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LadderInputComponentPropsType } from '@/types';
import { useNameManager } from '@/hooks';

export function LadderInputComponent({
  onCreateLadder,
}: LadderInputComponentPropsType) {
  const { names, addName, removeName } = useNameManager();
  const [nameInput, setNameInput] = useState('');

  const [prizes, setPrizes] = useState<string[]>([]);
  const [prizeInput, setPrizeInput] = useState('');
  const [error, setError] = useState('');

  const handleAddName = () => {
    if (addName(nameInput.trim())) {
      setNameInput('');
    }
  };
  const handleRemoveName = (idx: number) => {
    removeName(idx);
  };

  // 상품 / 결과 추가
  const handleAddPrize = () => {
    const trimmedPrize = prizeInput.trim();

    if (!trimmedPrize) {
      return;
    }

    if (!prizes.includes(trimmedPrize)) {
      setPrizes([...prizes, trimmedPrize]);
      setPrizeInput('');
    } else {
      toast.error(`${trimmedPrize}은(는) 이미 추가된 상품(결과)입니다.`, {
        position: 'top-center',
      });
    }
  };

  const handleRemovePrize = (idx: number) => {
    setPrizes(prizes.filter((_, i) => i !== idx));
  };

  const handleCreateLadder = () => {
    if (names.length < 2 || prizes.length < 2) {
      setError('이름과 상품을 2개 이상 입력하세요.');
      return;
    }
    if (names.length !== prizes.length) {
      setError('이름과 상품 수가 같아야 합니다.');
      return;
    }
    setError('');
    onCreateLadder({ names, prizes });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        사다리 게임 만들기
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* 참가자 이름 섹션 */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            참가자 이름
          </label>
          <NameInputComponent
            value={nameInput}
            onChange={setNameInput}
            onAdd={handleAddName}
            placeholder="이름 입력 후 Enter 또는 추가 버튼"
            buttonText="추가"
          />
          <div className="border rounded-lg p-3 bg-gray-50 min-h-[200px]">
            <NameListComponent
              list={names}
              onRemove={handleRemoveName}
              title="참가자 목록"
              unitTitle="명"
            />
          </div>
        </div>

        {/* 상품 섹션 */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            상품/결과
          </label>
          <NameInputComponent
            value={prizeInput}
            onChange={setPrizeInput}
            onAdd={handleAddPrize}
            placeholder="상품 입력 후 Enter 또는 추가 버튼"
            buttonText="추가"
          />
          <div className="border rounded-lg p-3 bg-gray-50 min-h-[200px]">
            <NameListComponent
              list={prizes}
              onRemove={handleRemovePrize}
              title="상품 목록"
              unitTitle="개"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col items-center space-y-3 pt-4 border-t">
        <Button
          onClick={handleCreateLadder}
          className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          disabled={names.length === 0 || prizes.length === 0}
        >
          사다리 생성하기
        </Button>
        <p className="text-xs text-gray-500 text-center">
          {names.length}명의 참가자와 {prizes.length}개의 상품이 등록되었습니다.
        </p>
      </div>
    </div>
  );
}

export default LadderInputComponent;
