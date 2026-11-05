'use client';

import { type JSX, type Ref, useId } from 'react';

import {
  TAROT_CRISIS_CALL_LABEL,
  TAROT_CRISIS_CONTINUE_LABEL,
  TAROT_CRISIS_NOTICE_SUB,
  TAROT_CRISIS_NOTICE_TITLE,
  TAROT_CRISIS_OTHER_PHONES_TITLE,
  TAROT_CRISIS_PANEL_BODY,
  TAROT_CRISIS_PHONE_ARIA_LABEL,
  TAROT_CRISIS_PHONES,
} from '@/features/tarot/constants/tarot-notice.constant';

export type TarotCrisisNoticeComponentPropsType = {
  /** "계속 보기" 클릭. 결과를 보여 주는 동작은 부모가 한다 */
  onContinue: () => void;
  /** 부모가 나타날 때 제목으로 포커스를 옮긴다 */
  titleRef?: Ref<HTMLHeadingElement>;
};

// jar 면 위 포커스 링: 대비 확보를 위해 jar-foreground 사용
const FOCUS_CLASS =
  'focus-visible:ring-2 focus-visible:ring-jar-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-jar focus-visible:outline-none';

/**
 * TarotCrisisNoticeComponent
 * - 위기 표현 감지 시 결과 앞에 보여 주는 안내. 모달이 아니며 결과로 가는 길을 막지 않는다.
 */
export function TarotCrisisNoticeComponent({
  onContinue,
  titleRef,
}: TarotCrisisNoticeComponentPropsType): JSX.Element {
  const titleId = useId();
  const otherTitleId = useId();
  const panelPhones = TAROT_CRISIS_PHONES.filter(
    (phone) => phone.showInCrisisPanel
  );
  const [mainPhone, ...otherPhones] = panelPhones;

  return (
    <section
      aria-labelledby={titleId}
      className="space-y-4 rounded-panel bg-jar p-5 text-jar-foreground sm:p-6"
    >
      <h2
        id={titleId}
        ref={titleRef}
        tabIndex={-1}
        className={`rounded-sm text-lg font-semibold break-keep ${FOCUS_CLASS}`}
      >
        {TAROT_CRISIS_NOTICE_TITLE}
      </h2>
      <p className="max-w-[68ch] text-sm leading-7 sm:text-base">
        {TAROT_CRISIS_PANEL_BODY}
      </p>
      <div className="flex flex-col gap-3 sm:grid sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start sm:gap-x-6">
        <a
          href={mainPhone.href}
          aria-label={TAROT_CRISIS_PHONE_ARIA_LABEL}
          className={`inline-flex h-11 w-full items-center justify-center rounded-lg bg-jar-foreground px-6 font-semibold break-keep text-jar hover:bg-jar-foreground/90 sm:w-auto ${FOCUS_CLASS}`}
        >
          {TAROT_CRISIS_CALL_LABEL}
        </a>
        <div>
          <p
            id={otherTitleId}
            className="text-sm leading-6 font-medium text-jar-muted"
          >
            {TAROT_CRISIS_OTHER_PHONES_TITLE}
          </p>
          <ul aria-labelledby={otherTitleId} className="flex flex-col gap-1">
            {otherPhones.map((phone) => (
              <li key={phone.id}>
                <a
                  href={phone.href}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-sm text-base font-medium break-keep text-jar-foreground underline underline-offset-4 hover:decoration-2 ${FOCUS_CLASS}`}
                >
                  {phone.name}{' '}
                  <span className="font-semibold whitespace-nowrap">
                    {phone.displayNumber}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-col gap-3 border-t border-jar-muted/40 pt-4 sm:flex-row sm:items-center sm:gap-4">
        <button
          type="button"
          onClick={onContinue}
          className={`inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-lg border border-jar-muted bg-transparent px-6 font-semibold break-keep text-jar-foreground hover:bg-jar-foreground/10 sm:w-auto ${FOCUS_CLASS}`}
        >
          {TAROT_CRISIS_CONTINUE_LABEL}
        </button>
        <p className="text-sm leading-6 text-jar-muted">
          {TAROT_CRISIS_NOTICE_SUB}
        </p>
      </div>
    </section>
  );
}
