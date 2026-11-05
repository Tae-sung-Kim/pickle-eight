import { TarotCardFrameComponent } from '@/features/tarot/shared/components/card-frame.component';
import { TarotCourtMarkComponent } from '@/features/tarot/shared/components/court-mark.component';
import { TarotMajorSymbolComponent } from '@/features/tarot/shared/components/major-symbol.component';
import { TarotSuitIconComponent } from '@/features/tarot/shared/components/suit-icon.component';
import type { TarotCardType } from '@/features/tarot/types/tarot.type';
import { getTarotCardAlt } from '@/features/tarot/utils/tarot-card.util';
import { cn } from '@/lib/utils';

export type TarotCardFacePropsType = {
  card: TarotCardType;
  /** true면 SVG 전체를 rotate-180으로 뒤집고 접근성 이름도 "역방향"이 된다 */
  isReversed?: boolean;
  className?: string;
};

const COURT_MIN_RANK = 11;
const ROMAN_NUMERALS: readonly string[] = [
  '0',
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
  'XIII',
  'XIV',
  'XV',
  'XVI',
  'XVII',
  'XVIII',
  'XIX',
  'XX',
  'XXI',
];

function getMinorNumberText(rank: number): string {
  return rank === 1 ? 'A' : String(rank);
}

/**
 * 앞면 조합. 순수 SVG(훅·'use client'·framer-motion 없음)라 서버 컴포넌트에서도 쓴다.
 * 메이저: 로마 숫자 + 상징 도형. 숫자 카드: 번호 + 눈금자 + 가운데 수트 아이콘.
 * 코트 카드: 번호 자리 막대 묶음 + 이중 테두리 수트 아이콘 + 눈금자 자리 큰 막대 묶음.
 * 색은 부모에서 받은 currentColor를 쓰고, 기본으로 text-menu-tarot를 준다.
 */
export function TarotCardFaceComponent({
  card,
  isReversed = false,
  className,
}: TarotCardFacePropsType) {
  const label = getTarotCardAlt(card, isReversed);
  const frameClassName = cn(
    'text-menu-tarot',
    isReversed && 'rotate-180',
    className
  );

  if (card.arcana === 'major') {
    return (
      <TarotCardFrameComponent
        label={label}
        numberText={ROMAN_NUMERALS[card.rank] ?? String(card.rank)}
        name={card.nameKo}
        className={frameClassName}
      >
        <TarotMajorSymbolComponent rank={card.rank} />
      </TarotCardFrameComponent>
    );
  }

  const isCourt = card.rank >= COURT_MIN_RANK;

  if (isCourt) {
    return (
      <TarotCardFrameComponent
        label={label}
        numberSlot={<TarotCourtMarkComponent rank={card.rank} variant="top" />}
        name={card.nameKo}
        className={frameClassName}
      >
        {card.suit ? (
          <TarotSuitIconComponent suit={card.suit} isFramed />
        ) : null}
        <TarotCourtMarkComponent rank={card.rank} variant="side" />
      </TarotCardFrameComponent>
    );
  }

  return (
    <TarotCardFrameComponent
      label={label}
      numberText={getMinorNumberText(card.rank)}
      rulerRank={card.rank}
      name={card.nameKo}
      className={frameClassName}
    >
      {card.suit ? <TarotSuitIconComponent suit={card.suit} /> : null}
    </TarotCardFrameComponent>
  );
}
