import { type JSX, useId } from 'react';

import {
  TAROT_QUESTION_TOPICS,
  TAROT_TOPIC_GROUP_LABEL,
  TAROT_TOPIC_NOTICE,
} from '@/features/tarot/constants/tarot-question.constant';
import type { TarotQuestionTopicKeyType } from '@/features/tarot/types/tarot.type';
import { cn } from '@/lib/utils';

export type TarotThreeCardTopicChipsComponentPropsType = {
  /** 선택한 분야. 처음엔 null */
  selectedKey: TarotQuestionTopicKeyType | null;
  /** 칩 클릭. 예시 채우기·순번 계산은 부모가 한다 */
  onSelect: (key: TarotQuestionTopicKeyType) => void;
};

/**
 * TarotThreeCardTopicChipsComponent
 * - 분야 칩(단일 선택). 질문 예시를 채우는 용도일 뿐 해석에는 영향이 없다(AC-11).
 * - idle일 때만 부모가 렌더링한다.
 */
export function TarotThreeCardTopicChipsComponent({
  selectedKey,
  onSelect,
}: TarotThreeCardTopicChipsComponentPropsType): JSX.Element {
  const labelId = useId();

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span id={labelId} className="mr-1 text-sm font-medium">
          {TAROT_TOPIC_GROUP_LABEL}
        </span>
        <fieldset
          aria-labelledby={labelId}
          className="m-0 flex min-w-0 flex-wrap gap-2 border-0 p-0"
        >
          {TAROT_QUESTION_TOPICS.map((topic) => {
            const isSelected = topic.key === selectedKey;
            return (
              <button
                key={topic.key}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelect(topic.key)}
                className={cn(
                  'cursor-pointer rounded-md border px-3 py-1.5 text-sm break-keep focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
                  isSelected
                    ? 'border-menu-tarot/40 bg-menu-tarot/10 text-menu-tarot'
                    : 'border-border bg-card text-foreground hover:bg-muted'
                )}
              >
                {topic.label}
              </button>
            );
          })}
        </fieldset>
      </div>
      <p className="max-w-[68ch] text-xs leading-5 text-muted-foreground">
        {TAROT_TOPIC_NOTICE}
      </p>
    </div>
  );
}
