import type { JSX } from 'react';

import { TarotCardFaceComponent } from '@/features/tarot/shared/components/card-face.component';
import { getTarotCardById } from '@/features/tarot/utils/tarot-card.util';

const GUIDE_TITLE = '오늘의 타로 읽는 법';
/** 정/역방향 예시 그림에 쓰는 카드 번호 (바보) */
const EXAMPLE_CARD_ID = 0;

const GUIDE_PARAGRAPHS: readonly string[] = [
  '원카드 타로는 카드 한 장을 뽑아 오늘 하루를 가볍게 돌아보는 방식입니다. 카드 이름 아래의 키워드와 요약을 읽고, 오늘의 상황과 어떻게 닿는지 천천히 떠올려 보시면 됩니다.',
  '카드는 정방향과 역방향으로 나타납니다. 정방향은 카드가 바로 선 상태이고, 역방향은 위아래가 뒤집힌 상태입니다. 역방향은 나쁜 뜻이 아니라 같은 주제를 다른 각도에서 살펴보는 해석의 렌즈로 읽습니다. 예를 들어 역방향은 속도를 늦추거나 생각을 안쪽으로 돌려 보라는 신호일 수 있습니다.',
  '질문은 선택입니다. 마음에 둔 물음이 있으면 적어 보시고, 없으면 비워 두고 뽑으셔도 됩니다. 오늘의 카드는 하루에 한 장으로 정해져 있어 같은 날에는 같은 카드가 유지되므로, 한 장을 곰곰이 읽는 데 시간을 쓰시기 바랍니다.',
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
