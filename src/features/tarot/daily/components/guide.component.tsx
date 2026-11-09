import type { JSX } from 'react';

import { TarotCardFaceComponent } from '@/features/tarot/shared/components/card-face.component';
import { getTarotCardById } from '@/features/tarot/utils/tarot-card.util';

const GUIDE_TITLE = '오늘의 타로 읽는 법';
/** 정/역방향 예시 그림에 쓰는 카드 번호 (바보) */
const EXAMPLE_CARD_ID = 0;

const GUIDE_PARAGRAPHS: readonly string[] = [
  '원카드 타로는 카드 한 장을 뽑아 오늘 하루를 가볍게 돌아보는 방식입니다. 한 장만 보기 때문에 읽는 데 오래 걸리지 않고, 하루를 시작하기 전에 마음에 둘 점 하나를 떠올려 보기에 알맞습니다. 카드 이름 아래의 키워드와 요약을 읽고, 오늘의 상황과 어떻게 닿는지 천천히 떠올려 보시면 됩니다.',
  '카드는 정방향과 역방향으로 나타납니다. 정방향은 카드가 바로 선 상태이고, 역방향은 위아래가 뒤집힌 상태입니다. 역방향은 나쁜 뜻이 아니라 같은 주제를 다른 각도에서 살펴보는 해석의 렌즈로 읽습니다. 예를 들어 역방향은 속도를 늦추거나 생각을 안쪽으로 돌려 보라는 신호일 수 있습니다.',
  '분야를 고르면 같은 카드를 그 분야의 관점으로 읽을 수 있습니다. 연애·인간관계, 직업·학업, 재물·생활, 일상 조언 가운데 하나를 고르면 카드 해석에 그 분야에 맞춘 문장이 한 줄 더 나타납니다. 카드는 분야와 관계없이 무작위로 뽑히며, 분야는 같은 카드를 어느 쪽에서 바라볼지 정하는 방향일 뿐입니다. 전체를 고르면 분야 문장 없이 카드 본래의 요약만 보입니다.',
  '질문은 선택이며 해석에는 쓰이지 않습니다. 마음에 둔 물음을 적어 보면 생각을 정리하는 데 도움이 될 수 있지만, 적은 내용에 따라 카드나 문장이 달라지지는 않습니다. 오늘의 카드는 하루에 한 장으로 정해져 있어 같은 날에는 같은 카드가 유지되므로, 한 장을 곰곰이 읽는 데 시간을 쓰시기 바랍니다. 하나의 고민을 더 깊이 나누어 정리하고 싶다면 3장 타로를 이용하실 수 있습니다.',
];

const EXAMPLE_CAPTIONS = [
  { key: 'upright', label: '정방향', isReversed: false },
  { key: 'reversed', label: '역방향', isReversed: true },
] as const;

/**
 * TarotDailyGuideComponent
 * - 원카드 읽는 법, 정/역방향 설명, 바보 카드 정/역방향 예시 그림. 서버 컴포넌트.
 * - 카드 그림은 순수 SVG(TarotCardFaceComponent)라 서버에서 그린다.
 */
export function TarotDailyGuideComponent(): JSX.Element {
  const exampleCard = getTarotCardById(EXAMPLE_CARD_ID);

  return (
    <section className="space-y-4">
      <h2 className="text-xl leading-tight font-semibold break-keep text-foreground sm:text-2xl">
        {GUIDE_TITLE}
      </h2>
      <div className="space-y-3">
        {GUIDE_PARAGRAPHS.map((paragraph) => (
          <p
            key={paragraph}
            className="max-w-[68ch] text-sm leading-7 text-foreground sm:text-base"
          >
            {paragraph}
          </p>
        ))}
      </div>
      {exampleCard ? (
        <div className="flex items-start gap-6">
          {EXAMPLE_CAPTIONS.map((item) => (
            <figure key={item.key} className="flex flex-col items-center gap-2">
              <TarotCardFaceComponent
                card={exampleCard}
                isReversed={item.isReversed}
                className="w-[88px] sm:w-[104px]"
              />
              <figcaption className="text-sm font-medium text-muted-foreground">
                {item.label}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : null}
    </section>
  );
}
