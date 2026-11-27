import type { JSX } from 'react';

import { CollapsibleComponent } from '@/components/common/collapsible.component';

const FAQ_TITLE = '자주 묻는 질문';

export type FaqPropsType = Readonly<{
  items: readonly Readonly<{ question: string; answer: string }>[];
  /** 답 글자를 흐린 색·작은 크기로 둔다(운빨 뽑기 FAQ의 기존 모양). */
  muted?: boolean;
}>;

/**
 * FaqComponent
 * - 질문은 보이고 답만 접힌다(h2 + h3 summary + p). 답은 서버 HTML에 있다. 서버 컴포넌트.
 * - 화면과 FAQPage JSON-LD가 같은 items 배열을 쓴다.
 */
export function FaqComponent({
  items,
  muted = false,
}: FaqPropsType): JSX.Element | null {
  if (items.length === 0) return null;

  return (
    <section className="space-y-2">
      <h2 className="text-xl leading-tight font-semibold break-keep text-foreground sm:text-2xl">
        {FAQ_TITLE}
      </h2>
      <div className="border-t border-border">
        {items.map((item) => (
          <CollapsibleComponent key={item.question} heading={item.question}>
            <p
              className={
                muted
                  ? 'max-w-[68ch] text-sm leading-7 break-keep text-muted-foreground'
                  : 'max-w-[68ch] text-sm leading-7 break-keep text-foreground sm:text-base'
              }
            >
              {item.answer}
            </p>
          </CollapsibleComponent>
        ))}
      </div>
    </section>
  );
}
