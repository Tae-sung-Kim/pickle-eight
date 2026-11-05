import type { JSX, Ref } from 'react';

import { TAROT_ORIENTATION_LABELS } from '@/features/tarot/constants/tarot-notice.constant';
import type { TarotCardType } from '@/features/tarot/types/tarot.type';
import { formatTarotCardName } from '@/features/tarot/utils/tarot-card.util';

export type TarotCardReadingComponentPropsType = {
  card: TarotCardType;
  isReversed: boolean;
  /** 'h2': 오늘의 타로(공개 후 포커스 대상). 'p': 3장 타로(위치 이름 h3 아래 일반 글자) */
  titleAs: 'h2' | 'p';
  /** titleAs="h2"일 때만 쓴다 */
  titleRef?: Ref<HTMLHeadingElement>;
};

/**
 * TarotCardReadingComponent
 * - 카드 읽기 글(이름, 방향, 키워드 3개, 요약, note). 카드 이미지는 넣지 않는다.
 * - 질문 줄과 전문가 안내는 부모(root)가 배치한다.
 */
export function TarotCardReadingComponent({
  card,
  isReversed,
  titleAs,
  titleRef,
}: TarotCardReadingComponentPropsType): JSX.Element {
  const meaning = isReversed ? card.reversed : card.upright;
  const orientationLabel = isReversed
    ? TAROT_ORIENTATION_LABELS.reversed
    : TAROT_ORIENTATION_LABELS.upright;

  // "{nameKo} ({nameEn})" 형식은 formatTarotCardName 한 곳에서 만들고, 괄호 부분만 잘라 span으로 감싼다.
  const fullName = formatTarotCardName(card);
  const nameEnPart = fullName.slice(card.nameKo.length);

  const nameContent = (
    <>
      {card.nameKo}
      <span className="font-normal text-muted-foreground">{nameEnPart}</span>
    </>
  );

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        {titleAs === 'h2' ? (
          <h2
            ref={titleRef}
            tabIndex={-1}
            className="rounded-sm text-xl leading-tight font-semibold break-keep text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none sm:text-2xl"
          >
            {nameContent}
          </h2>
        ) : (
          <p className="text-lg leading-snug font-semibold break-keep text-foreground">
            {nameContent}
          </p>
        )}
        <p className="text-sm font-semibold text-menu-tarot">
          {orientationLabel}
        </p>
      </div>

      <ul className="flex list-none flex-wrap gap-2">
        {meaning.keywords.map((keyword) => (
          <li
            key={keyword}
            className="rounded-md bg-menu-tarot/10 px-2.5 py-1 text-sm leading-5 font-medium text-menu-tarot"
          >
            {keyword}
          </li>
        ))}
      </ul>

      <p className="max-w-[68ch] text-base leading-7 text-foreground sm:text-lg sm:leading-8">
        {meaning.summary}
      </p>

      {card.note ? (
        <p className="max-w-[68ch] border-l-2 border-menu-tarot/40 pl-3 text-sm leading-7 text-foreground">
          {card.note}
        </p>
      ) : null}
    </div>
  );
}
