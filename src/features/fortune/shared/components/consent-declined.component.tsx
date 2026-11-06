'use client';

import { type JSX, type Ref, useId } from 'react';
import { Button } from '@/components/ui/button';
import { FORTUNE_DECLINED_TEXTS } from '@/features/fortune/constants/fortune-notice.constant';

export type FortuneConsentDeclinedComponentPropsType = Readonly<{
  onBack: () => void;
  /** 화면 전환 때 게이트가 제목으로 포커스를 옮기는 데 쓴다 */
  titleRef?: Ref<HTMLHeadingElement>;
}>;

/**
 * 이용 불가 안내 화면. 결과·입력칸·경고색·아이콘이 없다.
 * 돌아가기는 채운 버튼이 아니라 outline이다(다시 동의하라고 재촉하는 모양을 피한다).
 */
export function FortuneConsentDeclinedComponent({
  onBack,
  titleRef,
}: FortuneConsentDeclinedComponentPropsType): JSX.Element {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className="max-w-2xl space-y-4">
      <h2
        id={titleId}
        ref={titleRef}
        tabIndex={-1}
        className="rounded-sm text-xl leading-tight font-semibold break-keep text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:text-2xl"
      >
        {FORTUNE_DECLINED_TEXTS.title}
      </h2>
      <p className="text-sm leading-6 break-keep text-foreground sm:text-base sm:leading-7">
        {FORTUNE_DECLINED_TEXTS.body}
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        className="h-11 w-full scroll-mb-48 rounded-lg break-keep transition-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:w-auto"
      >
        {FORTUNE_DECLINED_TEXTS.backButton}
      </Button>
    </section>
  );
}
