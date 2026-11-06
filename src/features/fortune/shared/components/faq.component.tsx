import type { JSX } from 'react';

import type { FortuneFaqItemType } from '@/features/fortune/types/fortune.type';

// 제목 라벨. 운세 상수 파일에는 아직 없어 이 파일에 둔다(타로 TAROT_FAQ_TITLE과 같은 값)
const FORTUNE_FAQ_TITLE = '자주 묻는 질문';

export type FortuneFaqComponentPropsType = {
  items: readonly FortuneFaqItemType[];
};

/**
 * FortuneFaqComponent
 * - 펼친 목록(h2 + h3 + p, 아코디언 아님). 모든 답이 서버 HTML에 보인다. 서버 컴포넌트.
 * - 화면과 FAQPage JSON-LD가 같은 items 배열을 쓴다(AC-64).
 */
export function FortuneFaqComponent({
  items,
}: FortuneFaqComponentPropsType): JSX.Element | null {
  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl leading-tight font-semibold break-keep text-foreground sm:text-2xl">
        {FORTUNE_FAQ_TITLE}
      </h2>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.question} className="space-y-1">
            <h3 className="text-lg leading-snug font-semibold break-keep text-foreground">
              {item.question}
            </h3>
            <p className="max-w-[68ch] text-sm leading-7 text-foreground sm:text-base">
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
