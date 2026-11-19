import { Phone } from 'lucide-react';
import { type JSX, useId } from 'react';

import { CrisisPhoneComponent } from '@/components/common/crisis-phone.component';
import { CRISIS_PHONES } from '@/constants/crisis-phone.constant';
import {
  DREAM_CRISIS_INTRO_TEXT,
  DREAM_CRISIS_PHONES_TITLE,
} from '@/features/dream/constants/dream-notice.constant';

/**
 * DreamCrisisPhonesComponent
 * - 상담 안내 상자. 허브·상세 하단에 항상 둔다. 번호는 공용 CRISIS_PHONES(다섯 곳)에서만 읽는다.
 * - 터치는 tel: 링크, PC는 글자(공용 CrisisPhoneComponent). 서버 컴포넌트.
 */
export function DreamCrisisPhonesComponent(): JSX.Element {
  const lineId = useId();

  return (
    <section className="space-y-3 rounded-panel border border-border bg-background p-4 sm:p-5">
      <h2 className="text-lg leading-tight font-semibold break-keep text-foreground">
        {DREAM_CRISIS_PHONES_TITLE}
      </h2>
      <p
        id={lineId}
        className="flex items-start gap-2 text-sm leading-6 break-keep text-foreground"
      >
        {/* 장식 아이콘: 터치 상태에서만 보인다 */}
        <Phone
          size={16}
          aria-hidden="true"
          className="mt-1 shrink-0 text-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hidden"
        />
        <span>{DREAM_CRISIS_INTRO_TEXT}</span>
      </p>
      <ul
        aria-labelledby={lineId}
        className="flex flex-col gap-1 text-sm leading-6 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-1"
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
                      className={`block text-primary underline underline-offset-4 group-hover:decoration-2 ${weightClass}`}
                    >
                      {phone.name}{' '}
                      <span className="whitespace-nowrap tabular-nums">
                        {phone.displayNumber}
                      </span>
                    </span>
                    <span className="block text-sm leading-5 text-muted-foreground">
                      {phone.description}
                    </span>
                  </>
                }
                textContent={
                  <span className="flex min-h-11 flex-col justify-center py-1">
                    <span className={`block text-foreground ${weightClass}`}>
                      {phone.name}{' '}
                      <span className="whitespace-nowrap tabular-nums select-all">
                        {phone.displayNumber}
                      </span>
                    </span>
                    <span className="block text-sm leading-5 text-muted-foreground">
                      {phone.description}
                    </span>
                  </span>
                }
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
