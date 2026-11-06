import Link from 'next/link';
import type { JSX } from 'react';
import {
  FORTUNE_LOTTO_LINK_HREF,
  FORTUNE_LOTTO_LINK_LABEL,
  FORTUNE_LOTTO_NOTICE,
} from '@/features/fortune/constants/fortune-notice.constant';
import type { FortuneLuckyType } from '@/features/fortune/types/fortune.type';

// 행운 요소 항목 이름. ui-ux-design.md "승인됨(2026-11-05)" 결과 항목 이름. 운세 상수 파일에는 아직 없어 이 파일에 둔다
const LUCKY_TEXTS = {
  color: '행운의 색',
  direction: '행운의 방향',
  numbers: '오늘의 행운 숫자',
} as const;

export type FortuneLuckyComponentPropsType = Readonly<{
  lucky: FortuneLuckyType;
}>;

/**
 * 행운 요소: 행운의 색·방향·오늘의 행운 숫자, 로또 고지, 로또 번호 생성기 링크.
 * - 색은 이름만 글자로 보인다(색 견본 없음). 행운 숫자는 1~2개이고 원·공 안에 넣지 않는다(AC-35, AC-36).
 * - 로또 고지는 접거나 숨기지 않는다. 링크는 쿼리 없이 `/lotto/generator`, 버튼 모양이 아닌 글자 링크다.
 */
export function FortuneLuckyComponent({
  lucky,
}: FortuneLuckyComponentPropsType): JSX.Element {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-background p-4">
      <dl className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <dt className="text-sm leading-5 text-muted-foreground">
            {LUCKY_TEXTS.color}
          </dt>
          <dd className="text-lg leading-snug font-semibold break-keep text-foreground">
            {lucky.color}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-sm leading-5 text-muted-foreground">
            {LUCKY_TEXTS.direction}
          </dt>
          <dd className="text-lg leading-snug font-semibold break-keep text-foreground">
            {lucky.direction}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-sm leading-5 text-muted-foreground">
            {LUCKY_TEXTS.numbers}
          </dt>
          <dd className="flex gap-4 text-3xl leading-none font-bold text-foreground tabular-nums">
            {lucky.numbers.map((value) => (
              <span key={value}>{value}</span>
            ))}
          </dd>
        </div>
      </dl>
      <p className="text-sm leading-6 break-keep text-muted-foreground">
        {FORTUNE_LOTTO_NOTICE}
      </p>
      <Link
        href={FORTUNE_LOTTO_LINK_HREF}
        className="inline-flex min-h-11 scroll-mb-48 items-center rounded-sm text-base font-medium break-keep text-primary underline underline-offset-4 hover:decoration-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
      >
        {FORTUNE_LOTTO_LINK_LABEL}
      </Link>
    </div>
  );
}
