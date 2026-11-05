import { Phone } from 'lucide-react';
import { type JSX, useId } from 'react';

import {
  TAROT_CRISIS_PHONES,
  TAROT_CRISIS_RESULT_LINE,
  TAROT_RESULT_DISCLAIMER_TEXT,
} from '@/features/tarot/constants/tarot-notice.constant';

/**
 * TarotResultNoticeComponent
 * - 결과 하단 면책 + 상담전화 5개. 뽑기 전에도 항상 렌더링한다. 서버 컴포넌트.
 */
export function TarotResultNoticeComponent(): JSX.Element {
  const lineId = useId();

  return (
    <section className="space-y-3 rounded-panel border border-border bg-background p-4 text-sm leading-6 sm:p-5">
      <p className="text-muted-foreground break-keep">
        {TAROT_RESULT_DISCLAIMER_TEXT}
      </p>
      <div className="space-y-2 border-t border-border pt-3">
        <p
          id={lineId}
          className="flex items-start gap-2 text-foreground break-keep"
        >
          <Phone
            size={16}
            aria-hidden="true"
            className="mt-1 shrink-0 text-muted-foreground"
          />
          <span>{TAROT_CRISIS_RESULT_LINE}</span>
        </p>
        <ul
          aria-labelledby={lineId}
          className="flex flex-col gap-1 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-1"
        >
          {TAROT_CRISIS_PHONES.map((phone, index) => {
            const isMain = index === 0;
            return (
              <li key={phone.id} className={isMain ? 'sm:col-span-2' : ''}>
                <a
                  href={phone.href}
                  className="group flex min-h-11 flex-col justify-center rounded-sm py-1 break-keep focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
                >
                  <span
                    className={`text-primary underline underline-offset-4 group-hover:decoration-2 ${isMain ? 'font-semibold' : 'font-normal'}`}
                  >
                    {phone.name}{' '}
                    <span className="whitespace-nowrap">
                      {phone.displayNumber}
                    </span>
                  </span>
                  <span className="block text-muted-foreground">
                    {phone.description}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
