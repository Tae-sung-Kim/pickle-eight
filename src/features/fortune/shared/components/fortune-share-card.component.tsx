import type { JSX } from 'react';
import { FORTUNE_SHARE_LUCKY_LABELS } from '@/features/fortune/constants/fortune-share.constant';
import type { FortuneShareBodyType } from '@/features/fortune/utils/fortune-share.util';

/** 요약이 이 글자 수(코드 포인트)를 넘으면 20px로 줄인다 */
const SUMMARY_LONG_LENGTH = 90;

/**
 * FortuneShareCardComponent
 * - 공유 카드 본문. 띠·별자리 이름(있을 때), 요약 한 줄, 행운 요소만 그린다.
 * - 버튼, 링크, 이미지, 모션 없음. 카드 공통 틀은 부모가 감싼다.
 */
export function FortuneShareCardComponent({
  name,
  summary,
  lucky,
}: FortuneShareBodyType): JSX.Element {
  const summarySize =
    Array.from(summary).length > SUMMARY_LONG_LENGTH ? 20 : 22;
  const luckyRows = lucky
    ? [
        [FORTUNE_SHARE_LUCKY_LABELS.color, lucky.color],
        [FORTUNE_SHARE_LUCKY_LABELS.direction, lucky.direction],
        [FORTUNE_SHARE_LUCKY_LABELS.numbers, lucky.numbers.join(', ')],
      ]
    : [];

  return (
    <div className="flex w-full flex-col items-center gap-7">
      {name ? (
        <p className="line-clamp-2 w-full text-center text-[44px] leading-tight font-bold text-share-card-accent-fortune">
          {name}
        </p>
      ) : null}
      <p
        className="line-clamp-5 w-full text-center text-share-card-fg"
        style={{ fontSize: summarySize, lineHeight: 1.55 }}
      >
        {summary}
      </p>
      {luckyRows.length > 0 ? (
        <dl className="w-full space-y-2 border-t border-share-card-border pt-5">
          {luckyRows.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between">
              <dt className="text-base text-share-card-muted">{label}</dt>
              <dd className="text-xl font-bold text-share-card-fg">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}
