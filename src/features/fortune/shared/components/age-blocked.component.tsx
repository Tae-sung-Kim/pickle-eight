import Link from 'next/link';
import { type JSX, type Ref, useId } from 'react';
import { Button } from '@/components/ui/button';
import { FORTUNE_AGE_BLOCKED_TEXTS } from '@/features/fortune/constants/fortune-notice.constant';

export type FortuneAgeBlockedComponentPropsType = Readonly<{
  /** 화면이 나타날 때 부모가 제목으로 포커스를 옮기는 데 쓴다(tabIndex -1) */
  titleRef?: Ref<HTMLHeadingElement>;
}>;

// 홈 경로. 운세 라우트 상수가 아니라 사이트 홈이다
const HOME_HREF = '/';

/**
 * 연령 안내 화면(만 14세 미만).
 * 입력한 생년월일을 다시 보이지 않고(props도 받지 않는다), 이용을 계속할 장치(보호자 확인, 다시 입력)도 없다.
 * 경고색·아이콘·일러스트 없이 담담하게 두고, 홈으로 가는 링크 하나만 둔다(AC-42, AC-45).
 */
export function FortuneAgeBlockedComponent({
  titleRef,
}: FortuneAgeBlockedComponentPropsType): JSX.Element {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className="max-w-2xl space-y-4">
      <h2
        id={titleId}
        ref={titleRef}
        tabIndex={-1}
        className="rounded-sm text-xl leading-tight font-semibold break-keep text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:text-2xl"
      >
        {FORTUNE_AGE_BLOCKED_TEXTS.title}
      </h2>
      <p className="text-sm leading-6 break-keep text-foreground sm:text-base sm:leading-7">
        {FORTUNE_AGE_BLOCKED_TEXTS.body}
      </p>
      <Button
        asChild
        variant="outline"
        className="h-11 w-full scroll-mb-48 rounded-lg break-keep transition-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:w-auto"
      >
        <Link href={HOME_HREF}>{FORTUNE_AGE_BLOCKED_TEXTS.homeLinkLabel}</Link>
      </Button>
    </section>
  );
}
