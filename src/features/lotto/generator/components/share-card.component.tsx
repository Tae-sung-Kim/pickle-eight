import type { JSX } from 'react';
import { SHARE_TEXTS } from '@/constants/share.constant';
import { LOTTO_SHARE_GAME_TEMPLATE } from '@/features/lotto/constants/lotto-share.constant';
import { LottoBallComponent } from '@/features/lotto/shared/components/ball.component';
import type { LottoShareBodyType } from '@/features/lotto/utils/lotto-share.util';
import { withUniqueKeys } from '@/lib/react-key';

/**
 * LottoGeneratorShareCardComponent
 * - 공유 카드 본문. 게임별 번호 공만 그린다(생성 조건 없음).
 * - 버튼, 링크, 이미지, 모션 없음. 카드 공통 틀은 부모가 감싼다.
 */
export function LottoGeneratorShareCardComponent({
  games,
  hiddenCount,
}: LottoShareBodyType): JSX.Element {
  return (
    <div className="flex w-full flex-col gap-2">
      {withUniqueKeys(games, (n) => n.join('-')).map(
        ({ key, item: numbers, position: index }) => (
          <div key={key} className="flex items-center gap-3">
            <span className="w-14 text-base tabular-nums text-share-card-muted">
              {LOTTO_SHARE_GAME_TEMPLATE.replace('{n}', String(index + 1))}
            </span>
            <div className="flex gap-2">
              {numbers.map((num) => (
                <LottoBallComponent key={num} number={num} />
              ))}
            </div>
          </div>
        )
      )}
      {hiddenCount > 0 ? (
        <p className="text-base text-share-card-muted">
          {SHARE_TEXTS.moreTemplate.replace('{n}', String(hiddenCount))}
        </p>
      ) : null}
    </div>
  );
}
