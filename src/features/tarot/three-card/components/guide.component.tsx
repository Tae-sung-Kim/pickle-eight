import type { JSX } from 'react';

import { TAROT_SPREAD_POSITIONS } from '@/features/tarot/constants/tarot-spread.constant';
import { TarotCardBackComponent } from '@/features/tarot/shared/components/card-back.component';

const GUIDE_TITLE = '3장 타로 읽는 법';

const GUIDE_PARAGRAPHS: readonly string[] = [
  '3장 타로(쓰리카드 타로)는 카드 세 장을 차례로 놓고 과거, 현재, 미래의 흐름을 살펴보는 방식입니다. 한 장으로 가볍게 보는 오늘의 타로와 달리, 하나의 고민을 시간 순서로 나누어 차분히 정리해 보고 싶을 때 쓰기에 알맞습니다.',
  '첫 번째 카드는 과거로, 지금 상황에 영향을 준 지난 흐름을 돌아보는 자리입니다. 두 번째 카드는 현재로, 지금 마주한 상황과 마음을 살피는 자리입니다. 세 번째 카드는 미래로, 지금의 흐름이 이어질 때 나타날 수 있는 모습을 참고하는 자리입니다.',
  '과거, 현재, 미래 순서로 한 장씩 읽은 뒤에는 결과 아래의 흐름 이야기를 읽어 보시기 바랍니다. 이야기는 과거 카드에서 시작해 현재 카드를 거쳐 미래 카드로 이어지며, 마지막 문장이 세 장의 흐름을 한데 묶어 줍니다. 카드마다 따로 읽은 뒤 이야기를 읽으면 세 장이 어떻게 이어지는지 한눈에 볼 수 있습니다. 이야기는 고정된 문장을 이은 참고용 글이며 앞날을 알려 주는 것은 아닙니다.',
  '분야를 고르면 이야기의 관점이 달라집니다. 연애·인간관계, 직업·학업, 재물·생활, 일상 조언 중 지금 고민에 가까운 것을 고르면 과거·현재·미래를 잇는 문장이 그 분야의 말로 쓰입니다. 정해 둔 분야가 없으면 전체를 두시면 됩니다. 분야는 카드 선택에 영향을 주지 않으며, 질문도 이야기에는 쓰이지 않습니다.',
  '다시 뽑으면 지금 결과와 이야기는 사라지므로, 같은 고민으로 여러 번 뽑기보다 한 번의 결과를 차분히 돌아보는 편이 도움이 될 수 있습니다. 카드는 앞날을 알려 주는 것이 아니라 고민을 다른 시각에서 정리해 보는 참고 자료입니다.',
];

/**
 * TarotThreeCardGuideComponent
 * - 스프레드 위치 설명과 뒷면 3장 배치도(과거·현재·미래). 서버 컴포넌트.
 * - 위치 이름은 TAROT_SPREAD_POSITIONS를 그대로 쓴다.
 */
export function TarotThreeCardGuideComponent(): JSX.Element {
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
      <ol className="flex items-start gap-3">
        {TAROT_SPREAD_POSITIONS.map((position) => (
          <li key={position.key} className="flex flex-col items-center gap-2">
            <TarotCardBackComponent className="w-[88px] text-menu-tarot sm:w-[104px]" />
            <span className="text-sm font-medium text-muted-foreground">
              {position.label}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
