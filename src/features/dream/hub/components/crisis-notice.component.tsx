import type { JSX } from 'react';

import { CrisisPhoneComponent } from '@/components/common/crisis-phone.component';
import { CRISIS_PHONES } from '@/constants/crisis-phone.constant';
import {
  DREAM_CRISIS_CALL_LABEL,
  DREAM_CRISIS_OTHER_PHONES_TITLE,
  DREAM_CRISIS_PANEL_BODY,
  DREAM_CRISIS_PANEL_STORAGE_NOTICE,
  DREAM_CRISIS_PANEL_TITLE,
} from '@/features/dream/constants/dream-notice.constant';

const FOCUS_CLASS =
  'focus-visible:ring-2 focus-visible:ring-jar-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-jar focus-visible:outline-none';

export type DreamHubCrisisNoticeComponentPropsType = Readonly<{
  visible: boolean;
  otherTitleId: string;
}>;

/**
 * DreamHubCrisisNoticeComponent
 * - 검색어에서 위기 표현이 감지되면 내용을 보인다. role="status" 영역은 항상 DOM에 둔다.
 * - 결과를 막지 않고 포커스를 옮기지 않는다. 감지 결과는 저장·전송하지 않는다.
 */
export function DreamHubCrisisNoticeComponent({
  visible,
  otherTitleId,
}: DreamHubCrisisNoticeComponentPropsType): JSX.Element {
  const panelPhones = CRISIS_PHONES.filter((phone) => phone.showInCrisisPanel);
  const [mainPhone, ...otherPhones] = panelPhones;

  return (
    <div role="status">
      {visible && mainPhone ? (
        <div className="mt-4 space-y-4 rounded-panel bg-jar p-5 text-jar-foreground sm:p-6">
          <p className="text-lg font-semibold break-keep">
            {DREAM_CRISIS_PANEL_TITLE}
          </p>
          <p className="max-w-[68ch] text-sm leading-7 break-keep sm:text-base">
            {DREAM_CRISIS_PANEL_BODY}
          </p>
          <div className="flex flex-col gap-3 sm:grid sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start sm:gap-x-6">
            <CrisisPhoneComponent
              phone={mainPhone}
              linkClassName={`inline-flex h-11 w-full items-center justify-center rounded-lg bg-jar-foreground px-6 font-semibold break-keep text-jar hover:bg-jar-foreground/90 sm:w-auto ${FOCUS_CLASS}`}
              linkContent={DREAM_CRISIS_CALL_LABEL}
              textClassName="text-jar-foreground break-keep"
              textContent={
                <span className="flex h-11 items-center">
                  <span>
                    <span className="text-sm font-medium">
                      {mainPhone.name}
                    </span>{' '}
                    <span className="text-2xl leading-none font-bold whitespace-nowrap tabular-nums select-all">
                      {mainPhone.displayNumber}
                    </span>
                  </span>
                </span>
              }
            />
            <div>
              <p
                id={otherTitleId}
                className="text-sm leading-6 font-medium text-jar-muted"
              >
                {DREAM_CRISIS_OTHER_PHONES_TITLE}
              </p>
              <ul
                aria-labelledby={otherTitleId}
                className="flex flex-col gap-1"
              >
                {otherPhones.map((phone) => (
                  <li key={phone.id}>
                    <CrisisPhoneComponent
                      phone={phone}
                      linkClassName={`inline-flex min-h-11 items-center gap-2 rounded-sm text-base font-medium break-keep text-jar-foreground underline underline-offset-4 hover:decoration-2 ${FOCUS_CLASS}`}
                      linkContent={
                        <>
                          {phone.name}{' '}
                          <span className="font-semibold whitespace-nowrap">
                            {phone.displayNumber}
                          </span>
                        </>
                      }
                      textClassName="text-base font-medium break-keep text-jar-foreground"
                      textContent={
                        <span className="flex min-h-11 items-center">
                          <span>
                            {phone.name}{' '}
                            <span className="font-semibold whitespace-nowrap tabular-nums select-all">
                              {phone.displayNumber}
                            </span>
                          </span>
                        </span>
                      }
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="border-t border-jar-muted/40 pt-4 text-sm leading-6 text-jar-muted">
            {DREAM_CRISIS_PANEL_STORAGE_NOTICE}
          </p>
        </div>
      ) : null}
    </div>
  );
}
