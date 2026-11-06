'use client';

import { type JSX, type Ref, useId } from 'react';
import { Button } from '@/components/ui/button';
import { FORTUNE_TIME_UNKNOWN_NOTICE } from '@/features/fortune/constants/fortune-notice.constant';
import { cn } from '@/lib/utils';

export type FortuneCandidateType<K extends string> = Readonly<{
  key: K;
  /** 버튼에 보이는 글자. 부모가 "{띠}로 보기", "{별자리}로 보기"로 만들어 넘긴다 */
  label: string;
}>;

export type FortuneCandidateChoiceComponentPropsType<K extends string> =
  Readonly<{
    /** 순서는 경계 전(before) → 경계 후(after). 두 후보는 같은 크기·모양이다 */
    candidates: readonly [FortuneCandidateType<K>, FortuneCandidateType<K>];
    /** 처음에는 null. 미리 선택하지 않고 추천·정답 표시도 하지 않는다 */
    selectedKey: K | null;
    onSelect: (key: K) => void;
    /** 이 화면이 나타날 때 부모가 첫 후보 버튼으로 포커스를 옮기는 데 쓴다 */
    firstButtonRef?: Ref<HTMLButtonElement>;
  }>;

/**
 * 후보 선택(시각을 모를 때 두 결과). 어느 쪽도 정답으로 표시하지 않는다.
 * 선택한 쪽은 aria-pressed와 굵기·테두리로 보이고, 눌러서 언제든 다른 쪽으로 바꾼다.
 */
export function FortuneCandidateChoiceComponent<K extends string>({
  candidates,
  selectedKey,
  onSelect,
  firstButtonRef,
}: FortuneCandidateChoiceComponentPropsType<K>): JSX.Element {
  const noticeId = useId();

  return (
    <fieldset aria-labelledby={noticeId} className="min-w-0 space-y-3">
      <p id={noticeId} className="text-sm leading-6 break-keep text-foreground">
        {FORTUNE_TIME_UNKNOWN_NOTICE}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
        {candidates.map((candidate, index) => {
          const isSelected = candidate.key === selectedKey;
          return (
            <Button
              key={candidate.key}
              ref={index === 0 ? firstButtonRef : undefined}
              type="button"
              variant="outline"
              aria-pressed={isSelected}
              onClick={() => onSelect(candidate.key)}
              className={cn(
                'h-11 flex-1 scroll-mb-48 rounded-lg border-border bg-background px-4 break-keep text-foreground transition-none hover:border-menu-fortune/60 hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
                isSelected &&
                  'border-menu-fortune bg-menu-fortune/10 font-semibold hover:border-menu-fortune hover:bg-menu-fortune/10'
              )}
            >
              {candidate.label}
            </Button>
          );
        })}
      </div>
    </fieldset>
  );
}
