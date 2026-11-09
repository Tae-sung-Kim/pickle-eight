import { type JSX, useId } from 'react';

import {
  TAROT_TOPIC_GROUP_LABEL,
  TAROT_TOPIC_NOTICE,
  TAROT_TOPICS,
} from '@/features/tarot/constants/tarot-topic.constant';
import type { TarotTopicSelectionType } from '@/features/tarot/types/tarot.type';
import { cn } from '@/lib/utils';

export type TarotTopicChipsComponentPropsType = {
  /** 선택한 분야. 항상 하나가 선택되어 있다(기본 'all') */
  selectedKey: TarotTopicSelectionType;
  /** 칩 클릭. 같은 칩을 다시 눌러도 호출된다. 입력칸은 건드리지 않는다 */
  onSelect: (key: TarotTopicSelectionType) => void;
};

/**
 * TarotTopicChipsComponent (1장·3장 공용)
 * - 분야 칩 5개(단일 선택). 질문 state를 모른다.
 */
export function TarotTopicChipsComponent({
  selectedKey,
  onSelect,
}: TarotTopicChipsComponentPropsType): JSX.Element {
  const labelId = useId();

  return (
    <div className="space-y-2">
      <p id={labelId} className="text-sm font-medium">
        {TAROT_TOPIC_GROUP_LABEL}
      </p>
      <fieldset
        aria-labelledby={labelId}
        className="m-0 flex min-w-0 flex-wrap gap-2 border-0 p-0"
      >
        {TAROT_TOPICS.map((topic) => {
          const isSelected = topic.key === selectedKey;
          return (
            <button
              key={topic.key}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(topic.key)}
              className={cn(
                'min-h-11 cursor-pointer rounded-md border px-3 text-sm font-medium break-keep focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none sm:min-h-9',
                isSelected
                  ? 'border-menu-tarot bg-menu-tarot/10 text-menu-tarot'
                  : 'border-border bg-card text-foreground hover:bg-muted'
              )}
            >
              {topic.label}
            </button>
          );
        })}
      </fieldset>
      <p className="max-w-[68ch] text-xs leading-5 text-muted-foreground">
        {TAROT_TOPIC_NOTICE}
      </p>
    </div>
  );
}
