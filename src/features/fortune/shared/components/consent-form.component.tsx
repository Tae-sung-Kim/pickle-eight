'use client';

import { AlertCircle, Info } from 'lucide-react';
import { type JSX, type Ref, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FORTUNE_CONSENT_TEXTS } from '@/features/fortune/constants/fortune-notice.constant';
import { cn } from '@/lib/utils';

export type FortuneConsentFormComponentPropsType = Readonly<{
  onGrant: () => void;
  onDecline: () => void;
  /** 화면 전환(돌아가기, 동의 다시 설정) 때 게이트가 제목으로 포커스를 옮기는 데 쓴다 */
  titleRef?: Ref<HTMLHeadingElement>;
}>;

const BUTTON_CLASS =
  'h-11 min-w-40 scroll-mb-48 rounded-lg break-keep transition-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card';

/**
 * 이용 동의 화면. 체크 3개의 상태는 이 컴포넌트의 로컬 state이며 저장하거나 Context에 올리지 않는다.
 * 화면이 바뀔 때마다 새로 만들어지므로 처음에는 항상 모두 해제 상태다.
 */
export function FortuneConsentFormComponent({
  onGrant,
  onDecline,
  titleRef,
}: FortuneConsentFormComponentPropsType): JSX.Element {
  const titleId = useId();
  const noticeId = useId();
  const checkboxRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [checkedList, setCheckedList] = useState<readonly boolean[]>(() =>
    FORTUNE_CONSENT_TEXTS.items.map(() => false)
  );
  // 세 항목을 채우지 않고 "동의하고 시작"을 누른 적이 있는지(안내를 오류 모양으로 바꾼다)
  const [hasBlockedAttempt, setHasBlockedAttempt] = useState(false);

  const isAllChecked = checkedList.every(Boolean);

  function handleCheckedChange(index: number, isChecked: boolean): void {
    setCheckedList((prev) =>
      prev.map((value, itemIndex) => (itemIndex === index ? isChecked : value))
    );
  }

  function handleGrantClick(): void {
    if (!isAllChecked) {
      // 진행하지 않는다. 안내를 오류 모양으로 바꾸고 첫 미선택 항목으로 포커스를 옮긴다
      setHasBlockedAttempt(true);
      const firstUncheckedIndex = checkedList.findIndex((value) => !value);
      checkboxRefs.current[firstUncheckedIndex]?.focus();
      return;
    }
    onGrant();
  }

  return (
    <section aria-labelledby={titleId} className="max-w-2xl space-y-4">
      <h2
        id={titleId}
        ref={titleRef}
        tabIndex={-1}
        className="rounded-sm text-xl leading-tight font-semibold break-keep text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:text-2xl"
      >
        {FORTUNE_CONSENT_TEXTS.title}
      </h2>
      <p className="text-sm leading-6 break-keep text-muted-foreground sm:text-base">
        {FORTUNE_CONSENT_TEXTS.intro}
      </p>

      <fieldset className="min-w-0 space-y-2">
        <legend className="sr-only">
          {FORTUNE_CONSENT_TEXTS.fieldsetLegend}
        </legend>
        {FORTUNE_CONSENT_TEXTS.items.map((item, index) => (
          <label
            key={item}
            className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-border bg-background px-4 py-3 hover:border-primary/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:border-primary"
          >
            <input
              type="checkbox"
              ref={(element) => {
                checkboxRefs.current[index] = element;
              }}
              checked={checkedList[index]}
              onChange={(event) =>
                handleCheckedChange(index, event.target.checked)
              }
              className="mt-0.5 size-5 shrink-0 scroll-mb-48 accent-primary outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />
            <span className="text-sm leading-6 break-keep text-foreground sm:text-base sm:leading-7">
              {item}
            </span>
          </label>
        ))}
      </fieldset>

      {/* 진행 불가 안내: 세 항목을 모두 고르기 전까지 항상 보인다. live 영역은 항상 두고 내용만 바꾼다 */}
      <div aria-live="polite">
        {isAllChecked ? null : (
          <p
            // key가 바뀌면 새 노드로 추가되어 오류 모양으로 바뀔 때 다시 읽힌다
            key={hasBlockedAttempt ? 'blocked' : 'hint'}
            id={noticeId}
            className={cn(
              'flex items-start gap-2 text-sm leading-6 break-keep',
              hasBlockedAttempt ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {hasBlockedAttempt ? (
              <AlertCircle
                aria-hidden="true"
                className="mt-1 size-4 shrink-0"
              />
            ) : (
              <Info aria-hidden="true" className="mt-1 size-4 shrink-0" />
            )}
            <span>{FORTUNE_CONSENT_TEXTS.blockedNotice}</span>
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
        {/* aria-disabled: 포커스와 누르기는 가능하고, 누르면 진행하지 않고 안내한다 */}
        <Button
          type="button"
          aria-disabled={!isAllChecked}
          aria-describedby={isAllChecked ? undefined : noticeId}
          onClick={handleGrantClick}
          className={cn(BUTTON_CLASS, !isAllChecked && 'opacity-60')}
        >
          {FORTUNE_CONSENT_TEXTS.grantButton}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onDecline}
          className={BUTTON_CLASS}
        >
          {FORTUNE_CONSENT_TEXTS.declineButton}
        </Button>
      </div>

      <p className="text-xs leading-5 break-keep text-muted-foreground">
        {FORTUNE_CONSENT_TEXTS.storageNotice}
      </p>
    </section>
  );
}
