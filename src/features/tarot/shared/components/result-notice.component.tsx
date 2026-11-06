import { Phone } from 'lucide-react';
import { type JSX, useId } from 'react';

import { CrisisPhoneComponent } from '@/components/common/crisis-phone.component';
import {
  CRISIS_PHONES,
  CRISIS_RESULT_LINE,
} from '@/constants/crisis-phone.constant';
import { TAROT_RESULT_DISCLAIMER_TEXT } from '@/features/tarot/constants/tarot-notice.constant';

/**
 * TarotResultNoticeComponent
 * - 결과 하단 면책 + 상담전화 5개. 뽑기 전에도 항상 렌더링한다. 서버 컴포넌트.
 * - 터치 상태는 tel: 링크, PC 상태((hover: hover) and (pointer: fine))는 링크 없는 글자.
 *   두 쪽 높이가 같게(min-h-11 py-1) 둬서 상태가 바뀌어도 위치가 흔들리지 않는다.
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
          {/* 장식 아이콘: 터치 상태에서만 보인다 */}
          <Phone
            size={16}
            aria-hidden="true"
            className="mt-1 shrink-0 text-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hidden"
          />
          <span>{CRISIS_RESULT_LINE}</span>
        </p>
        <ul
          aria-labelledby={lineId}
          className="flex flex-col gap-1 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-1"
        >
          {CRISIS_PHONES.map((phone, index) => {
            const isMain = index === 0;
            const weightClass = isMain ? 'font-semibold' : 'font-normal';
            return (
              <li key={phone.id} className={isMain ? 'sm:col-span-2' : ''}>
                <CrisisPhoneComponent
                  phone={phone}
                  linkClassName="group flex min-h-11 flex-col justify-center rounded-sm py-1 break-keep focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
                  textClassName="break-keep"
                  linkContent={
                    <>
                      <span
                        className={`block text-primary underline underline-offset-4 group-active:decoration-2 ${weightClass}`}
                      >
                        {phone.name}{' '}
                        <span className="whitespace-nowrap tabular-nums">
                          {phone.displayNumber}
                        </span>
                      </span>
                      <span className="block text-muted-foreground">
                        {phone.description}
                      </span>
                    </>
                  }
                  textContent={
                    // 공용 컴포넌트가 보일 때 block으로 두므로 세로 가운데 정렬은 안쪽 flex에서 한다
                    <span className="flex min-h-11 flex-col justify-center py-1">
                      <span className={`block text-foreground ${weightClass}`}>
                        {phone.name}{' '}
                        <span className="whitespace-nowrap tabular-nums select-all">
                          {phone.displayNumber}
                        </span>
                      </span>
                      <span className="block text-muted-foreground">
                        {phone.description}
                      </span>
                    </span>
                  }
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
