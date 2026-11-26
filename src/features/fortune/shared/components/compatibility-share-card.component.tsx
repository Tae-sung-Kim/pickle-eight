import type { JSX } from 'react';
import type { FortuneCompatibilityShareBodyType } from '@/features/fortune/utils/fortune-compatibility-share.util';

/** 이름 글자 수(코드 포인트) 4자 이상이면 40px, 아니면 44px */
const NAME_LONG_LENGTH = 4;
/** 요약이 이 글자 수를 넘으면 20px로 줄인다 */
export const SUMMARY_LONG_LENGTH = 90;

/**
 * FortuneCompatibilityShareCardComponent
 * - 공유 카드 본문. 두 이름, 가운데 선과 점, 등급, 요약 한 줄만 그린다.
 * - 버튼, 링크, 이미지, 모션 없음. 카드 공통 틀은 부모가 감싼다.
 */
export function FortuneCompatibilityShareCardComponent({
  firstName,
  secondName,
  gradeName,
  summary,
}: FortuneCompatibilityShareBodyType): JSX.Element {
  const nameSize =
    Math.max(Array.from(firstName).length, Array.from(secondName).length) >=
    NAME_LONG_LENGTH
      ? 40
      : 44;
  const summarySize =
    Array.from(summary).length > SUMMARY_LONG_LENGTH ? 20 : 22;

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="grid w-full grid-cols-[1fr_72px_1fr] items-center gap-x-2">
        <p
          className="text-center font-bold text-share-card-fg"
          style={{ fontSize: nameSize, lineHeight: 1.2 }}
        >
          {firstName}
        </p>
        <div className="relative flex items-center">
          <span className="block h-0.5 w-full bg-share-card-accent-fortune" />
          <span className="absolute left-0 size-2 -translate-x-1/2 rounded-full bg-share-card-accent-fortune" />
          <span className="absolute right-0 size-2 translate-x-1/2 rounded-full bg-share-card-accent-fortune" />
        </div>
        <p
          className="text-center font-bold text-share-card-fg"
          style={{ fontSize: nameSize, lineHeight: 1.2 }}
        >
          {secondName}
        </p>
      </div>
      <p className="rounded-md border-2 border-share-card-accent-fortune px-5 py-2 text-center text-[34px] leading-tight font-bold text-share-card-accent-fortune">
        {gradeName}
      </p>
      <p
        className="line-clamp-5 w-full text-center text-share-card-fg"
        style={{ fontSize: summarySize, lineHeight: 1.55 }}
      >
        {summary}
      </p>
    </div>
  );
}
