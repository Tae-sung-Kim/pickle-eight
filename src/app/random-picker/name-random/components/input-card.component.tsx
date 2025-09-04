import { Button } from '@/components/ui/button';
import { NameInputComponent, NameListComponent } from '@/components';
import { Users, Sparkles } from 'lucide-react';

export type InputCardProps = {
  readonly names: readonly string[];
  readonly inputValue: string;
  readonly isPicking: boolean;
  onChangeInput: (value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onReset: () => void;
  onPick: () => void;
};

export function NameRandomInputCardComponent({
  names,
  inputValue,
  isPicking,
  onChangeInput,
  onAdd,
  onRemove,
  onReset,
  onPick,
}: InputCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-white/70 backdrop-blur p-6 shadow-sm ring-1 ring-black/5">
      <NameInputComponent
        value={inputValue}
        disabled={inputValue.length < 1}
        onChange={onChangeInput}
        onAdd={onAdd}
        isIcon={true}
        placeholder="추첨할 항목 입력 후 엔터 또는 추가 버튼"
      />

      {names.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">참가자 목록 ({names.length}명)</h3>
            </div>
            <Button
              onClick={onReset}
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              모두 지우기
            </Button>
          </div>

          <NameListComponent
            list={names as string[]}
            onRemove={onRemove}
            className="max-h-60 overflow-y-auto rounded-xl border border-border bg-white"
          />

          <Button
            onClick={onPick}
            disabled={isPicking || names.length === 0}
            size="lg"
            className="w-full mt-4"
          >
            {isPicking ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                추첨 중...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                추첨하기
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default NameRandomInputCardComponent;
